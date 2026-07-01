"""Metrics module — AQI scoring, AADV-Next velocity, statistical evaluation."""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class AgentMetricEvent:
    agent_id: str
    timestamp: float
    task_completed: bool
    human_intervention: bool
    task_complexity: str  # trivial | simple | moderate | complex | critical
    execution_time_ms: float
    tokens_used: int
    cost_usd: float
    quality_score: Optional[float] = None  # 0-100
    had_error: bool = False
    error_severity: Optional[str] = None  # critical | high | medium | low


@dataclass
class AQIScores:
    autonomy: float
    reliability: float
    alignment: float
    efficiency: float
    adaptability: float
    overall: float


@dataclass
class AADVResult:
    base_velocity: float
    ai_amplification: float
    rework_penalty: float
    adjusted_velocity: float
    confidence_interval: tuple[float, float]


@dataclass
class SprintData:
    story_points_completed: float
    total_story_points: float
    sprint_duration: int  # days
    ai_contribution_ratio: float  # 0-1
    ai_churn_rate: float  # 0-1
    defect_rate: float  # 0-1
    test_pass_rate: float  # 0-1


COMPLEXITY_WEIGHTS = {"trivial": 0.5, "simple": 1.0, "moderate": 2.0, "complex": 4.0, "critical": 8.0}
SEVERITY_WEIGHTS = {"critical": 1.0, "high": 0.7, "medium": 0.3, "low": 0.1}


class AQICalculator:
    """Agent Quality Index calculator."""

    def __init__(self, weights: Optional[dict[str, float]] = None):
        self._events: list[AgentMetricEvent] = []
        self._weights = weights or {
            "autonomy": 0.20, "reliability": 0.25, "alignment": 0.25,
            "efficiency": 0.15, "adaptability": 0.15,
        }

    def record(self, event: AgentMetricEvent):
        """Record a metric event."""
        self._events.append(event)

    def record_batch(self, events: list[AgentMetricEvent]):
        """Record multiple events."""
        self._events.extend(events)

    def calculate(self, agent_id: Optional[str] = None) -> AQIScores:
        """Calculate AQI scores."""
        events = [e for e in self._events if not agent_id or e.agent_id == agent_id]
        if not events:
            return AQIScores(0, 0, 0, 0, 0, 0)

        autonomy = self._calc_autonomy(events)
        reliability = self._calc_reliability(events)
        alignment = self._calc_alignment(events)
        efficiency = self._calc_efficiency(events)
        adaptability = self._calc_adaptability(events)

        overall = (
            autonomy * self._weights["autonomy"]
            + reliability * self._weights["reliability"]
            + alignment * self._weights["alignment"]
            + efficiency * self._weights["efficiency"]
            + adaptability * self._weights["adaptability"]
        )
        return AQIScores(autonomy, reliability, alignment, efficiency, adaptability, overall)

    def interpret(self, score: float) -> tuple[str, str]:
        """Interpret an AQI score. Returns (rating, action)."""
        if score >= 90: return ("Excellent", "Ready for expanded autonomy")
        if score >= 75: return ("Good", "Production-ready, normal monitoring")
        if score >= 60: return ("Acceptable", "Production with increased oversight")
        if score >= 40: return ("Needs Improvement", "Restricted to non-critical tasks")
        return ("Failing", "Remove from production, retrain/redesign")

    def _calc_autonomy(self, events: list[AgentMetricEvent]) -> float:
        weighted_auto = sum(COMPLEXITY_WEIGHTS.get(e.task_complexity, 1) for e in events if e.task_completed and not e.human_intervention)
        weighted_total = sum(COMPLEXITY_WEIGHTS.get(e.task_complexity, 1) for e in events)
        return (weighted_auto / weighted_total * 100) if weighted_total > 0 else 0

    def _calc_reliability(self, events: list[AgentMetricEvent]) -> float:
        weighted_failures = sum(SEVERITY_WEIGHTS.get(e.error_severity or "", 0) for e in events if e.had_error)
        rate = weighted_failures / len(events)
        return max(0, (1 - rate) * 100)

    def _calc_alignment(self, events: list[AgentMetricEvent]) -> float:
        scored = [e for e in events if e.quality_score is not None]
        if not scored: return 75
        return sum(e.quality_score for e in scored) / len(scored)  # type: ignore

    def _calc_efficiency(self, events: list[AgentMetricEvent]) -> float:
        completed = [e for e in events if e.task_completed]
        if not completed: return 0
        avg_cost = sum(e.cost_usd for e in completed) / len(completed)
        avg_time = sum(e.execution_time_ms for e in completed) / len(completed)
        cost_score = max(0, 100 - avg_cost * 1000)
        time_score = max(0, 100 - avg_time / 1000)
        return (cost_score + time_score) / 2

    def _calc_adaptability(self, events: list[AgentMetricEvent]) -> float:
        by_complexity: dict[str, list[bool]] = {}
        for e in events:
            by_complexity.setdefault(e.task_complexity, []).append(e.task_completed)
        if len(by_complexity) <= 1: return 70
        rates = [sum(v) / len(v) for v in by_complexity.values()]
        avg = sum(rates) / len(rates)
        variance = sum((r - avg) ** 2 for r in rates) / len(rates)
        return max(0, (1 - math.sqrt(variance)) * 100)


class AADVCalculator:
    """AI-Adjusted Delivery Velocity calculator."""

    def __init__(self, calibration_factor: float = 0.5):
        self._sprints: list[SprintData] = []
        self._calibration = calibration_factor

    def add_sprint(self, sprint: SprintData):
        """Add sprint data."""
        self._sprints.append(sprint)

    def calculate(self, sprint: Optional[SprintData] = None) -> AADVResult:
        """Calculate AADV-Next."""
        s = sprint or (self._sprints[-1] if self._sprints else None)
        if not s:
            return AADVResult(0, 1, 0, 0, (0, 0))

        base = s.story_points_completed / (s.sprint_duration / 7)
        quality = (1 - s.defect_rate) * s.test_pass_rate
        amplification = 1 + self._calibration * s.ai_contribution_ratio * quality
        penalty = 0.3 * s.ai_churn_rate
        velocity = base * amplification * (1 - penalty)

        # Confidence interval
        velocities = [sp.story_points_completed / (sp.sprint_duration / 7) for sp in self._sprints]
        std = self._std_dev(velocities) if len(velocities) > 1 else 0
        margin = 1.645 * std
        return AADVResult(base, amplification, penalty, velocity, (velocity - margin, velocity + margin))

    @staticmethod
    def _std_dev(values: list[float]) -> float:
        if len(values) < 2: return 0
        mean = sum(values) / len(values)
        variance = sum((v - mean) ** 2 for v in values) / (len(values) - 1)
        return math.sqrt(variance)


# ─── Factory ──────────────────────────────────────────────────────────────────

def create_aqi(weights: Optional[dict[str, float]] = None) -> AQICalculator:
    return AQICalculator(weights)

def create_aadv(calibration_factor: float = 0.5) -> AADVCalculator:
    return AADVCalculator(calibration_factor)
