/**
 * @agarwal-ai/observability
 * Full-stack observability — tracing, structured logging, alerting, cost tracking, latency monitoring
 */

import { generateId } from "@agarwal-ai/core";

// ─── Types ───────────────────────────────────────────────────────────────────

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type SpanStatus = "ok" | "error" | "timeout";

export interface Span {
  id: string;
  traceId: string;
  parentId?: string;
  name: string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  status: SpanStatus;
  attributes: Record<string, unknown>;
  events: SpanEvent[];
}

export interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: Record<string, unknown>;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  traceId?: string;
  spanId?: string;
  agentId?: string;
}

export interface Alert {
  id: string;
  timestamp: number;
  severity: AlertSeverity;
  title: string;
  message: string;
  source: string;
  acknowledged: boolean;
  metadata?: Record<string, unknown>;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: (metrics: MetricSnapshot) => boolean;
  severity: AlertSeverity;
  message: string;
  cooldownMs: number;
  lastTriggered?: number;
}

export interface MetricSnapshot {
  errorRate: number;
  latencyP50Ms: number;
  latencyP95Ms: number;
  latencyP99Ms: number;
  requestsPerMinute: number;
  tokenUsage: number;
  costUSD: number;
  activeAgents: number;
  queueDepth: number;
}

export interface CostTracker {
  totalUSD: number;
  byProvider: Record<string, number>;
  byAgent: Record<string, number>;
  byModel: Record<string, number>;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

// ─── Tracer ──────────────────────────────────────────────────────────────────

export class Tracer {
  private spans: Map<string, Span> = new Map();
  private traces: Map<string, string[]> = new Map(); // traceId → spanIds

  /** Start a new trace */
  startTrace(name: string, attributes?: Record<string, unknown>): Span {
    const traceId = generateId("trace");
    return this.startSpan(name, traceId, undefined, attributes);
  }

  /** Start a span within a trace */
  startSpan(name: string, traceId: string, parentId?: string, attributes?: Record<string, unknown>): Span {
    const span: Span = {
      id: generateId("span"),
      traceId,
      parentId,
      name,
      startTime: Date.now(),
      status: "ok",
      attributes: attributes || {},
      events: [],
    };
    this.spans.set(span.id, span);
    const traceSpans = this.traces.get(traceId) || [];
    traceSpans.push(span.id);
    this.traces.set(traceId, traceSpans);
    return span;
  }

  /** End a span */
  endSpan(spanId: string, status?: SpanStatus, attributes?: Record<string, unknown>): void {
    const span = this.spans.get(spanId);
    if (!span) return;
    span.endTime = Date.now();
    span.durationMs = span.endTime - span.startTime;
    if (status) span.status = status;
    if (attributes) Object.assign(span.attributes, attributes);
  }

  /** Add event to a span */
  addEvent(spanId: string, name: string, attributes?: Record<string, unknown>): void {
    const span = this.spans.get(spanId);
    if (!span) return;
    span.events.push({ name, timestamp: Date.now(), attributes });
  }

  /** Get full trace */
  getTrace(traceId: string): Span[] {
    const spanIds = this.traces.get(traceId) || [];
    return spanIds.map(id => this.spans.get(id)!).filter(Boolean);
  }

  /** Get span by ID */
  getSpan(spanId: string): Span | undefined {
    return this.spans.get(spanId);
  }

  /** Measure an async operation */
  async measure<T>(name: string, traceId: string, fn: () => Promise<T>, attributes?: Record<string, unknown>): Promise<T> {
    const span = this.startSpan(name, traceId, undefined, attributes);
    try {
      const result = await fn();
      this.endSpan(span.id, "ok");
      return result;
    } catch (error) {
      this.endSpan(span.id, "error", { error: String(error) });
      throw error;
    }
  }
}

// ─── Logger ──────────────────────────────────────────────────────────────────

export interface LoggerConfig {
  level: LogLevel;
  format: "json" | "text";
  destination: "console" | "buffer" | "custom";
  customHandler?: (entry: LogEntry) => void;
  maxBufferSize?: number;
}

export class Logger {
  private config: LoggerConfig;
  private buffer: LogEntry[] = [];
  private levels = ["debug", "info", "warn", "error", "fatal"];

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      level: config?.level || "info",
      format: config?.format || "json",
      destination: config?.destination || "console",
      customHandler: config?.customHandler,
      maxBufferSize: config?.maxBufferSize || 10000,
    };
  }

  debug(msg: string, ctx?: Record<string, unknown>) { this.log("debug", msg, ctx); }
  info(msg: string, ctx?: Record<string, unknown>) { this.log("info", msg, ctx); }
  warn(msg: string, ctx?: Record<string, unknown>) { this.log("warn", msg, ctx); }
  error(msg: string, ctx?: Record<string, unknown>) { this.log("error", msg, ctx); }
  fatal(msg: string, ctx?: Record<string, unknown>) { this.log("fatal", msg, ctx); }

  /** Create child logger with bound context */
  child(context: Record<string, unknown>): Logger {
    const child = new Logger(this.config);
    child.log = (level, msg, ctx) => this.log(level, msg, { ...context, ...ctx });
    return child;
  }

  /** Get buffered logs */
  getBuffer(limit?: number): LogEntry[] {
    return limit ? this.buffer.slice(-limit) : [...this.buffer];
  }

  /** Flush buffer */
  flush(): LogEntry[] {
    const entries = [...this.buffer];
    this.buffer = [];
    return entries;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (this.levels.indexOf(level) < this.levels.indexOf(this.config.level)) return;

    const entry: LogEntry = {
      id: generateId("log"),
      timestamp: Date.now(),
      level,
      message,
      context,
      agentId: context?.agentId as string,
      traceId: context?.traceId as string,
      spanId: context?.spanId as string,
    };

    if (this.config.destination === "buffer" || this.config.destination === "console") {
      this.buffer.push(entry);
      if (this.buffer.length > (this.config.maxBufferSize || 10000)) {
        this.buffer.shift();
      }
    }

    if (this.config.destination === "console") {
      const formatted = this.config.format === "json"
        ? JSON.stringify(entry)
        : `[${level.toUpperCase()}] ${message}${context ? " " + JSON.stringify(context) : ""}`;
      console.log(formatted);
    }

    if (this.config.customHandler) {
      this.config.customHandler(entry);
    }
  }
}

