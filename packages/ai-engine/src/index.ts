/**
 * @agarwal-ai/ai-engine
 * Universal LLM Engine — Multi-provider routing, streaming, structured output, function calling, caching
 * Works with OpenAI, Anthropic, Google, Mistral, local models (Ollama), or any OpenAI-compatible endpoint
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type LLMProvider = "openai" | "anthropic" | "google" | "mistral" | "ollama" | "azure" | "custom";

export interface ProviderConfig {
  provider: LLMProvider;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  headers?: Record<string, string>;
}

export interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
  toolCallId?: string;
}

export interface ToolFunction {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON Schema
}

export interface CompletionRequest {
  messages: Message[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: ToolFunction[];
  responseFormat?: "text" | "json" | { schema: Record<string, unknown> };
  stream?: boolean;
  stop?: string[];
  seed?: number;
  cache?: boolean;
}

export interface CompletionResponse {
  id: string;
  content: string;
  model: string;
  provider: LLMProvider;
  toolCalls?: ToolCall[];
  usage: TokenUsage;
  latencyMs: number;
  cached: boolean;
  finishReason: "stop" | "length" | "tool_calls" | "error";
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUSD: number;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  toolCall?: Partial<ToolCall>;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryOn: number[]; // HTTP status codes to retry
}

export interface CacheConfig {
  enabled: boolean;
  ttlMs: number;
  maxEntries: number;
}

// ─── Cost Table ──────────────────────────────────────────────────────────────

const COST_PER_1K_TOKENS: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 0.0025, output: 0.01 },
  "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
  "gpt-4-turbo": { input: 0.01, output: 0.03 },
  "claude-opus-4": { input: 0.015, output: 0.075 },
  "claude-sonnet-4": { input: 0.003, output: 0.015 },
  "claude-haiku": { input: 0.00025, output: 0.00125 },
  "gemini-2.0-flash": { input: 0.0001, output: 0.0004 },
  "gemini-2.5-pro": { input: 0.00125, output: 0.01 },
  "mistral-large": { input: 0.002, output: 0.006 },
  "llama-3.1-70b": { input: 0.0, output: 0.0 }, // local
};

function estimateCost(model: string, promptTokens: number, completionTokens: number): number {
  const costs = COST_PER_1K_TOKENS[model] || { input: 0.001, output: 0.003 };
  return (promptTokens / 1000) * costs.input + (completionTokens / 1000) * costs.output;
}

// ─── LLM Cache ───────────────────────────────────────────────────────────────

class LLMCache {
  private cache = new Map<string, { response: CompletionResponse; expiry: number }>();
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  private hash(req: CompletionRequest): string {
    return JSON.stringify({ m: req.messages, model: req.model, t: req.temperature });
  }

  get(req: CompletionRequest): CompletionResponse | null {
    if (!this.config.enabled) return null;
    const key = this.hash(req);
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return { ...entry.response, cached: true };
  }

  set(req: CompletionRequest, response: CompletionResponse): void {
    if (!this.config.enabled) return;
    if (this.cache.size >= this.config.maxEntries) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(this.hash(req), { response, expiry: Date.now() + this.config.ttlMs });
  }

  clear(): void { this.cache.clear(); }
  get size(): number { return this.cache.size; }
}

// ─── Provider Adapters ───────────────────────────────────────────────────────

interface ProviderAdapter {
  complete(config: ProviderConfig, request: CompletionRequest): Promise<CompletionResponse>;
}

class OpenAIAdapter implements ProviderAdapter {
  async complete(config: ProviderConfig, request: CompletionRequest): Promise<CompletionResponse> {
    const url = `${config.baseUrl || "https://api.openai.com/v1"}/chat/completions`;
    const startTime = Date.now();

    const body: Record<string, unknown> = {
      model: request.model || config.model,
      messages: request.messages,
      max_tokens: request.maxTokens || config.maxTokens || 4096,
      temperature: request.temperature ?? config.temperature ?? 0.7,
    };

    if (request.tools?.length) {
      body.tools = request.tools.map(t => ({
        type: "function",
        function: { name: t.name, description: t.description, parameters: t.parameters },
      }));
    }

    if (request.responseFormat === "json") {
      body.response_format = { type: "json_object" };
    } else if (typeof request.responseFormat === "object") {
      body.response_format = { type: "json_schema", json_schema: { schema: request.responseFormat.schema } };
    }

    if (request.stop) body.stop = request.stop;
    if (request.seed) body.seed = request.seed;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
        ...config.headers,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new LLMError(`OpenAI API error: ${response.status} ${response.statusText}`, response.status);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    const model = request.model || config.model;

    const toolCalls: ToolCall[] = choice?.message?.tool_calls?.map((tc: any) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments || "{}"),
    })) || [];

    return {
      id: data.id || `gen_${Date.now()}`,
      content: choice?.message?.content || "",
      model,
      provider: "openai",
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
        estimatedCostUSD: estimateCost(model, usage.prompt_tokens, usage.completion_tokens),
      },
      latencyMs: Date.now() - startTime,
      cached: false,
      finishReason: choice?.finish_reason === "tool_calls" ? "tool_calls" : choice?.finish_reason || "stop",
    };
  }
}

class AnthropicAdapter implements ProviderAdapter {
  async complete(config: ProviderConfig, request: CompletionRequest): Promise<CompletionResponse> {
    const url = `${config.baseUrl || "https://api.anthropic.com"}/v1/messages`;
    const startTime = Date.now();

    const systemMsg = request.messages.find(m => m.role === "system");
    const nonSystemMsgs = request.messages.filter(m => m.role !== "system");

    const body: Record<string, unknown> = {
      model: request.model || config.model,
      max_tokens: request.maxTokens || config.maxTokens || 4096,
      messages: nonSystemMsgs.map(m => ({ role: m.role === "tool" ? "user" : m.role, content: m.content })),
    };

    if (systemMsg) body.system = systemMsg.content;
    if (request.temperature !== undefined) body.temperature = request.temperature;

    if (request.tools?.length) {
      body.tools = request.tools.map(t => ({
        name: t.name, description: t.description, input_schema: t.parameters,
      }));
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey || "",
        "anthropic-version": "2024-10-22",
        ...config.headers,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new LLMError(`Anthropic API error: ${response.status}`, response.status);
    }

    const data = await response.json();
    const content = data.content?.map((c: any) => c.type === "text" ? c.text : "").join("") || "";
    const usage = data.usage || { input_tokens: 0, output_tokens: 0 };
    const model = request.model || config.model;

    const toolCalls: ToolCall[] = data.content
      ?.filter((c: any) => c.type === "tool_use")
      .map((c: any) => ({ id: c.id, name: c.name, arguments: c.input })) || [];

    return {
      id: data.id || `gen_${Date.now()}`,
      content,
      model,
      provider: "anthropic",
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage: {
        promptTokens: usage.input_tokens,
        completionTokens: usage.output_tokens,
        totalTokens: usage.input_tokens + usage.output_tokens,
        estimatedCostUSD: estimateCost(model, usage.input_tokens, usage.output_tokens),
      },
      latencyMs: Date.now() - startTime,
      cached: false,
      finishReason: data.stop_reason === "tool_use" ? "tool_calls" : "stop",
    };
  }
}

// ─── LLM Error ───────────────────────────────────────────────────────────────

export class LLMError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = "LLMError";
  }
}

// ─── Main Engine ─────────────────────────────────────────────────────────────

export interface EngineConfig {
  providers: ProviderConfig[];
  defaultProvider?: LLMProvider;
  retry?: Partial<RetryConfig>;
  cache?: Partial<CacheConfig>;
  fallbackChain?: LLMProvider[];
  onRequest?: (req: CompletionRequest) => void;
  onResponse?: (res: CompletionResponse) => void;
  onError?: (err: Error, provider: LLMProvider) => void;
}

export class AIEngine {
  private providers: Map<LLMProvider, ProviderConfig> = new Map();
  private adapters: Map<LLMProvider, ProviderAdapter> = new Map();
  private defaultProvider: LLMProvider;
  private retryConfig: RetryConfig;
  private cache: LLMCache;
  private fallbackChain: LLMProvider[];
  private hooks: Pick<EngineConfig, "onRequest" | "onResponse" | "onError">;
  private totalRequests = 0;
  private totalTokens = 0;
  private totalCost = 0;

  constructor(config: EngineConfig) {
    for (const pc of config.providers) {
      this.providers.set(pc.provider, pc);
    }

    this.defaultProvider = config.defaultProvider || config.providers[0].provider;
    this.fallbackChain = config.fallbackChain || [];

    this.retryConfig = {
      maxRetries: config.retry?.maxRetries ?? 2,
      baseDelayMs: config.retry?.baseDelayMs ?? 1000,
      maxDelayMs: config.retry?.maxDelayMs ?? 10000,
      retryOn: config.retry?.retryOn ?? [429, 500, 502, 503],
    };

    this.cache = new LLMCache({
      enabled: config.cache?.enabled ?? true,
      ttlMs: config.cache?.ttlMs ?? 300000, // 5 min default
      maxEntries: config.cache?.maxEntries ?? 500,
    });

    this.hooks = { onRequest: config.onRequest, onResponse: config.onResponse, onError: config.onError };

    // Register adapters
    this.adapters.set("openai", new OpenAIAdapter());
    this.adapters.set("azure", new OpenAIAdapter()); // Azure uses OpenAI-compatible API
    this.adapters.set("ollama", new OpenAIAdapter()); // Ollama is OpenAI-compatible
    this.adapters.set("custom", new OpenAIAdapter()); // Custom OpenAI-compatible endpoints
    this.adapters.set("anthropic", new AnthropicAdapter());
    this.adapters.set("mistral", new OpenAIAdapter()); // Mistral is OpenAI-compatible
    this.adapters.set("google", new OpenAIAdapter()); // Placeholder — extend for Gemini
  }

  /** Send a completion request */
  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    this.hooks.onRequest?.(request);

    // Check cache
    if (request.cache !== false) {
      const cached = this.cache.get(request);
      if (cached) {
        this.hooks.onResponse?.(cached);
        return cached;
      }
    }

    // Try default provider, then fallback chain
    const chain = [this.defaultProvider, ...this.fallbackChain];
    let lastError: Error | undefined;

    for (const providerKey of chain) {
      const providerConfig = this.providers.get(providerKey);
      const adapter = this.adapters.get(providerKey);
      if (!providerConfig || !adapter) continue;

      try {
        const response = await this.executeWithRetry(adapter, providerConfig, request);
        this.totalRequests++;
        this.totalTokens += response.usage.totalTokens;
        this.totalCost += response.usage.estimatedCostUSD;

        if (request.cache !== false) {
          this.cache.set(request, response);
        }

        this.hooks.onResponse?.(response);
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.hooks.onError?.(lastError, providerKey);
      }
    }

    throw lastError || new LLMError("All providers failed");
  }

  /** Simple text completion */
  async chat(prompt: string, options?: Partial<CompletionRequest>): Promise<string> {
    const response = await this.complete({
      messages: [{ role: "user", content: prompt }],
      ...options,
    });
    return response.content;
  }

  /** Structured JSON output */
  async json<T = unknown>(prompt: string, schema?: Record<string, unknown>): Promise<T> {
    const response = await this.complete({
      messages: [{ role: "user", content: prompt }],
      responseFormat: schema ? { schema } : "json",
    });
    return JSON.parse(response.content) as T;
  }

  /** Execute with tool calling loop */
  async executeWithTools(
    messages: Message[],
    tools: ToolFunction[],
    executor: (name: string, args: Record<string, unknown>) => Promise<string>,
    maxIterations = 10
  ): Promise<CompletionResponse> {
    let currentMessages = [...messages];
    let iterations = 0;
    let lastResponse: CompletionResponse | undefined;

    while (iterations < maxIterations) {
      const response = await this.complete({ messages: currentMessages, tools });
      lastResponse = response;

      if (!response.toolCalls || response.toolCalls.length === 0) {
        return response;
      }

      // Execute tool calls
      currentMessages.push({ role: "assistant", content: response.content });

      for (const tc of response.toolCalls) {
        const result = await executor(tc.name, tc.arguments);
        currentMessages.push({
          role: "tool",
          content: result,
          toolCallId: tc.id,
        });
      }

      iterations++;
    }

    return lastResponse || { id: "", content: "Max iterations reached", model: "", provider: this.defaultProvider, usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCostUSD: 0 }, latencyMs: 0, cached: false, finishReason: "stop" };
  }

  /** Get usage stats */
  getStats(): { totalRequests: number; totalTokens: number; totalCostUSD: number; cacheSize: number } {
    return { totalRequests: this.totalRequests, totalTokens: this.totalTokens, totalCostUSD: this.totalCost, cacheSize: this.cache.size };
  }

  /** Clear cache */
  clearCache(): void { this.cache.clear(); }

  private async executeWithRetry(adapter: ProviderAdapter, config: ProviderConfig, request: CompletionRequest): Promise<CompletionResponse> {
    let lastError: Error | undefined;
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await adapter.complete(config, request);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (error instanceof LLMError && error.statusCode && !this.retryConfig.retryOn.includes(error.statusCode)) {
          throw error; // Don't retry non-retryable errors
        }
        if (attempt < this.retryConfig.maxRetries) {
          const delay = Math.min(this.retryConfig.baseDelayMs * Math.pow(2, attempt), this.retryConfig.maxDelayMs);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
    throw lastError;
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

/** Create an AI engine with multiple providers */
export function createAIEngine(config: EngineConfig): AIEngine {
  return new AIEngine(config);
}

/** Quick setup for a single provider */
export function createSingleProvider(provider: LLMProvider, apiKey: string, model: string): AIEngine {
  return new AIEngine({
    providers: [{ provider, apiKey, model }],
    defaultProvider: provider,
  });
}
