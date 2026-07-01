"""Core module — Framework initialization, configuration, utilities."""

from __future__ import annotations

import asyncio
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Optional, TypeVar

T = TypeVar("T")


class Layer(str, Enum):
    AGENT = "agent"
    GOVERNANCE = "governance"
    ALGORITHM = "algorithm"
    RESILIENT = "resilient"
    WORKFLOW = "workflow"
    AUTONOMOUS = "autonomous"
    LIFECYCLE = "lifecycle"


class LogLevel(str, Enum):
    DEBUG = "debug"
    INFO = "info"
    WARN = "warn"
    ERROR = "error"


@dataclass
class AgarwalConfig:
    """Framework configuration."""
    name: str = "agarwal-project"
    log_level: LogLevel = LogLevel.INFO
    environment: str = "development"
    max_retries: int = 3
    timeout_ms: int = 30000
    telemetry: bool = False
    enabled_layers: list[Layer] = field(default_factory=lambda: [
        Layer.AGENT, Layer.GOVERNANCE, Layer.WORKFLOW, Layer.AUTONOMOUS, Layer.LIFECYCLE
    ])


class Agarwal:
    """Main AGARWAL framework instance."""

    def __init__(self, config: Optional[AgarwalConfig] = None):
        self.config = config or AgarwalConfig()
        self._initialized = False

    def init(self) -> "Agarwal":
        """Initialize the framework."""
        if self._initialized:
            self._log("warn", "Framework already initialized")
            return self
        self._log("info", f"Initializing AGARWAL Framework: {self.config.name}")
        self._log("info", f"Active layers: {[l.value for l in self.config.enabled_layers]}")
        self._initialized = True
        return self

    def is_layer_enabled(self, layer: Layer) -> bool:
        """Check if a layer is enabled."""
        return layer in self.config.enabled_layers

    def enable_layer(self, layer: Layer) -> "Agarwal":
        """Enable a layer."""
        if layer not in self.config.enabled_layers:
            self.config.enabled_layers.append(layer)
        return self

    def disable_layer(self, layer: Layer) -> "Agarwal":
        """Disable a layer."""
        self.config.enabled_layers = [l for l in self.config.enabled_layers if l != layer]
        return self

    def get_active_layers(self) -> list[str]:
        """Get list of active layer names."""
        return [l.value for l in self.config.enabled_layers]

    def _log(self, level: str, message: str):
        levels = ["debug", "info", "warn", "error"]
        if levels.index(level) >= levels.index(self.config.log_level.value):
            print(f"[AGARWAL:{level.upper()}] {message}")


def create_agarwal(name: str = "agarwal-project", **kwargs) -> Agarwal:
    """Create and initialize an AGARWAL framework instance."""
    config = AgarwalConfig(name=name, **kwargs)
    return Agarwal(config).init()


# ─── Utilities ────────────────────────────────────────────────────────────────

def generate_id(prefix: str = "ag") -> str:
    """Generate a unique timestamped ID."""
    timestamp = hex(int(time.time() * 1000))[2:]
    random_part = uuid.uuid4().hex[:8]
    return f"{prefix}_{timestamp}_{random_part}"


async def with_retry(
    fn: Callable[..., Any],
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 10.0,
) -> Any:
    """Retry an async function with exponential backoff."""
    last_error: Optional[Exception] = None
    for attempt in range(max_retries + 1):
        try:
            return await fn()
        except Exception as e:
            last_error = e
            if attempt == max_retries:
                break
            delay = min(base_delay * (2 ** attempt), max_delay)
            await asyncio.sleep(delay)
    raise last_error or RuntimeError("All retries exhausted")


def deep_merge(base: dict, override: dict) -> dict:
    """Deep merge two dictionaries."""
    result = {**base}
    for key, value in override.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = value
    return result
