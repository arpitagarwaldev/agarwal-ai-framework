"""Agents module — Multi-agent orchestration, circuit breakers, patterns."""

from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Optional

from .core import generate_id, with_retry


class AgentRole(str, Enum):
    ORCHESTRATOR = "orchestrator"
    SPECIALIST = "specialist"
    VALIDATOR = "validator"
    MONITOR = "monitor"
    WORKER = "worker"


class AgentStatus(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    TERMINATED = "terminated"


@dataclass
class AgentConfig:
    """Agent configuration."""
    name: str
    role: AgentRole = AgentRole.SPECIALIST
    description: str = ""
    model: str = "claude-sonnet-4"
    temperature: float = 0.7
    max_tokens: int = 4096
    system_prompt: Optional[str] = None
    max_retries: int = 2
    circuit_breaker_threshold: int = 5
    circuit_breaker_timeout: float = 30.0


@dataclass
class AgentMessage:
    id: str
    role: str
    content: str
    timestamp: float


@dataclass
class AgentResult:
    id: str
    agent_id: str
    status: str  # "success" | "failure" | "escalated"
    output: str
    confidence: float = 0.0
    tokens_used: int = 0
    duration_ms: float = 0.0
    tool_calls: list[dict] = field(default_factory=list)


class Agent:
    """AI Agent with circuit breaker and retry logic."""

    def __init__(self, config: AgentConfig):
        self.id = generate_id("agent")
        self.config = config
        self._status = AgentStatus.IDLE
        self._messages: list[AgentMessage] = []
        self._failure_count = 0
        self._circuit_state = "closed"  # closed | open | half-open

        if config.system_prompt:
            self._messages.append(AgentMessage(
                id=generate_id("msg"), role="system",
                content=config.system_prompt, timestamp=time.time()
            ))

    @property
    def status(self) -> AgentStatus:
        return self._status

    async def execute(self, input_text: str) -> AgentResult:
        """Execute a task."""
        if self._circuit_state == "open":
            return AgentResult(
                id=generate_id("result"), agent_id=self.id,
                status="failure", output="Circuit breaker OPEN — agent unavailable"
            )

        self._status = AgentStatus.RUNNING
        start_time = time.time()

        self._messages.append(AgentMessage(
            id=generate_id("msg"), role="user",
            content=input_text, timestamp=time.time()
        ))

        try:
            result = await with_retry(
                lambda: self._process(input_text),
                max_retries=self.config.max_retries,
            )
            self._on_success()
            self._status = AgentStatus.COMPLETED
            return AgentResult(
                id=generate_id("result"), agent_id=self.id,
                status="success", output=result, confidence=0.85,
                duration_ms=(time.time() - start_time) * 1000,
            )
        except Exception as e:
            self._on_failure()
            self._status = AgentStatus.FAILED
            return AgentResult(
                id=generate_id("result"), agent_id=self.id,
                status="failure", output=str(e),
                duration_ms=(time.time() - start_time) * 1000,
            )

    async def _process(self, input_text: str) -> str:
        """Override this method to integrate with your LLM provider."""
        return f"[Agent {self.config.name}] Processed: {input_text}"

    def pause(self): self._status = AgentStatus.PAUSED
    def resume(self):
        if self._status == AgentStatus.PAUSED:
            self._status = AgentStatus.IDLE
    def terminate(self): self._status = AgentStatus.TERMINATED

    def get_history(self) -> list[AgentMessage]:
        return list(self._messages)

    def _on_success(self):
        self._failure_count = 0
        if self._circuit_state == "half-open":
            self._circuit_state = "closed"

    def _on_failure(self):
        self._failure_count += 1
        if self._failure_count >= self.config.circuit_breaker_threshold:
            self._circuit_state = "open"
            asyncio.get_event_loop().call_later(
                self.config.circuit_breaker_timeout,
                self._half_open
            )

    def _half_open(self):
        self._circuit_state = "half-open"
        self._failure_count = 0


class Orchestrator:
    """Multi-agent orchestrator with routing strategies."""

    def __init__(self, name: str, strategy: str = "round-robin", agents: Optional[list[Agent]] = None):
        self.id = generate_id("orch")
        self.name = name
        self.strategy = strategy
        self._agents: list[Agent] = agents or []
        self._index = 0

    def register(self, agent: Agent):
        """Register an agent."""
        self._agents.append(agent)

    def remove(self, agent_id: str):
        """Remove an agent by ID."""
        self._agents = [a for a in self._agents if a.id != agent_id]

    async def dispatch(self, input_text: str) -> AgentResult:
        """Dispatch task to best available agent."""
        agent = self._select_agent()
        if not agent:
            return AgentResult(
                id=generate_id("result"), agent_id="none",
                status="failure", output="No available agents"
            )
        return await agent.execute(input_text)

    async def fan_out(self, input_text: str, agent_ids: Optional[list[str]] = None) -> list[AgentResult]:
        """Send task to multiple agents in parallel."""
        agents = [a for a in self._agents if not agent_ids or a.id in agent_ids]
        tasks = [a.execute(input_text) for a in agents]
        return await asyncio.gather(*tasks)

    @property
    def agents(self) -> list[Agent]:
        return list(self._agents)

    def _select_agent(self) -> Optional[Agent]:
        available = [a for a in self._agents if a.status in (AgentStatus.IDLE, AgentStatus.COMPLETED)]
        if not available:
            return None
        if self.strategy == "round-robin":
            agent = available[self._index % len(available)]
            self._index += 1
            return agent
        return available[0]


# ─── Factory Functions ────────────────────────────────────────────────────────

def create_agent(
    name: str,
    role: AgentRole = AgentRole.SPECIALIST,
    model: str = "claude-sonnet-4",
    system_prompt: Optional[str] = None,
    **kwargs,
) -> Agent:
    """Create a new agent."""
    config = AgentConfig(name=name, role=role, model=model, system_prompt=system_prompt, **kwargs)
    return Agent(config)


def create_orchestrator(
    name: str,
    strategy: str = "round-robin",
    agents: Optional[list[Agent]] = None,
) -> Orchestrator:
    """Create a multi-agent orchestrator."""
    return Orchestrator(name=name, strategy=strategy, agents=agents)


def create_specialist(name: str, specialization: str, model: str = "claude-sonnet-4") -> Agent:
    """Quick-create a specialist agent."""
    return create_agent(
        name=name, role=AgentRole.SPECIALIST, model=model,
        system_prompt=f"You are a specialist in {specialization}. Focus exclusively on this domain.",
    )
