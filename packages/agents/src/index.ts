/**
 * @agarwal-ai/agents
 * Agent-First Architecture — Multi-agent orchestration, MCP integration, agent patterns
 */

import { generateId, withRetry } from "@agarwal-ai/core";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AgentRole = "orchestrator" | "specialist" | "validator" | "monitor" | "worker";
export type AgentStatus = "idle" | "running" | "paused" | "completed" | "failed" | "terminated";

export interface AgentConfig {
  /** Unique agent name */
  name: string;
  /** Agent role in the system */
  role: AgentRole;
  /** Agent description */
  description: string;
  /** Model to use (e.g., 'claude-opus-4.6', 'gpt-4o') */
  model: string;
  /** Temperature for generation */
  temperature?: number;
  /** Max output tokens */
  maxTokens?: number;
  /** System prompt */
  systemPrompt?: string;
  /** Available tools (MCP connections) */
  tools?: ToolDefinition[];
  /** Memory configuration */
  memory?: MemoryConfig;
  /** Circuit breaker config */
  circuitBreaker?: CircuitBreakerConfig;
  /** Max retries on failure */
  maxRetries?: number;
}

export interface ToolDefinition {
  /** Tool name */
  name: string;
  /** Tool description */
  description: string;
  /** Input schema (JSON Schema) */
  inputSchema: Record<string, unknown>;
  /** Whether to auto-approve this tool */
  autoApprove?: boolean;
  /** MCP server name */
  mcpServer?: string;
}

export interface MemoryConfig {
  /** Short-term context window tokens */
  contextWindow?: number;
  /** Enable long-term vector memory */
  vectorMemory?: boolean;
  /** Enable knowledge graph */
  knowledgeGraph?: boolean;
  /** Memory retention days */
  retentionDays?: number;
}

export interface CircuitBreakerConfig {
  /** Number of failures before opening */
  failureThreshold: number;
  /** Successes needed to close again */
  successThreshold: number;
  /** Time in open state before half-open (ms) */
  timeoutMs: number;
}

export interface AgentMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface AgentResult {
  id: string;
  agentId: string;
  status: "success" | "failure" | "escalated";
  output: string;
  reasoning?: string;
  confidence: number;
  tokensUsed: number;
  durationMs: number;
  toolCalls?: ToolCallResult[];
}

export interface ToolCallResult {
  toolName: string;
  input: Record<string, unknown>;
  output: unknown;
  success: boolean;
  durationMs: number;
}

// ─── Agent Class ─────────────────────────────────────────────────────────────

export class Agent {
  readonly id: string;
  readonly config: AgentConfig;
  private status: AgentStatus = "idle";
  private messages: AgentMessage[] = [];
  private circuitState: "closed" | "open" | "half-open" = "closed";
  private failureCount = 0;
  private successCount = 0;

  constructor(config: AgentConfig) {
    this.id = generateId("agent");
    this.config = config;

    if (config.systemPrompt) {
      this.messages.push({
        id: generateId("msg"),
        role: "system",
        content: config.systemPrompt,
        timestamp: Date.now(),
      });
    }
  }

  /** Get current status */
  getStatus(): AgentStatus {
    return this.status;
  }

  /** Execute a task */
  async execute(input: string): Promise<AgentResult> {
    if (this.circuitState === "open") {
      return {
        id: generateId("result"),
        agentId: this.id,
        status: "failure",
        output: "Circuit breaker is OPEN — agent temporarily unavailable",
        confidence: 0,
        tokensUsed: 0,
        durationMs: 0,
      };
    }

    this.status = "running";
    const startTime = Date.now();

    this.messages.push({
      id: generateId("msg"),
      role: "user",
      content: input,
      timestamp: Date.now(),
    });

    try {
      const result = await withRetry(
        async () => this.processTask(input),
        { maxRetries: this.config.maxRetries ?? 2 }
      );

      this.onSuccess();
      this.status = "completed";

      return {
        id: generateId("result"),
        agentId: this.id,
        status: "success",
        output: result,
        confidence: 0.85,
        tokensUsed: 0,
        durationMs: Date.now() - startTime,
      };
    } catch (error) {
      this.onFailure();
      this.status = "failed";

      return {
        id: generateId("result"),
        agentId: this.id,
        status: "failure",
        output: error instanceof Error ? error.message : "Unknown error",
        confidence: 0,
        tokensUsed: 0,
        durationMs: Date.now() - startTime,
      };
    }
  }

