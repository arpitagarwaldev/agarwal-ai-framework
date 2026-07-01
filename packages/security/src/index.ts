/**
 * @agarwal-ai/security
 * AI Security — Prompt injection defense, sanitization, output filtering, rate limiting, secret detection
 */

import { generateId } from "@agarwal-ai/core";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ThreatLevel = "safe" | "suspicious" | "malicious";
export type ScanResult = { safe: boolean; threats: ThreatDetection[]; sanitized: string; score: number };

export interface ThreatDetection {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  position?: { start: number; end: number };
  originalText?: string;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyExtractor?: (request: unknown) => string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
  retryAfterMs?: number;
}

export interface SecretPattern {
  name: string;
  pattern: RegExp;
  severity: "high" | "critical";
}

// ─── Input Scanner ───────────────────────────────────────────────────────────

const INJECTION_PATTERNS: Array<{ pattern: RegExp; type: string; severity: ThreatDetection["severity"] }> = [
  { pattern: /ignore\s+(all\s+)?previous\s+(instructions|prompts|rules)/i, type: "prompt-injection", severity: "critical" },
  { pattern: /you\s+are\s+now\s+(DAN|a\s+new|unrestricted)/i, type: "jailbreak", severity: "critical" },
  { pattern: /```\s*(system|admin|root)\b/i, type: "role-injection", severity: "high" },
  { pattern: /\[SYSTEM\]|\[ADMIN\]|\[OVERRIDE\]/i, type: "role-tag-injection", severity: "high" },
  { pattern: /forget\s+(everything|all|your\s+instructions)/i, type: "memory-wipe", severity: "high" },
  { pattern: /act\s+as\s+if\s+you\s+(have|had)\s+no\s+(rules|restrictions|limits)/i, type: "restriction-bypass", severity: "high" },
  { pattern: /output\s+(the|your)\s+(system\s+prompt|instructions|rules)/i, type: "prompt-extraction", severity: "medium" },
  { pattern: /repeat\s+(back|everything|the\s+above)/i, type: "prompt-echo", severity: "medium" },
  { pattern: /base64\s*decode|eval\(|exec\(|__import__/i, type: "code-injection", severity: "critical" },
  { pattern: /<script|javascript:|on(error|load|click)\s*=/i, type: "xss-attempt", severity: "high" },
  { pattern: /;\s*(DROP|DELETE|TRUNCATE|ALTER)\s/i, type: "sql-injection", severity: "critical" },
  { pattern: /\{\{.*\}\}|\$\{.*\}|<%.*%>/i, type: "template-injection", severity: "high" },
];

export class InputScanner {
  private customPatterns: Array<{ pattern: RegExp; type: string; severity: ThreatDetection["severity"] }> = [];
  private maxInputLength: number;

  constructor(maxInputLength = 50000) {
    this.maxInputLength = maxInputLength;
  }

  /** Add custom threat pattern */
  addPattern(pattern: RegExp, type: string, severity: ThreatDetection["severity"]): this {
    this.customPatterns.push({ pattern, type, severity });
    return this;
  }

  /** Scan input for threats */
  scan(input: string): ScanResult {
    const threats: ThreatDetection[] = [];
    let sanitized = input;

    // Length check
    if (input.length > this.maxInputLength) {
      threats.push({ type: "length-overflow", severity: "medium", description: `Input exceeds max length (${input.length} > ${this.maxInputLength})` });
      sanitized = input.substring(0, this.maxInputLength);
    }

    // Pattern matching
    const allPatterns = [...INJECTION_PATTERNS, ...this.customPatterns];
    for (const { pattern, type, severity } of allPatterns) {
      const match = pattern.exec(input);
      if (match) {
        threats.push({
          type,
          severity,
          description: `Detected ${type} pattern`,
          position: { start: match.index, end: match.index + match[0].length },
          originalText: match[0].substring(0, 100),
        });
      }
    }

    // Unicode homoglyph detection
    const homoglyphs = /[\u200B-\u200F\u2028-\u202F\uFEFF\u00AD]/g;
    if (homoglyphs.test(input)) {
      threats.push({ type: "hidden-characters", severity: "medium", description: "Input contains invisible/zero-width characters" });
      sanitized = sanitized.replace(homoglyphs, "");
    }

    // Calculate safety score (0 = dangerous, 100 = safe)
    const severityScores: Record<string, number> = { critical: 40, high: 25, medium: 10, low: 5 };
    const totalPenalty = threats.reduce((s, t) => s + (severityScores[t.severity] || 0), 0);
    const score = Math.max(0, 100 - totalPenalty);

    return { safe: threats.length === 0, threats, sanitized, score };
  }
}

// ─── Output Filter ───────────────────────────────────────────────────────────

export class OutputFilter {
  private secretPatterns: SecretPattern[] = [
    { name: "AWS Key", pattern: /AKIA[0-9A-Z]{16}/g, severity: "critical" },
    { name: "AWS Secret", pattern: /[A-Za-z0-9/+=]{40}(?=\s|$|")/g, severity: "critical" },
    { name: "GitHub Token", pattern: /gh[pousr]_[A-Za-z0-9_]{36,}/g, severity: "critical" },
    { name: "JWT Token", pattern: /eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]+/g, severity: "critical" },
    { name: "Private Key", pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/g, severity: "critical" },
    { name: "API Key Generic", pattern: /(?:api[_-]?key|apikey|api_secret)\s*[=:]\s*['"]?[A-Za-z0-9_\-]{20,}/gi, severity: "high" },
    { name: "Password", pattern: /(?:password|passwd|pwd)\s*[=:]\s*['"]?[^\s'"]{8,}/gi, severity: "high" },
    { name: "Connection String", pattern: /(?:mongodb|postgres|mysql|redis):\/\/[^\s]+/gi, severity: "critical" },
    { name: "IP Address (Private)", pattern: /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b/g, severity: "high" },
    { name: "Email", pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, severity: "high" },
    { name: "SSN", pattern: /\b\d{3}-\d{2}-\d{4}\b/g, severity: "critical" },
    { name: "Credit Card", pattern: /\b(?:\d{4}[- ]?){3}\d{4}\b/g, severity: "critical" },
    { name: "Phone (US)", pattern: /\b(?:\+1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/g, severity: "high" },
  ];

  /** Add custom secret pattern */
  addPattern(name: string, pattern: RegExp, severity: SecretPattern["severity"]): this {
    this.secretPatterns.push({ name, pattern, severity });
    return this;
  }

  /** Scan and redact secrets from output */
  filter(output: string): { filtered: string; detections: Array<{ name: string; count: number; severity: string }> } {
    let filtered = output;
    const detections: Array<{ name: string; count: number; severity: string }> = [];

    for (const sp of this.secretPatterns) {
      const matches = output.match(sp.pattern);
      if (matches && matches.length > 0) {
        detections.push({ name: sp.name, count: matches.length, severity: sp.severity });
        filtered = filtered.replace(sp.pattern, `[REDACTED:${sp.name}]`);
      }
    }

    return { filtered, detections };
  }

  /** Check if output contains secrets (without redaction) */
  hasSecrets(output: string): boolean {
    return this.secretPatterns.some(sp => sp.pattern.test(output));
  }
}

// ─── Rate Limiter ────────────────────────────────────────────────────────────

export class RateLimiter {
  private windows: Map<string, { count: number; resetAt: number }> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /** Check if request is allowed */
  check(key: string): RateLimitResult {
    const now = Date.now();
    const window = this.windows.get(key);

    if (!window || now >= window.resetAt) {
      this.windows.set(key, { count: 1, resetAt: now + this.config.windowMs });
      return { allowed: true, remaining: this.config.maxRequests - 1, resetMs: this.config.windowMs };
    }

    if (window.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetMs: window.resetAt - now,
        retryAfterMs: window.resetAt - now,
      };
    }

    window.count++;
    return { allowed: true, remaining: this.config.maxRequests - window.count, resetMs: window.resetAt - now };
  }

  /** Reset a key */
  reset(key: string): void { this.windows.delete(key); }

  /** Reset all */
  resetAll(): void { this.windows.clear(); }
}

// ─── Security Shield (All-in-One) ───────────────────────────────────────────

export class SecurityShield {
  readonly inputScanner: InputScanner;
  readonly outputFilter: OutputFilter;
  readonly rateLimiter: RateLimiter;

  constructor(options?: { maxInputLength?: number; rateLimit?: RateLimitConfig }) {
    this.inputScanner = new InputScanner(options?.maxInputLength);
    this.outputFilter = new OutputFilter();
    this.rateLimiter = new RateLimiter(options?.rateLimit || { windowMs: 60000, maxRequests: 60 });
  }

  /** Full security check: rate limit → scan input → filter output */
  async protect(
    key: string,
    input: string,
    executor: (sanitizedInput: string) => Promise<string>
  ): Promise<{ output: string; blocked: boolean; reason?: string; threats: ThreatDetection[] }> {
    // Rate limit
    const rateResult = this.rateLimiter.check(key);
    if (!rateResult.allowed) {
      return { output: "", blocked: true, reason: `Rate limited. Retry in ${rateResult.retryAfterMs}ms`, threats: [] };
    }

    // Input scan
    const scanResult = this.inputScanner.scan(input);
    if (scanResult.threats.some(t => t.severity === "critical")) {
      return { output: "", blocked: true, reason: "Critical threat detected in input", threats: scanResult.threats };
    }

    // Execute with sanitized input
    const rawOutput = await executor(scanResult.sanitized);

    // Output filter
    const { filtered } = this.outputFilter.filter(rawOutput);

    return { output: filtered, blocked: false, threats: scanResult.threats };
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createInputScanner(maxLength?: number): InputScanner { return new InputScanner(maxLength); }
export function createOutputFilter(): OutputFilter { return new OutputFilter(); }
export function createRateLimiter(config: RateLimitConfig): RateLimiter { return new RateLimiter(config); }
export function createSecurityShield(options?: { maxInputLength?: number; rateLimit?: RateLimitConfig }): SecurityShield { return new SecurityShield(options); }
