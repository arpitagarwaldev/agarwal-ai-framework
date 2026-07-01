"""Router module — Intelligent LLM routing, cost optimization, A/B testing."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

from .core import generate_id


@dataclass
class ModelEndpoint:
    id: str
    name: str
    provider: str
    model: str
    cost_per_1k_input: float
    cost_per_1k_output: float
    avg_latency_ms: float
    quality_score: float  # 0-100
    max_tokens: int
    enabled: bool = True
    tags: list[str] = field(default_factory=list)


@dataclass
class RoutingDecision:
    endpoint: ModelEndpoint
    reason: str
    estimated_cost: float
    estimated_latency: float
    alternatives: list[ModelEndpoint] = field(default_factory=list)


class LLMRouter:
    """Intelligent model routing with multiple strategies."""

    def __init__(self, strategy: str = "balanced"):
        self.strategy = strategy
        self._endpoints: list[ModelEndpoint] = []
        self._index = 0

    def add_endpoint(self, name: str, provider: str, model: str, cost_input: float, cost_output: float, latency_ms: float, quality: float, max_tokens: int = 128000, tags: Optional[list[str]] = None) -> str:
        ep_id = generate_id("ep")
        self._endpoints.append(ModelEndpoint(id=ep_id, name=name, provider=provider, model=model, cost_per_1k_input=cost_input, cost_per_1k_output=cost_output, avg_latency_ms=latency_ms, quality_score=quality, max_tokens=max_tokens, tags=tags or []))
        return ep_id

    def route(self, prompt: str, max_cost: Optional[float] = None, max_latency: Optional[float] = None, min_quality: Optional[float] = None, preferred_providers: Optional[list[str]] = None) -> RoutingDecision:
        """Route to the best endpoint given constraints."""
        available = [ep for ep in self._endpoints if ep.enabled]

        if preferred_providers:
            preferred = [ep for ep in available if ep.provider in preferred_providers]
            if preferred: available = preferred
        if max_latency:
            available = [ep for ep in available if ep.avg_latency_ms <= max_latency]
        if min_quality:
            available = [ep for ep in available if ep.quality_score >= min_quality]
        if max_cost:
            est_tokens = len(prompt) / 4 + 1000
            available = [ep for ep in available if (est_tokens / 1000) * (ep.cost_per_1k_input + ep.cost_per_1k_output) / 2 <= max_cost]

        if not available:
            raise ValueError("No endpoints match constraints")

        if self.strategy == "cost":
            available.sort(key=lambda e: e.cost_per_1k_input + e.cost_per_1k_output)
            selected, reason = available[0], "Cheapest"
        elif self.strategy == "latency":
            available.sort(key=lambda e: e.avg_latency_ms)
            selected, reason = available[0], "Lowest latency"
        elif self.strategy == "quality":
            available.sort(key=lambda e: -e.quality_score)
            selected, reason = available[0], "Highest quality"
        elif self.strategy == "round-robin":
            selected = available[self._index % len(available)]
            self._index += 1
            reason = "Round-robin"
        else:  # balanced
            max_cost_val = max(e.cost_per_1k_input + e.cost_per_1k_output for e in available) or 1
            max_lat = max(e.avg_latency_ms for e in available) or 1
            available.sort(key=lambda e: -(
                (e.quality_score / 100) * 0.4 +
                (1 - (e.cost_per_1k_input + e.cost_per_1k_output) / max_cost_val) * 0.3 +
                (1 - e.avg_latency_ms / max_lat) * 0.3
            ))
            selected, reason = available[0], "Best balance"

        est_tokens = len(prompt) / 4 + 1000
        est_cost = (est_tokens / 1000) * (selected.cost_per_1k_input + selected.cost_per_1k_output) / 2

        return RoutingDecision(endpoint=selected, reason=reason, estimated_cost=est_cost, estimated_latency=selected.avg_latency_ms, alternatives=available[1:4])

    def get_endpoints(self) -> list[ModelEndpoint]: return list(self._endpoints)
    def set_enabled(self, ep_id: str, enabled: bool):
        for ep in self._endpoints:
            if ep.id == ep_id: ep.enabled = enabled


def create_router(strategy: str = "balanced") -> LLMRouter:
    return LLMRouter(strategy)

def create_default_router() -> LLMRouter:
    """Pre-configured with popular models."""
    r = LLMRouter("balanced")
    r.add_endpoint("GPT-4o", "openai", "gpt-4o", 0.0025, 0.01, 800, 92, tags=["reasoning", "code"])
    r.add_endpoint("GPT-4o-mini", "openai", "gpt-4o-mini", 0.00015, 0.0006, 400, 78, tags=["fast", "cheap"])
    r.add_endpoint("Claude Sonnet 4", "anthropic", "claude-sonnet-4", 0.003, 0.015, 900, 93, 200000, tags=["reasoning", "code"])
    r.add_endpoint("Claude Haiku", "anthropic", "claude-haiku", 0.00025, 0.00125, 300, 75, 200000, tags=["fast", "cheap"])
    r.add_endpoint("Gemini Flash", "google", "gemini-2.0-flash", 0.0001, 0.0004, 250, 76, 1000000, tags=["fast", "cheap"])
    return r
