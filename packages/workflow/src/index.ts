/**
 * @agarwal-ai/workflow
 * Workflow Autonomy Engine — Self-orchestrating pipelines, decision gates, dynamic stages
 */

import { generateId } from "@agarwal-ai/core";
import type { Agent, AgentResult } from "@agarwal-ai/agents";

// ─── Types ───────────────────────────────────────────────────────────────────

export type StageStatus = "pending" | "running" | "completed" | "failed" | "skipped" | "blocked";
export type GateType = "auto" | "human" | "risk-based" | "consensus";
export type PipelineTrigger = "manual" | "code-change" | "intent" | "schedule" | "event";

export interface StageDefinition {
  /** Stage name */
  name: string;
  /** Agent(s) responsible for this stage */
  agents: Agent[];
  /** Run in parallel with other stages */
  parallel?: boolean;
  /** Decision gate after this stage */
  gate?: GateType;
  /** Skip condition */
  skipIf?: (context: PipelineContext) => boolean;
  /** Timeout in ms */
  timeoutMs?: number;
  /** Custom execution logic */
  execute?: (context: PipelineContext) => Promise<StageResult>;
}

export interface StageResult {
  status: StageStatus;
  output: unknown;
  agentResults: AgentResult[];
  durationMs: number;
  metadata?: Record<string, unknown>;
}

export interface PipelineConfig {
  /** Pipeline name */
  name: string;
  /** Trigger type */
  trigger: PipelineTrigger;
  /** Ordered stages */
  stages: StageDefinition[];
  /** Max concurrent parallel stages */
  maxConcurrency?: number;
  /** Global timeout */
  timeoutMs?: number;
  /** On failure strategy */
  onFailure?: "stop" | "continue" | "rollback";
}

export interface PipelineContext {
  pipelineId: string;
  pipelineName: string;
  trigger: PipelineTrigger;
  startTime: number;
  /** Accumulated results from previous stages */
  stageResults: Map<string, StageResult>;
  /** Custom metadata */
  metadata: Record<string, unknown>;
  /** Risk score (0-100) */
  riskScore: number;
}

export interface PipelineResult {
  id: string;
  name: string;
  status: "completed" | "failed" | "blocked";
  stages: Array<{ name: string; result: StageResult }>;
  totalDurationMs: number;
  gateDecisions: GateDecision[];
}

export interface GateDecision {
  stage: string;
  gateType: GateType;
  decision: "approved" | "rejected" | "pending";
  reason: string;
  decidedBy: "auto" | "human" | string;
  timestamp: number;
}

// ─── Pipeline ────────────────────────────────────────────────────────────────

export class Pipeline {
  readonly id: string;
  private config: PipelineConfig;
  private context: PipelineContext;
  private gateHandlers: Map<GateType, (ctx: PipelineContext, stage: string) => Promise<GateDecision>> = new Map();

  constructor(config: PipelineConfig) {
    this.id = generateId("pipe");
    this.config = config;
    this.context = {
      pipelineId: this.id,
      pipelineName: config.name,
      trigger: config.trigger,
      startTime: Date.now(),
      stageResults: new Map(),
      metadata: {},
      riskScore: 50, // default medium risk
    };

    // Default auto-gate handler
    this.gateHandlers.set("auto", async (_ctx, stage) => ({
      stage,
      gateType: "auto" as GateType,
      decision: "approved" as const,
      reason: "Auto-approved",
      decidedBy: "auto",
      timestamp: Date.now(),
    }));
  }

  /** Set risk score for the pipeline (affects risk-based gates) */
  setRiskScore(score: number): this {
    this.context.riskScore = Math.max(0, Math.min(100, score));
    return this;
  }

  /** Set metadata */
  setMetadata(key: string, value: unknown): this {
    this.context.metadata[key] = value;
    return this;
  }

  /** Register a gate handler */
  onGate(type: GateType, handler: (ctx: PipelineContext, stage: string) => Promise<GateDecision>): this {
    this.gateHandlers.set(type, handler);
    return this;
  }

  /** Execute the pipeline */
  async run(): Promise<PipelineResult> {
    const startTime = Date.now();
    const stageResults: Array<{ name: string; result: StageResult }> = [];
    const gateDecisions: GateDecision[] = [];

    for (const stage of this.config.stages) {
      // Check skip condition
      if (stage.skipIf && stage.skipIf(this.context)) {
        const skipped: StageResult = {
          status: "skipped",
          output: null,
          agentResults: [],
          durationMs: 0,
        };
        stageResults.push({ name: stage.name, result: skipped });
        this.context.stageResults.set(stage.name, skipped);
        continue;
      }

      // Execute stage
      const stageStart = Date.now();
      let result: StageResult;

      try {
        if (stage.execute) {
          result = await stage.execute(this.context);
        } else {
          // Default: run all agents with pipeline context as input
          const agentResults = await Promise.all(
            stage.agents.map((agent) =>
              agent.execute(JSON.stringify(this.context.metadata))
            )
          );
          const allSucceeded = agentResults.every((r) => r.status === "success");
          result = {
            status: allSucceeded ? "completed" : "failed",
            output: agentResults.map((r) => r.output),
            agentResults,
            durationMs: Date.now() - stageStart,
          };
        }
      } catch (error) {
        result = {
          status: "failed",
          output: error instanceof Error ? error.message : "Unknown error",
          agentResults: [],
          durationMs: Date.now() - stageStart,
        };
      }

      stageResults.push({ name: stage.name, result });
      this.context.stageResults.set(stage.name, result);

      // Handle failure
      if (result.status === "failed") {
        if (this.config.onFailure === "stop") {
          return {
            id: this.id, name: this.config.name, status: "failed",
            stages: stageResults, totalDurationMs: Date.now() - startTime, gateDecisions,
          };
        }
      }

      // Decision gate
      if (stage.gate) {
        const gateHandler = this.gateHandlers.get(stage.gate);
        if (gateHandler) {
          const decision = await gateHandler(this.context, stage.name);
          gateDecisions.push(decision);
          if (decision.decision === "rejected") {
            return {
              id: this.id, name: this.config.name, status: "blocked",
              stages: stageResults, totalDurationMs: Date.now() - startTime, gateDecisions,
            };
          }
        }
      }
    }

    return {
      id: this.id,
      name: this.config.name,
      status: "completed",
      stages: stageResults,
      totalDurationMs: Date.now() - startTime,
      gateDecisions,
    };
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

/** Create a pipeline */
export function createPipeline(config: PipelineConfig): Pipeline {
  return new Pipeline(config);
}

/** Create a simple sequential pipeline */
export function createSequentialPipeline(
  name: string,
  stages: Array<{ name: string; agent: Agent; gate?: GateType }>
): Pipeline {
  return new Pipeline({
    name,
    trigger: "manual",
    stages: stages.map((s) => ({
      name: s.name,
      agents: [s.agent],
      gate: s.gate,
    })),
    onFailure: "stop",
  });
}
