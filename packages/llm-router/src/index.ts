/**
 * @agarwal-ai/llm-router
 * Intelligent LLM Routing — Cost optimization, latency routing, model selection, A/B testing, fallback chains
 */

import { generateId } from "@agarwal-ai/core";

// ─── Types ───────────────────────────────────────────────────────────────────

export type RoutingStrategy = "cost" | "latency" | "quality" | "balanced" | "round-robin" | "ab-test" | "custom";

export interface ModelEndpoint {
  id: string;
  name: string;
  provider: string;
  model: string;
  costPer1kInput: number;
  costPer1kOutput: number;
  avgLatencyMs: number;
  qualityScore: number; // 0-100
  maxTokens: number;
  rateLimit: number; // requests per minute
  enabled: boolean;
  weight?: number; // for weighted routing
  tags?: string[];
}

export interface RoutingRequest {
  prompt: string;
  maxTokens?: number;
  requiredCapabilities?: string[];
  maxCostUSD?: number;
  maxLatencyMs?: number;
  minQuality?: number;
  preferredProviders?: string[];
  excludeProviders?: string[];
  abTestGroup?: string;
}

export interface RoutingDecision {
  endpoint: ModelEndpoint;
  reason: string;
  estimatedCost: number;
  estimatedLatency: number;
  alternatives: ModelEndpoint[];
}

export interface ABTestConfig {
  id: string;
  name: string;
  variants: Array<{ name: string; endpointId: string; weight: number }>;
  metrics: string[];
  startTime: number;
  endTime?: number;
}

export interface ABTestResult {
  testId: string;
  variant: string;
  endpointId: string;
  latencyMs: number;
  success: boolean;
  score?: number;
  timestamp: number;
}

export interface RouterStats {
  totalRequests: number;
  byEndpoint: Record<string, { requests: number; avgLatencyMs: number; errorRate: number; totalCostUSD: number }>;
  byStrategy: Record<string, number>;
}

// ─── LLM Router ──────────────────────────────────────────────────────────────

export class LLMRouter {
  private endpoints: Map<string, ModelEndpoint> = new Map();
  private strategy: RoutingStrategy;
  private abTests: Map<string, ABTestConfig> = new Map();
  private abResults: ABTestResult[] = [];
  private stats: RouterStats = { totalRequests: 0, byEndpoint: {}, byStrategy: {} };
  private currentIndex = 0; // for round-robin
  private customRouter?: (request: RoutingRequest, endpoints: ModelEndpoint[]) => ModelEndpoint | undefined;

  constructor(strategy: RoutingStrategy = "balanced") {
    this.strategy = strategy;
  }

  /** Add a model endpoint */
  addEndpoint(endpoint: Omit<ModelEndpoint, "id">): string {
    const id = generateId("ep");
    this.endpoints.set(id, { ...endpoint, id });
    return id;
  }

  /** Remove an endpoint */
  removeEndpoint(id: string): void { this.endpoints.delete(id); }

  /** Enable/disable endpoint */
  setEnabled(id: string, enabled: boolean): void {
    const ep = this.endpoints.get(id);
    if (ep) ep.enabled = enabled;
  }

  /** Set routing strategy */
  setStrategy(strategy: RoutingStrategy): void { this.strategy = strategy; }

  /** Set custom routing function */
  setCustomRouter(fn: (req: RoutingRequest, endpoints: ModelEndpoint[]) => ModelEndpoint | undefined): void {
    this.customRouter = fn;
  }