  /** Override this to implement actual LLM calls */
  protected async processTask(input: string): Promise<string> {
    // Base implementation — users override with their LLM provider
    return `[Agent ${this.config.name}] Processed: ${input}`;
  }

  /** Pause the agent */
  pause(): void {
    this.status = "paused";
  }

  /** Resume the agent */
  resume(): void {
    if (this.status === "paused") this.status = "idle";
  }

  /** Terminate the agent */
  terminate(): void {
    this.status = "terminated";
  }

  /** Get conversation history */
  getHistory(): readonly AgentMessage[] {
    return this.messages;
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.circuitState === "half-open") {
      this.successCount++;
      const threshold = this.config.circuitBreaker?.successThreshold ?? 3;
      if (this.successCount >= threshold) {
        this.circuitState = "closed";
        this.successCount = 0;
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    const threshold = this.config.circuitBreaker?.failureThreshold ?? 5;
    if (this.failureCount >= threshold) {
      this.circuitState = "open";
      const timeout = this.config.circuitBreaker?.timeoutMs ?? 30000;
      setTimeout(() => {
        this.circuitState = "half-open";
        this.failureCount = 0;
      }, timeout);
    }
  }
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

export interface OrchestratorConfig {
  /** Name of the orchestrator */
  name: string;
  /** Strategy for routing tasks */
  strategy: "round-robin" | "capability" | "load-balanced" | "priority";
  /** Registered agents */
  agents: Agent[];
  /** Max concurrent tasks */
  maxConcurrency?: number;
  /** Escalation handler */
  onEscalation?: (agentId: string, reason: string) => void;
}

export class Orchestrator {
  readonly id: string;
  private config: OrchestratorConfig;
  private taskQueue: Array<{ input: string; resolve: (r: AgentResult) => void }> = [];
  private running = 0;

  constructor(config: OrchestratorConfig) {
    this.id = generateId("orch");
    this.config = config;
  }

  /** Register a new agent */
  registerAgent(agent: Agent): void {
    this.config.agents.push(agent);
  }

  /** Remove an agent */
  removeAgent(agentId: string): void {
    this.config.agents = this.config.agents.filter((a) => a.id !== agentId);
  }

  /** Dispatch a task to the best available agent */
  async dispatch(input: string): Promise<AgentResult> {
    const agent = this.selectAgent(input);
    if (!agent) {
      return {
        id: generateId("result"),
        agentId: "none",
        status: "failure",
        output: "No available agent for this task",
        confidence: 0,
        tokensUsed: 0,
        durationMs: 0,
      };
    }
    return agent.execute(input);
  }

  /** Fan out a task to multiple agents and collect results */
  async fanOut(input: string, agentIds?: string[]): Promise<AgentResult[]> {
    const agents = agentIds
      ? this.config.agents.filter((a) => agentIds.includes(a.id))
      : this.config.agents;

    return Promise.all(agents.map((a) => a.execute(input)));
  }

  /** Get all registered agents */
  getAgents(): readonly Agent[] {
    return this.config.agents;
  }

  private selectAgent(_input: string): Agent | undefined {
    const available = this.config.agents.filter(
      (a) => a.getStatus() === "idle" || a.getStatus() === "completed"
    );

    switch (this.config.strategy) {
      case "round-robin":
        return available[0];
      case "capability":
        return available[0]; // TODO: match by capability
      case "load-balanced":
        return available[0]; // TODO: least loaded
      case "priority":
        return available[0]; // TODO: by priority
      default:
        return available[0];
    }
  }
}

// ─── Factory Functions ───────────────────────────────────────────────────────

/** Create a new agent */
export function createAgent(config: AgentConfig): Agent {
  return new Agent(config);
}

/** Create an orchestrator */
export function createOrchestrator(config: OrchestratorConfig): Orchestrator {
  return new Orchestrator(config);
}

/** Create a specialist agent with pre-configured role */
export function createSpecialist(
  name: string,
  specialization: string,
  model = "claude-opus-4.6"
): Agent {
  return new Agent({
    name,
    role: "specialist",
    description: `Specialist agent for ${specialization}`,
    model,
    systemPrompt: `You are a specialist in ${specialization}. Focus exclusively on this domain.`,
    maxRetries: 2,
    circuitBreaker: { failureThreshold: 3, successThreshold: 2, timeoutMs: 30000 },
  });
}
