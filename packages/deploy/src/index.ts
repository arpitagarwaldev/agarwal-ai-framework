/**
 * @agarwal-ai/deploy
 * Deployment Management — Feature flags, canary releases, rollback, health checks, blue-green
 */

import { generateId } from "@agarwal-ai/core";

// ─── Types ───────────────────────────────────────────────────────────────────

export type DeployStrategy = "direct" | "canary" | "blue-green" | "rolling" | "shadow";
export type DeployStatus = "pending" | "deploying" | "healthy" | "degraded" | "failed" | "rolled-back";
export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

export interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  percentage: number; // 0-100 rollout percentage
  rules?: FlagRule[];
  createdAt: number;
  updatedAt: number;
}

export interface FlagRule {
  attribute: string;
  operator: "eq" | "neq" | "in" | "nin" | "gt" | "lt" | "contains" | "regex";
  value: unknown;
}

export interface Deployment {
  id: string;
  version: string;
  strategy: DeployStrategy;
  status: DeployStatus;
  percentage: number; // current traffic percentage
  startedAt: number;
  completedAt?: number;
  metadata: Record<string, unknown>;
  healthChecks: HealthCheck[];
}

export interface HealthCheck {
  timestamp: number;
  status: HealthStatus;
  latencyMs: number;
  errorRate: number;
  details?: Record<string, unknown>;
}

export interface CanaryConfig {
  stages: number[]; // e.g., [1, 5, 25, 50, 100]
  intervalMs: number; // time between promotions
  errorThreshold: number; // max error rate (0-1) before rollback
  latencyThreshold: number; // max p95 latency before rollback
  minSamples: number; // minimum requests before evaluating
}

export interface RollbackRecord {
  id: string;
  deploymentId: string;
  reason: string;
  triggeredAt: number;
  triggeredBy: "auto" | "manual" | string;
  previousVersion: string;
}

// ─── Feature Flag Manager ────────────────────────────────────────────────────

export class FeatureFlagManager {
  private flags: Map<string, FeatureFlag> = new Map();

  /** Create a feature flag */
  create(name: string, enabled = false, percentage = 100): string {
    const id = generateId("flag");
    this.flags.set(id, { id, name, enabled, percentage, rules: [], createdAt: Date.now(), updatedAt: Date.now() });
    return id;
  }

  /** Check if flag is active for a given context */
  isEnabled(flagId: string, context?: Record<string, unknown>): boolean {
    const flag = this.flags.get(flagId);
    if (!flag || !flag.enabled) return false;

    // Percentage rollout
    if (flag.percentage < 100) {
      const hash = this.hashContext(flagId, context);
      if (hash > flag.percentage) return false;
    }

    // Rule evaluation
    if (flag.rules && flag.rules.length > 0 && context) {
      return flag.rules.every(rule => this.evaluateRule(rule, context));
    }

    return true;
  }

  /** Set flag state */
  setEnabled(flagId: string, enabled: boolean): void {
    const flag = this.flags.get(flagId);
    if (flag) { flag.enabled = enabled; flag.updatedAt = Date.now(); }
  }

  /** Set rollout percentage */
  setPercentage(flagId: string, percentage: number): void {
    const flag = this.flags.get(flagId);
    if (flag) { flag.percentage = Math.max(0, Math.min(100, percentage)); flag.updatedAt = Date.now(); }
  }

  /** Add targeting rule */
  addRule(flagId: string, rule: FlagRule): void {
    const flag = this.flags.get(flagId);
    if (flag) { flag.rules = flag.rules || []; flag.rules.push(rule); flag.updatedAt = Date.now(); }
  }

  /** Get all flags */
  getAll(): FeatureFlag[] { return Array.from(this.flags.values()); }

  /** Delete a flag */
  delete(flagId: string): void { this.flags.delete(flagId); }

  private hashContext(flagId: string, context?: Record<string, unknown>): number {
    const key = flagId + JSON.stringify(context || {});
    let hash = 0;
    for (let i = 0; i < key.length; i++) { hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0; }
    return Math.abs(hash) % 100;
  }

  private evaluateRule(rule: FlagRule, context: Record<string, unknown>): boolean {
    const value = context[rule.attribute];
    switch (rule.operator) {
      case "eq": return value === rule.value;
      case "neq": return value !== rule.value;
      case "in": return Array.isArray(rule.value) && (rule.value as unknown[]).includes(value);
      case "nin": return Array.isArray(rule.value) && !(rule.value as unknown[]).includes(value);
      case "gt": return typeof value === "number" && value > (rule.value as number);
      case "lt": return typeof value === "number" && value < (rule.value as number);
      case "contains": return typeof value === "string" && value.includes(rule.value as string);
      case "regex": return typeof value === "string" && new RegExp(rule.value as string).test(value);
      default: return true;
    }
  }
}

// ─── Canary Deployer ─────────────────────────────────────────────────────────

export class CanaryDeployer {
  private config: CanaryConfig;
  private deployment?: Deployment;
  private currentStage = 0;
  private rollbacks: RollbackRecord[] = [];

  constructor(config?: Partial<CanaryConfig>) {
    this.config = {
      stages: config?.stages || [1, 5, 25, 50, 100],
      intervalMs: config?.intervalMs || 300000, // 5 min
      errorThreshold: config?.errorThreshold || 0.05, // 5%
      latencyThreshold: config?.latencyThreshold || 5000, // 5s
      minSamples: config?.minSamples || 100,
    };
  }