  /** Route a request to the best endpoint */
  route(request: RoutingRequest): RoutingDecision {
    let available = Array.from(this.endpoints.values()).filter(ep => ep.enabled);

    // Apply filters
    if (request.excludeProviders?.length) {
      available = available.filter(ep => !request.excludeProviders!.includes(ep.provider));
    }
    if (request.preferredProviders?.length) {
      const preferred = available.filter(ep => request.preferredProviders!.includes(ep.provider));
      if (preferred.length > 0) available = preferred;
    }
    if (request.maxCostUSD) {
      const estimatedTokens = (request.prompt.length / 4) + (request.maxTokens || 1000);
      available = available.filter(ep => {
        const cost = (estimatedTokens / 1000) * (ep.costPer1kInput + ep.costPer1kOutput) / 2;
        return cost <= request.maxCostUSD!;
      });
    }
    if (request.maxLatencyMs) {
      available = available.filter(ep => ep.avgLatencyMs <= request.maxLatencyMs!);
    }
    if (request.minQuality) {
      available = available.filter(ep => ep.qualityScore >= request.minQuality!);
    }
    if (request.requiredCapabilities?.length) {
      available = available.filter(ep => request.requiredCapabilities!.every(c => ep.tags?.includes(c)));
    }

    if (available.length === 0) {
      throw new Error("No endpoints available matching request constraints");
    }

    let selected: ModelEndpoint;
    let reason: string;

    switch (this.strategy) {
      case "cost":
        available.sort((a, b) => (a.costPer1kInput + a.costPer1kOutput) - (b.costPer1kInput + b.costPer1kOutput));
        selected = available[0];
        reason = "Cheapest endpoint";
        break;

      case "latency":
        available.sort((a, b) => a.avgLatencyMs - b.avgLatencyMs);
        selected = available[0];
        reason = "Lowest latency";
        break;

      case "quality":
        available.sort((a, b) => b.qualityScore - a.qualityScore);
        selected = available[0];
        reason = "Highest quality score";
        break;

      case "balanced": {
        // Score = quality * 0.4 + (1/cost) * 0.3 + (1/latency) * 0.3
        const maxCost = Math.max(...available.map(e => e.costPer1kInput + e.costPer1kOutput));
        const maxLatency = Math.max(...available.map(e => e.avgLatencyMs));
        available.sort((a, b) => {
          const scoreA = (a.qualityScore / 100) * 0.4 + (1 - (a.costPer1kInput + a.costPer1kOutput) / maxCost) * 0.3 + (1 - a.avgLatencyMs / maxLatency) * 0.3;
          const scoreB = (b.qualityScore / 100) * 0.4 + (1 - (b.costPer1kInput + b.costPer1kOutput) / maxCost) * 0.3 + (1 - b.avgLatencyMs / maxLatency) * 0.3;
          return scoreB - scoreA;
        });
        selected = available[0];
        reason = "Best balance of quality, cost, and latency";
        break;
      }

      case "round-robin":
        selected = available[this.currentIndex % available.length];
        this.currentIndex++;
        reason = "Round-robin rotation";
        break;

      case "ab-test": {
        const activeTest = Array.from(this.abTests.values()).find(t => !t.endTime || t.endTime > Date.now());
        if (activeTest) {
          const variant = this.selectABVariant(activeTest, request.abTestGroup);
          const ep = this.endpoints.get(variant.endpointId);
          if (ep && ep.enabled) {
            selected = ep;
            reason = `A/B test "${activeTest.name}" → variant "${variant.name}"`;
            break;
          }
        }
        selected = available[0];
        reason = "No active A/B test, using first available";
        break;
      }

      case "custom":
        if (this.customRouter) {
          const result = this.customRouter(request, available);
          selected = result || available[0];
          reason = result ? "Custom routing logic" : "Custom router returned null, using fallback";
        } else {
          selected = available[0];
          reason = "No custom router configured";
        }
        break;

      default:
        selected = available[0];
        reason = "Default selection";
    }

    // Update stats
    this.stats.totalRequests++;
    this.stats.byStrategy[this.strategy] = (this.stats.byStrategy[this.strategy] || 0) + 1;
    if (!this.stats.byEndpoint[selected.id]) {
      this.stats.byEndpoint[selected.id] = { requests: 0, avgLatencyMs: 0, errorRate: 0, totalCostUSD: 0 };
    }
    this.stats.byEndpoint[selected.id].requests++;

    const estimatedTokens = (request.prompt.length / 4) + (request.maxTokens || 1000);
    const estimatedCost = (estimatedTokens / 1000) * (selected.costPer1kInput + selected.costPer1kOutput) / 2;

    return {
      endpoint: selected,
      reason,
      estimatedCost,
      estimatedLatency: selected.avgLatencyMs,
      alternatives: available.filter(e => e.id !== selected.id).slice(0, 3),
    };
  }

