"""Governance module — Trust Mesh, policy engine, audit trails, safety."""

from __future__ import annotations

import re
import time
from dataclasses import dataclass, field
from typing import Any, Callable, Optional

from .core import generate_id


@dataclass
class PolicyContext:
    agent_id: str
    action: str
    input: dict[str, Any]
    output: Optional[dict[str, Any]] = None
    metadata: Optional[dict[str, Any]] = None


@dataclass
class Policy:
    id: str
    name: str
    description: str
    severity: str  # critical | high | medium | low
    action: str  # block | warn | log | escalate
    condition: Callable[[PolicyContext], bool]
    message: str


@dataclass
class PolicyResult:
    policy_id: str
    policy_name: str
    passed: bool
    action: str
    severity: str
    message: str
    timestamp: float


@dataclass
class AuditEntry:
    id: str
    timestamp: float
    agent_id: str
    action: str
    input: Any
    output: Any
    reasoning: Optional[str] = None
    policies_evaluated: list[str] = field(default_factory=list)
    policies_violated: list[str] = field(default_factory=list)
    trust_mesh_score: float = 0.0


@dataclass
class TrustMeshScores:
    explainability: float
    compliance: float
    safety: float
    auditability: float
    overall: float


class TrustMesh:
    """Governance engine with policy evaluation, auditing, and TMS scoring."""

    def __init__(self, max_token_budget: int = 100000, cost_cap: float = 10.0):
        self._policies: list[Policy] = []
        self._audit_log: list[AuditEntry] = []
        self.max_token_budget = max_token_budget
        self.cost_cap = cost_cap

    def add_policy(
        self,
        name: str,
        description: str,
        severity: str,
        action: str,
        condition: Callable[[PolicyContext], bool],
        message: str,
    ) -> str:
        """Register a governance policy."""
        policy_id = generate_id("policy")
        self._policies.append(Policy(
            id=policy_id, name=name, description=description,
            severity=severity, action=action, condition=condition, message=message,
        ))
        return policy_id

    def remove_policy(self, policy_id: str):
        """Remove a policy by ID."""
        self._policies = [p for p in self._policies if p.id != policy_id]

    def evaluate(self, context: PolicyContext) -> list[PolicyResult]:
        """Evaluate all policies against a context."""
        results = []
        for policy in self._policies:
            triggered = policy.condition(context)
            results.append(PolicyResult(
                policy_id=policy.id, policy_name=policy.name,
                passed=not triggered, action="log" if not triggered else policy.action,
                severity=policy.severity, message="OK" if not triggered else policy.message,
                timestamp=time.time(),
            ))
        return results

    def is_allowed(self, context: PolicyContext) -> tuple[bool, list[PolicyResult]]:
        """Check if action is allowed (no blocking policies triggered)."""
        results = self.evaluate(context)
        violations = [r for r in results if not r.passed and r.action == "block"]
        return len(violations) == 0, violations

    def audit(self, agent_id: str, action: str, input_data: Any, output_data: Any, reasoning: Optional[str] = None) -> str:
        """Log an audit entry."""
        entry_id = generate_id("audit")
        self._audit_log.append(AuditEntry(
            id=entry_id, timestamp=time.time(), agent_id=agent_id,
            action=action, input=input_data, output=output_data, reasoning=reasoning,
        ))
        return entry_id

    def calculate_tms(self) -> TrustMeshScores:
        """Calculate Trust Mesh Score."""
        recent = self._audit_log[-100:]
        with_reasoning = sum(1 for a in recent if a.reasoning) if recent else 0
        explainability = (with_reasoning / len(recent) * 100) if recent else 100

        total_violations = sum(len(a.policies_violated) for a in recent)
        total_checks = sum(len(a.policies_evaluated) for a in recent) or 1
        compliance = ((total_checks - total_violations) / total_checks) * 100

        critical_policies = [p for p in self._policies if p.severity == "critical"]
        critical_ids = {p.id for p in critical_policies}
        critical_violations = sum(1 for a in recent if any(v in critical_ids for v in a.policies_violated))
        safety = ((len(recent) - critical_violations) / len(recent) * 100) if recent else 100

        auditability = min(100, (len(self._audit_log) / 10) * 100)

        overall = explainability * 0.25 + compliance * 0.30 + safety * 0.25 + auditability * 0.20
        return TrustMeshScores(explainability=explainability, compliance=compliance, safety=safety, auditability=auditability, overall=overall)

    def get_audit_log(self, limit: int = 50) -> list[AuditEntry]:
        """Get recent audit entries."""
        return list(reversed(self._audit_log[-limit:]))

    @property
    def policies(self) -> list[Policy]:
        return list(self._policies)


# ─── Pre-built Policies ──────────────────────────────────────────────────────

def _pii_condition(ctx: PolicyContext) -> bool:
    """Detect PII in output."""
    output = str(ctx.output or "")
    patterns = [r"\b\d{3}-\d{2}-\d{4}\b", r"\b\d{16}\b", r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b"]
    return any(re.search(p, output, re.IGNORECASE) for p in patterns)


def _destructive_condition(ctx: PolicyContext) -> bool:
    """Detect destructive operations."""
    keywords = ["delete", "drop", "truncate", "destroy", "remove_all", "force_push"]
    return any(k in ctx.action.lower() for k in keywords)


def create_trust_mesh(max_token_budget: int = 100000, cost_cap: float = 10.0) -> TrustMesh:
    """Create a Trust Mesh with sensible default policies."""
    mesh = TrustMesh(max_token_budget=max_token_budget, cost_cap=cost_cap)
    mesh.add_policy("no-pii-in-output", "Prevent PII in agent outputs", "critical", "block", _pii_condition, "Output contains potential PII")
    mesh.add_policy("no-destructive-ops", "Block destructive operations", "high", "block", _destructive_condition, "Destructive operation requires approval")
    return mesh
