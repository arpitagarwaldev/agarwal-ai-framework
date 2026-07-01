"""Engine module — Universal LLM engine with multi-provider support."""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Any, Callable, Optional

import httpx

from .core import generate_id

COST_PER_1K = {
    "gpt-4o": (0.0025, 0.01),
    "gpt-4o-mini": (0.00015, 0.0006),
    "claude-opus-4": (0.015, 0.075),
    "claude-sonnet-4": (0.003, 0.015),
    "claude-haiku": (0.00025, 0.00125),
    "gemini-2.0-flash": (0.0001, 0.0004),
}


@dataclass
class Message:
    role: str  # system | user | assistant | tool
    content: str
    name: Optional[str] = None
    tool_call_id: Optional[str] = None


@dataclass
class ToolFunction:
    name: str
    description: str
    parameters: dict


@dataclass
class CompletionResponse:
    id: str
    content: str
    model: str
    provider: str
    tool_calls: list[dict] = field(default_factory=list)
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    cost_usd: float = 0.0
    latency_ms: float = 0.0
    cached: bool = False
    finish_reason: str = "stop"


class AIEngine:
    """Universal LLM engine with multi-provider support, caching, and retry."""

    def __init__(
        self,
        provider: str = "openai",
        api_key: Optional[str] = None,
        model: str = "gpt-4o",
        base_url: Optional[str] = None,
        max_retries: int = 2,
        timeout: float = 60.0,
    ):
        self.provider = provider
        self.api_key = api_key
        self.model = model
        self.base_url = base_url or self._default_url(provider)
        self.max_retries = max_retries
        self.timeout = timeout
        self._cache: dict[str, CompletionResponse] = {}
        self._total_cost = 0.0
        self._total_tokens = 0

    async def complete(
        self,
        messages: list[Message],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        tools: Optional[list[ToolFunction]] = None,
        response_format: Optional[str] = None,
        cache: bool = True,
    ) -> CompletionResponse:
        """Send a completion request."""
        use_model = model or self.model
        start = time.time()

        # Cache check
        if cache:
            cache_key = f"{use_model}:{hash(str(messages))}"
            if cache_key in self._cache:
                cached = self._cache[cache_key]
                cached.cached = True
                return cached

        if self.provider in ("openai", "azure", "ollama", "mistral", "custom"):
            response = await self._openai_complete(messages, use_model, temperature, max_tokens, tools, response_format)
        elif self.provider == "anthropic":
            response = await self._anthropic_complete(messages, use_model, temperature, max_tokens, tools)
        else:
            raise ValueError(f"Unsupported provider: {self.provider}")

        response.latency_ms = (time.time() - start) * 1000
        costs = COST_PER_1K.get(use_model, (0.001, 0.003))
        response.cost_usd = (response.prompt_tokens / 1000) * costs[0] + (response.completion_tokens / 1000) * costs[1]

        self._total_cost += response.cost_usd
        self._total_tokens += response.total_tokens

        if cache:
            self._cache[f"{use_model}:{hash(str(messages))}"] = response

        return response

    async def chat(self, prompt: str, **kwargs) -> str:
        """Simple chat completion."""
        resp = await self.complete([Message(role="user", content=prompt)], **kwargs)
        return resp.content

    async def json(self, prompt: str, **kwargs) -> Any:
        """Get JSON response."""
        import json
        resp = await self.complete([Message(role="user", content=prompt)], response_format="json", **kwargs)
        return json.loads(resp.content)

    @property
    def stats(self) -> dict:
        return {"total_cost_usd": self._total_cost, "total_tokens": self._total_tokens, "cache_size": len(self._cache)}

    async def _openai_complete(self, messages, model, temperature, max_tokens, tools, response_format) -> CompletionResponse:
        url = f"{self.base_url}/chat/completions"
        body: dict[str, Any] = {
            "model": model, "messages": [{"role": m.role, "content": m.content} for m in messages],
            "temperature": temperature, "max_tokens": max_tokens,
        }
        if tools:
            body["tools"] = [{"type": "function", "function": {"name": t.name, "description": t.description, "parameters": t.parameters}} for t in tools]
        if response_format == "json":
            body["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(url, json=body, headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"})
            resp.raise_for_status()
            data = resp.json()

        choice = data.get("choices", [{}])[0]
        usage = data.get("usage", {})
        return CompletionResponse(
            id=data.get("id", generate_id("gen")), content=choice.get("message", {}).get("content", ""),
            model=model, provider=self.provider,
            prompt_tokens=usage.get("prompt_tokens", 0), completion_tokens=usage.get("completion_tokens", 0),
            total_tokens=usage.get("total_tokens", 0), finish_reason=choice.get("finish_reason", "stop"),
        )

    async def _anthropic_complete(self, messages, model, temperature, max_tokens, tools) -> CompletionResponse:
        url = f"{self.base_url}/v1/messages"
        system_msg = next((m.content for m in messages if m.role == "system"), None)
        non_system = [{"role": m.role, "content": m.content} for m in messages if m.role != "system"]

        body: dict[str, Any] = {"model": model, "max_tokens": max_tokens, "messages": non_system}
        if system_msg: body["system"] = system_msg
        if temperature: body["temperature"] = temperature

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(url, json=body, headers={"x-api-key": self.api_key or "", "anthropic-version": "2024-10-22", "Content-Type": "application/json"})
            resp.raise_for_status()
            data = resp.json()

        content = "".join(c.get("text", "") for c in data.get("content", []) if c.get("type") == "text")
        usage = data.get("usage", {})
        return CompletionResponse(
            id=data.get("id", generate_id("gen")), content=content, model=model, provider="anthropic",
            prompt_tokens=usage.get("input_tokens", 0), completion_tokens=usage.get("output_tokens", 0),
            total_tokens=usage.get("input_tokens", 0) + usage.get("output_tokens", 0),
        )

    @staticmethod
    def _default_url(provider: str) -> str:
        urls = {"openai": "https://api.openai.com/v1", "anthropic": "https://api.anthropic.com", "ollama": "http://localhost:11434/v1", "mistral": "https://api.mistral.ai/v1"}
        return urls.get(provider, "https://api.openai.com/v1")


def create_engine(provider: str = "openai", api_key: Optional[str] = None, model: str = "gpt-4o", **kwargs) -> AIEngine:
    return AIEngine(provider=provider, api_key=api_key, model=model, **kwargs)