  /** Create an A/B test */
  createABTest(config: Omit<ABTestConfig, "id" | "startTime">): string {
    const id = generateId("ab");
    this.abTests.set(id, { ...config, id, startTime: Date.now() });
    return id;
  }

  /** Record A/B test result */
  recordABResult(result: ABTestResult): void {
    this.abResults.push(result);
  }

  /** Get A/B test analysis */
  analyzeABTest(testId: string): Record<string, { count: number; avgLatency: number; successRate: number; avgScore: number }> {
    const results = this.abResults.filter(r => r.testId === testId);
    const byVariant: Record<string, ABTestResult[]> = {};
    for (const r of results) {
      if (!byVariant[r.variant]) byVariant[r.variant] = [];
      byVariant[r.variant].push(r);
    }

    const analysis: Record<string, { count: number; avgLatency: number; successRate: number; avgScore: number }> = {};
    for (const [variant, vResults] of Object.entries(byVariant)) {
      analysis[variant] = {
        count: vResults.length,
        avgLatency: vResults.reduce((s, r) => s + r.latencyMs, 0) / vResults.length,
        successRate: vResults.filter(r => r.success).length / vResults.length,
        avgScore: vResults.filter(r => r.score !== undefined).reduce((s, r) => s + (r.score || 0), 0) / vResults.length || 0,
      };
    }
    return analysis;
  }

  /** Get router statistics */
  getStats(): RouterStats { return { ...this.stats }; }

  /** Get all endpoints */
  getEndpoints(): ModelEndpoint[] { return Array.from(this.endpoints.values()); }

  private selectABVariant(test: ABTestConfig, group?: string): ABTestConfig["variants"][0] {
    // Deterministic assignment based on group, or random weighted
    if (group) {
      const hash = Array.from(group).reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
      const totalWeight = test.variants.reduce((s, v) => s + v.weight, 0);
      let target = Math.abs(hash) % totalWeight;
      for (const variant of test.variants) {
        target -= variant.weight;
        if (target <= 0) return variant;
      }
    }
    // Random weighted selection
    const totalWeight = test.variants.reduce((s, v) => s + v.weight, 0);
    let random = Math.random() * totalWeight;
    for (const variant of test.variants) {
      random -= variant.weight;
      if (random <= 0) return variant;
    }
    return test.variants[0];
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createRouter(strategy?: RoutingStrategy): LLMRouter { return new LLMRouter(strategy); }

/** Quick setup with common models */
export function createDefaultRouter(): LLMRouter {
  const router = new LLMRouter("balanced");
  router.addEndpoint({ name: "GPT-4o", provider: "openai", model: "gpt-4o", costPer1kInput: 0.0025, costPer1kOutput: 0.01, avgLatencyMs: 800, qualityScore: 92, maxTokens: 128000, rateLimit: 500, enabled: true, tags: ["reasoning", "code", "vision"] });
  router.addEndpoint({ name: "GPT-4o-mini", provider: "openai", model: "gpt-4o-mini", costPer1kInput: 0.00015, costPer1kOutput: 0.0006, avgLatencyMs: 400, qualityScore: 78, maxTokens: 128000, rateLimit: 1000, enabled: true, tags: ["fast", "cheap", "code"] });
  router.addEndpoint({ name: "Claude Sonnet 4", provider: "anthropic", model: "claude-sonnet-4", costPer1kInput: 0.003, costPer1kOutput: 0.015, avgLatencyMs: 900, qualityScore: 93, maxTokens: 200000, rateLimit: 400, enabled: true, tags: ["reasoning", "code", "long-context"] });
  router.addEndpoint({ name: "Claude Haiku", provider: "anthropic", model: "claude-haiku", costPer1kInput: 0.00025, costPer1kOutput: 0.00125, avgLatencyMs: 300, qualityScore: 75, maxTokens: 200000, rateLimit: 1000, enabled: true, tags: ["fast", "cheap"] });
  router.addEndpoint({ name: "Gemini 2.0 Flash", provider: "google", model: "gemini-2.0-flash", costPer1kInput: 0.0001, costPer1kOutput: 0.0004, avgLatencyMs: 250, qualityScore: 76, maxTokens: 1000000, rateLimit: 1500, enabled: true, tags: ["fast", "cheap", "long-context"] });
  return router;
}