// ─── Alert Manager ───────────────────────────────────────────────────────────

export class AlertManager {
  private rules: AlertRule[] = [];
  private alerts: Alert[] = [];
  private handlers: Array<(alert: Alert) => void> = [];

  /** Add an alert rule */
  addRule(rule: Omit<AlertRule, "id">): string {
    const id = generateId("rule");
    this.rules.push({ ...rule, id });
    return id;
  }

  /** Register alert handler (webhook, email, slack, etc.) */
  onAlert(handler: (alert: Alert) => void): void {
    this.handlers.push(handler);
  }

  /** Evaluate all rules against current metrics */
  evaluate(metrics: MetricSnapshot): Alert[] {
    const triggered: Alert[] = [];
    const now = Date.now();

    for (const rule of this.rules) {
      if (rule.lastTriggered && (now - rule.lastTriggered) < rule.cooldownMs) continue;

      if (rule.condition(metrics)) {
        const alert: Alert = {
          id: generateId("alert"),
          timestamp: now,
          severity: rule.severity,
          title: rule.name,
          message: rule.message,
          source: "alert-manager",
          acknowledged: false,
          metadata: { metrics },
        };
        this.alerts.push(alert);
        triggered.push(alert);
        rule.lastTriggered = now;
        this.handlers.forEach(h => h(alert));
      }
    }

    return triggered;
  }

  /** Get active (unacknowledged) alerts */
  getActive(): Alert[] {
    return this.alerts.filter(a => !a.acknowledged);
  }

  /** Acknowledge an alert */
  acknowledge(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) alert.acknowledged = true;
  }
}

// ─── Cost Monitor ────────────────────────────────────────────────────────────

export class CostMonitor {
  private entries: Array<{ timestamp: number; provider: string; agent: string; model: string; cost: number }> = [];
  private budget?: number;

  constructor(monthlyBudgetUSD?: number) {
    this.budget = monthlyBudgetUSD;
  }

  /** Record a cost event */
  record(provider: string, agent: string, model: string, costUSD: number): void {
    this.entries.push({ timestamp: Date.now(), provider, agent, model, cost: costUSD });
  }

  /** Get cost breakdown */
  getBreakdown(): CostTracker {
    const now = Date.now();
    const startOfDay = new Date().setHours(0, 0, 0, 0);
    const startOfWeek = now - 7 * 24 * 60 * 60 * 1000;
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();

    const tracker: CostTracker = { totalUSD: 0, byProvider: {}, byAgent: {}, byModel: {}, today: 0, thisWeek: 0, thisMonth: 0 };

    for (const e of this.entries) {
      tracker.totalUSD += e.cost;
      tracker.byProvider[e.provider] = (tracker.byProvider[e.provider] || 0) + e.cost;
      tracker.byAgent[e.agent] = (tracker.byAgent[e.agent] || 0) + e.cost;
      tracker.byModel[e.model] = (tracker.byModel[e.model] || 0) + e.cost;
      if (e.timestamp >= startOfDay) tracker.today += e.cost;
      if (e.timestamp >= startOfWeek) tracker.thisWeek += e.cost;
      if (e.timestamp >= startOfMonth) tracker.thisMonth += e.cost;
    }

    return tracker;
  }

  /** Check if budget exceeded */
  isBudgetExceeded(): boolean {
    if (!this.budget) return false;
    return this.getBreakdown().thisMonth >= this.budget;
  }

  /** Get remaining budget */
  getRemainingBudget(): number | null {
    if (!this.budget) return null;
    return Math.max(0, this.budget - this.getBreakdown().thisMonth);
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createTracer(): Tracer { return new Tracer(); }
export function createLogger(config?: Partial<LoggerConfig>): Logger { return new Logger(config); }
export function createAlertManager(): AlertManager { return new AlertManager(); }
export function createCostMonitor(budgetUSD?: number): CostMonitor { return new CostMonitor(budgetUSD); }
