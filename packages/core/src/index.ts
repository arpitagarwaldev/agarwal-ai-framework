/**
 * @agarwal-ai/core
 * Core utilities, types, and configuration for the AGARWAL AI Framework
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AgarwalConfig {
  /** Project name */
  name: string;
  /** Active framework layers */
  layers: LayerConfig[];
  /** Global settings */
  settings: GlobalSettings;
}

export interface LayerConfig {
  id: AgarwalLayer;
  enabled: boolean;
  config?: Record<string, unknown>;
}

export type AgarwalLayer =
  | "agent"
  | "governance"
  | "algorithm"
  | "resilient"
  | "workflow"
  | "autonomous"
  | "lifecycle";

export interface GlobalSettings {
  /** Log level */
  logLevel: "debug" | "info" | "warn" | "error";
  /** Enable telemetry */
  telemetry: boolean;
  /** Environment */
  environment: "development" | "staging" | "production";
  /** Max retries for operations */
  maxRetries: number;
  /** Timeout in ms */
  timeoutMs: number;
}

// ─── Default Configuration ───────────────────────────────────────────────────

export const DEFAULT_CONFIG: AgarwalConfig = {
  name: "agarwal-project",
  layers: [
    { id: "agent", enabled: true },
    { id: "governance", enabled: true },
    { id: "algorithm", enabled: false },
    { id: "resilient", enabled: false },
    { id: "workflow", enabled: true },
    { id: "autonomous", enabled: true },
    { id: "lifecycle", enabled: true },
  ],
  settings: {
    logLevel: "info",
    telemetry: false,
    environment: "development",
    maxRetries: 3,
    timeoutMs: 30000,
  },
};

// ─── Framework Initialization ────────────────────────────────────────────────

export class Agarwal {
  private config: AgarwalConfig;
  private initialized = false;

  constructor(config?: Partial<AgarwalConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /** Initialize the framework */
  init(): this {
    if (this.initialized) {
      this.log("warn", "Framework already initialized");
      return this;
    }

    this.log("info", `Initializing AGARWAL Framework: ${this.config.name}`);
    this.log("info", `Active layers: ${this.getActiveLayers().join(", ")}`);
    this.initialized = true;
    return this;
  }

  /** Get active layer IDs */
  getActiveLayers(): AgarwalLayer[] {
    return this.config.layers
      .filter((l) => l.enabled)
      .map((l) => l.id);
  }

  /** Check if a layer is enabled */
  isLayerEnabled(layer: AgarwalLayer): boolean {
    return this.config.layers.find((l) => l.id === layer)?.enabled ?? false;
  }

  /** Enable a layer */
  enableLayer(layer: AgarwalLayer): this {
    const found = this.config.layers.find((l) => l.id === layer);
    if (found) found.enabled = true;
    return this;
  }

  /** Disable a layer */
  disableLayer(layer: AgarwalLayer): this {
    const found = this.config.layers.find((l) => l.id === layer);
    if (found) found.enabled = false;
    return this;
  }

  /** Get current config */
  getConfig(): Readonly<AgarwalConfig> {
    return Object.freeze({ ...this.config });
  }

  /** Internal logger */
  private log(level: string, message: string) {
    const levels = ["debug", "info", "warn", "error"];
    const configLevel = levels.indexOf(this.config.settings.logLevel);
    const msgLevel = levels.indexOf(level);
    if (msgLevel >= configLevel) {
      const prefix = `[AGARWAL:${level.toUpperCase()}]`;
      console.log(`${prefix} ${message}`);
    }
  }
}

// ─── Utility Functions ───────────────────────────────────────────────────────

/** Create a new AGARWAL instance */
export function createAgarwal(config?: Partial<AgarwalConfig>): Agarwal {
  return new Agarwal(config).init();
}

/** Retry an async operation with exponential backoff */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; baseDelay?: number; maxDelay?: number } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000 } = options;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt === maxRetries) break;
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}

/** Generate a unique ID */
export function generateId(prefix = "ag"): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

/** Deep merge objects */
export function deepMerge<T extends Record<string, unknown>>(target: T, ...sources: Partial<T>[]): T {
  const result = { ...target };
  for (const source of sources) {
    for (const key in source) {
      const sourceVal = source[key];
      const targetVal = result[key];
      if (
        sourceVal &&
        typeof sourceVal === "object" &&
        !Array.isArray(sourceVal) &&
        targetVal &&
        typeof targetVal === "object" &&
        !Array.isArray(targetVal)
      ) {
        (result as Record<string, unknown>)[key] = deepMerge(
          targetVal as Record<string, unknown>,
          sourceVal as Record<string, unknown>
        );
      } else {
        (result as Record<string, unknown>)[key] = sourceVal;
      }
    }
  }
  return result;
}
