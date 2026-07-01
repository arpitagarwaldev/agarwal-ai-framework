/**
 * @agarwal-ai/governance
 * Governance & Trust Mesh — Policy enforcement, explainability, compliance, safety
 */

import { generateId } from "@agarwal-ai/core";

// ─── Types ───────────────────────────────────────────────────────────────────

export type PolicySeverity = "critical" | "high" | "medium" | "low";
export type PolicyAction = "block" | "warn" | "log" | "escalate";
export type SafetyLevel = "pause" | "rollback" | "isolate" | "shutdown";

export interface Policy {
  id: string;
  name: string;
  description: string;
  severity: PolicySeverity;
  condition: (context: PolicyContext) => boolean;
  action: PolicyAction;
  message: string;
}

export interface PolicyContext {
  agentId: string;
  action: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface PolicyResult {
  policyId: string;
  policyName: string;
  passed: boolean;
  action: PolicyAction;
  severity: PolicySeverity;
  message: string;
  timestamp: number;
}

export interface AuditEntry {
  id: string;
  timestamp: number;
  agentId: string;
  action: string;
  input: unknown;
  output: unknown;
  reasoning?: string;
  policiesEvaluated: string[];
  policiesViolated: string[];
  trustMeshScore: number;
}

export interface TrustMeshScores {
  explainability: number;
  compliance: number;
  safety: number;
  auditability: number;
  overall: number;
}

export interface GuardrailConfig {
  /** Max tokens per agent per task */
  maxTokenBudget?: number;
  /** Max output length */
  maxOutputLength?: number;
  /** Blocked content patterns */
  blockedPatterns?: RegExp[];
  /** Required output format */
  requiredFormat?: string;
  /** Cost cap per execution (USD) */
  costCap?: number;
}

// ─── Trust Mesh ──────────────────────────────────────────────────────────────

export class TrustMesh {
  private policies: Policy[] = [];
  private auditLog: AuditEntry[] = [];
  private guardrails: GuardrailConfig;

  constructor(guardrails: GuardrailConfig = {}) {
    this.guardrails = guardrails;
  }

  /** Register a governance policy */
  addPolicy(policy: Omit<Policy, "id">): string {
    const id = generateId("policy");
    this.policies.push({ ...policy, id });
    return id;
  }

  /** Remove a policy */
  removePolicy(policyId: string): void {
    this.policies = this.policies.filter((p) => p.id !== policyId);
  }

  /** Evaluate all policies against a context */
  evaluate(context: PolicyContext): PolicyResult[] {
    return this.policies.map((policy) => {
      const passed = !policy.condition(context);
      return {
        policyId: policy.id,
        policyName: policy.name,
        passed,
        action: passed ? "log" : policy.action,
        severity: policy.severity,
        message: passed ? "OK" : policy.message,
        timestamp: Date.now(),
      };
    });
  }

  /** Check if action is allowed (returns true if no blocking policies triggered) */
  isAllowed(context: PolicyContext): { allowed: boolean; violations: PolicyResult[] } {
    const results = this.evaluate(context);
    const violations = results.filter((r) => !r.passed && r.action === "block");
    return { allowed: violations.length === 0, violations };
  }

  /** Log an audit entry */
  audit(entry: Omit<AuditEntry, "id" | "timestamp">): string {
    const id = generateId("audit");
    this.auditLog.push({ ...entry, id, timestamp: Date.now() });
    return id;
  }

  /** Get audit log */
  getAuditLog(limit?: number): readonly AuditEntry[] {
    const log = [...this.auditLog].reverse();
    return limit ? log.slice(0, limit) : log;
  }

  /** Calculate Trust Mesh Score */
  calculateTMS(): TrustMeshScores {
    const recentAudits = this.auditLog.slice(-100);
    const totalPolicies = this.policies.length || 1;

    // Explainability: % of audits with reasoning
    const withReasoning = recentAudits.filter((a) => a.reasoning).length;
    const explainability = recentAudits.length > 0
      ? (withReasoning / recentAudits.length) * 100
      : 100;

    // Compliance: % of evaluations that passed
    const totalViolations = recentAudits.reduce(
      (sum, a) => sum + a.policiesViolated.length, 0
    );
    const totalChecks = recentAudits.reduce(
      (sum, a) => sum + a.policiesEvaluated.length, 0
    ) || 1;
    const compliance = ((totalChecks - totalViolations) / totalChecks) * 100;

    // Safety: inverse of critical violations
    const criticalPolicies = this.policies.filter((p) => p.severity === "critical");
    const criticalViolations = recentAudits.filter((a) =>
      a.policiesViolated.some((v) =>
        criticalPolicies.some((cp) => cp.id === v)
      )
    ).length;
    const safety = recentAudits.length > 0
      ? ((recentAudits.length - criticalViolations) / recentAudits.length) * 100
      : 100;

    // Auditability: coverage of audit logging
    const auditability = Math.min(100, (this.auditLog.length / 10) * 100);

    // Weighted overall
    const overall =
      explainability * 0.25 +
      compliance * 0.30 +
      safety * 0.25 +
      auditability * 0.20;

    return { explainability, compliance, safety, auditability, overall };
  }

  /** Get guardrail configuration */
  getGuardrails(): Readonly<GuardrailConfig> {
    return Object.freeze({ ...this.guardrails });
  }
}

// ─── Pre-built Policies ──────────────────────────────────────────────────────

/** Block PII in outputs */
export const noPIIPolicy: Omit<Policy, "id"> = {
  name: "no-pii-in-output",
  description: "Prevent PII from appearing in agent outputs",
  severity: "critical",
  action: "block",
  condition: (ctx) => {
    const output = JSON.stringify(ctx.output || "");
    // Basic patterns — extend for production
    const piiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/,         // SSN
      /\b\d{16}\b/,                      // Credit card
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, // Email
    ];
    return piiPatterns.some((p) => p.test(output));
  },
  message: "Output contains potential PII — blocked by governance policy",
};

/** Prevent destructive operations without confirmation */
export const noDestructiveOpsPolicy: Omit<Policy, "id"> = {
  name: "no-destructive-ops",
  description: "Block destructive operations (delete, drop, truncate) without explicit approval",
  severity: "high",
  action: "block",
  condition: (ctx) => {
    const action = ctx.action.toLowerCase();
    const destructiveKeywords = ["delete", "drop", "truncate", "destroy", "remove_all", "force_push"];
    return destructiveKeywords.some((k) => action.includes(k));
  },
  message: "Destructive operation requires explicit human approval",
};

/** Cost threshold warning */
export function createCostPolicy(maxCostUSD: number): Omit<Policy, "id"> {
  return {
    name: "cost-threshold",
    description: `Warn when estimated cost exceeds $${maxCostUSD}`,
    severity: "medium",
    action: "warn",
    condition: (ctx) => {
      const cost = (ctx.metadata?.estimatedCost as number) || 0;
      return cost > maxCostUSD;
    },
    message: `Operation cost exceeds threshold of $${maxCostUSD}`,
  };
}

// ─── Factory ─────────────────────────────────────────────────────────────────

/** Create a Trust Mesh with sensible defaults */
export function createTrustMesh(guardrails?: GuardrailConfig): TrustMesh {
  const mesh = new TrustMesh(guardrails);
  mesh.addPolicy(noPIIPolicy);
  mesh.addPolicy(noDestructiveOpsPolicy);
  return mesh;
}