  /** Start a canary deployment */
  start(version: string, metadata?: Record<string, unknown>): Deployment {
    this.currentStage = 0;
    this.deployment = {
      id: generateId("deploy"),
      version,
      strategy: "canary",
      status: "deploying",
      percentage: this.config.stages[0],
      startedAt: Date.now(),
      metadata: metadata || {},
      healthChecks: [],
    };
    return this.deployment;
  }

  /** Report a health check */
  reportHealth(status: HealthStatus, latencyMs: number, errorRate: number): { action: "promote" | "hold" | "rollback"; reason: string } {
    if (!this.deployment) return { action: "hold", reason: "No active deployment" };

    this.deployment.healthChecks.push({ timestamp: Date.now(), status, latencyMs, errorRate });

    // Check for rollback conditions
    if (errorRate > this.config.errorThreshold) {
      this.rollback("Error rate exceeded threshold");
      return { action: "rollback", reason: `Error rate ${(errorRate * 100).toFixed(1)}% > ${(this.config.errorThreshold * 100)}%` };
    }
    if (latencyMs > this.config.latencyThreshold) {
      this.rollback("Latency exceeded threshold");
      return { action: "rollback", reason: `Latency ${latencyMs}ms > ${this.config.latencyThreshold}ms` };
    }
    if (status === "unhealthy") {
      this.rollback("Unhealthy status reported");
      return { action: "rollback", reason: "Service reported unhealthy" };
    }

    // Check for promotion
    if (this.deployment.healthChecks.length >= this.config.minSamples / 10) {
      return { action: "promote", reason: "Health checks passing" };
    }

    return { action: "hold", reason: "Collecting more samples" };
  }

  /** Promote to next canary stage */
  promote(): { promoted: boolean; percentage: number; complete: boolean } {
    if (!this.deployment) return { promoted: false, percentage: 0, complete: false };

    this.currentStage++;
    if (this.currentStage >= this.config.stages.length) {
      this.deployment.status = "healthy";
      this.deployment.percentage = 100;
      this.deployment.completedAt = Date.now();
      return { promoted: true, percentage: 100, complete: true };
    }

    this.deployment.percentage = this.config.stages[this.currentStage];
    return { promoted: true, percentage: this.deployment.percentage, complete: false };
  }

  /** Rollback the deployment */
  rollback(reason: string): RollbackRecord {
    const record: RollbackRecord = {
      id: generateId("rb"),
      deploymentId: this.deployment?.id || "unknown",
      reason,
      triggeredAt: Date.now(),
      triggeredBy: "auto",
      previousVersion: this.deployment?.version || "unknown",
    };
    this.rollbacks.push(record);
    if (this.deployment) {
      this.deployment.status = "rolled-back";
      this.deployment.percentage = 0;
      this.deployment.completedAt = Date.now();
    }
    return record;
  }

  /** Get current deployment */
  getDeployment(): Deployment | undefined { return this.deployment; }

  /** Get rollback history */
  getRollbacks(): readonly RollbackRecord[] { return this.rollbacks; }
}

// ─── Health Monitor ──────────────────────────────────────────────────────────

export class HealthMonitor {
  private checks: Array<{ name: string; fn: () => Promise<{ healthy: boolean; latencyMs: number; details?: Record<string, unknown> }> }> = [];
  private history: Array<{ timestamp: number; results: Record<string, HealthCheck> }> = [];

  /** Register a health check */
  register(name: string, fn: () => Promise<{ healthy: boolean; latencyMs: number; details?: Record<string, unknown> }>): this {
    this.checks.push({ name, fn });
    return this;
  }

  /** Run all health checks */
  async check(): Promise<{ overall: HealthStatus; checks: Record<string, HealthCheck> }> {
    const results: Record<string, HealthCheck> = {};
    let unhealthyCount = 0;

    for (const { name, fn } of this.checks) {
      const start = Date.now();
      try {
        const result = await fn();
        results[name] = {
          timestamp: Date.now(),
          status: result.healthy ? "healthy" : "unhealthy",
          latencyMs: result.latencyMs,
          errorRate: result.healthy ? 0 : 1,
          details: result.details,
        };
        if (!result.healthy) unhealthyCount++;
      } catch (error) {
        results[name] = {
          timestamp: Date.now(),
          status: "unhealthy",
          latencyMs: Date.now() - start,
          errorRate: 1,
          details: { error: String(error) },
        };
        unhealthyCount++;
      }
    }

    this.history.push({ timestamp: Date.now(), results });
    if (this.history.length > 1000) this.history.shift();

    const overall: HealthStatus = unhealthyCount === 0 ? "healthy" : unhealthyCount < this.checks.length ? "degraded" : "unhealthy";
    return { overall, checks: results };
  }

  /** Get health history */
  getHistory(limit = 50): typeof this.history { return this.history.slice(-limit); }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createFeatureFlags(): FeatureFlagManager { return new FeatureFlagManager(); }
export function createCanaryDeployer(config?: Partial<CanaryConfig>): CanaryDeployer { return new CanaryDeployer(config); }
export function createHealthMonitor(): HealthMonitor { return new HealthMonitor(); }
