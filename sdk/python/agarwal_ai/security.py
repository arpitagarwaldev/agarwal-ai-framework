"""Security module — Input scanning, output filtering, rate limiting, prompt injection defense."""

from __future__ import annotations

import re
import time
from dataclasses import dataclass, field
from typing import Callable, Optional

from .core import generate_id

INJECTION_PATTERNS = [
    (r"ignore\s+(all\s+)?previous\s+(instructions|prompts|rules)", "prompt-injection", "critical"),
    (r"you\s+are\s+now\s+(DAN|a\s+new|unrestricted)", "jailbreak", "critical"),
    (r"```\s*(system|admin|root)\b", "role-injection", "high"),
    (r"\[SYSTEM\]|\[ADMIN\]|\[OVERRIDE\]", "role-tag-injection", "high"),
    (r"forget\s+(everything|all|your\s+instructions)", "memory-wipe", "high"),
    (r"output\s+(the|your)\s+(system\s+prompt|instructions|rules)", "prompt-extraction", "medium"),
    (r"base64\s*decode|eval\(|exec\(|__import__", "code-injection", "critical"),
    (r"<script|javascript:|on(error|load|click)\s*=", "xss-attempt", "high"),
    (r";\s*(DROP|DELETE|TRUNCATE|ALTER)\s", "sql-injection", "critical"),
    (r"\{\{.*\}\}|\$\{.*\}|<%.*%>", "template-injection", "high"),
]

SECRET_PATTERNS = [
    ("AWS Key", r"AKIA[0-9A-Z]{16}"),
    ("GitHub Token", r"gh[pousr]_[A-Za-z0-9_]{36,}"),
    ("JWT", r"eyJ[A-Za-z0-9\-_]+\.eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_.+/=]+"),
    ("Private Key", r"-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----"),
    ("API Key", r"(?:api[_\-]?key|apikey)\s*[=:]\s*['\"]?[A-Za-z0-9_\-]{20,}"),
    ("Connection String", r"(?:mongodb|postgres|mysql|redis)://[^\s]+"),
    ("SSN", r"\b\d{3}-\d{2}-\d{4}\b"),
    ("Credit Card", r"\b(?:\d{4}[- ]?){3}\d{4}\b"),
    ("Email", r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Z|a-z]{2,}\b"),
]


@dataclass
class ThreatDetection:
    type: str
    severity: str
    description: str
    original_text: Optional[str] = None


@dataclass
class ScanResult:
    safe: bool
    threats: list[ThreatDetection]
    sanitized: str
    score: int  # 0-100, 100 = safe


@dataclass
class RateLimitResult:
    allowed: bool
    remaining: int
    reset_ms: float
    retry_after_ms: Optional[float] = None


class InputScanner:
    """Scan inputs for prompt injection and other threats."""

    def __init__(self, max_input_length: int = 50000):
        self.max_input_length = max_input_length
        self._custom_patterns: list[tuple[str, str, str]] = []

    def add_pattern(self, pattern: str, threat_type: str, severity: str) -> "InputScanner":
        self._custom_patterns.append((pattern, threat_type, severity))
        return self

    def scan(self, text: str) -> ScanResult:
        threats: list[ThreatDetection] = []
        sanitized = text

        if len(text) > self.max_input_length:
            threats.append(ThreatDetection("length-overflow", "medium", f"Input exceeds max length ({len(text)} > {self.max_input_length})"))
            sanitized = text[:self.max_input_length]

        all_patterns = INJECTION_PATTERNS + self._custom_patterns
        for pattern, threat_type, severity in all_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                threats.append(ThreatDetection(threat_type, severity, f"Detected {threat_type}", match.group()[:100]))

        # Hidden characters
        if re.search(r"[\u200B-\u200F\u2028-\u202F\uFEFF\u00AD]", text):
            threats.append(ThreatDetection("hidden-characters", "medium", "Contains invisible/zero-width characters"))
            sanitized = re.sub(r"[\u200B-\u200F\u2028-\u202F\uFEFF\u00AD]", "", sanitized)

        severity_scores = {"critical": 40, "high": 25, "medium": 10, "low": 5}
        penalty = sum(severity_scores.get(t.severity, 0) for t in threats)
        score = max(0, 100 - penalty)

        return ScanResult(safe=len(threats) == 0, threats=threats, sanitized=sanitized, score=score)


class OutputFilter:
    """Filter secrets and sensitive data from outputs."""

    def __init__(self):
        self._patterns = [(name, re.compile(p, re.IGNORECASE)) for name, p in SECRET_PATTERNS]

    def add_pattern(self, name: str, pattern: str) -> "OutputFilter":
        self._patterns.append((name, re.compile(pattern, re.IGNORECASE)))
        return self

    def filter(self, text: str) -> tuple[str, list[tuple[str, int]]]:
        """Filter output, returning (filtered_text, detections)."""
        filtered = text
        detections: list[tuple[str, int]] = []
        for name, pattern in self._patterns:
            matches = pattern.findall(text)
            if matches:
                detections.append((name, len(matches)))
                filtered = pattern.sub(f"[REDACTED:{name}]", filtered)
        return filtered, detections

    def has_secrets(self, text: str) -> bool:
        return any(p.search(text) for _, p in self._patterns)


class RateLimiter:
    """Token-bucket rate limiter."""

    def __init__(self, window_ms: float = 60000, max_requests: int = 60):
        self.window_ms = window_ms
        self.max_requests = max_requests
        self._windows: dict[str, tuple[int, float]] = {}  # key → (count, reset_at)

    def check(self, key: str) -> RateLimitResult:
        now = time.time() * 1000
        entry = self._windows.get(key)
        if not entry or now >= entry[1]:
            self._windows[key] = (1, now + self.window_ms)
            return RateLimitResult(allowed=True, remaining=self.max_requests - 1, reset_ms=self.window_ms)
        count, reset_at = entry
        if count >= self.max_requests:
            return RateLimitResult(allowed=False, remaining=0, reset_ms=reset_at - now, retry_after_ms=reset_at - now)
        self._windows[key] = (count + 1, reset_at)
        return RateLimitResult(allowed=True, remaining=self.max_requests - count - 1, reset_ms=reset_at - now)

    def reset(self, key: str): self._windows.pop(key, None)


class SecurityShield:
    """All-in-one security: rate limit → scan input → filter output."""

    def __init__(self, max_input_length: int = 50000, window_ms: float = 60000, max_requests: int = 60):
        self.input_scanner = InputScanner(max_input_length)
        self.output_filter = OutputFilter()
        self.rate_limiter = RateLimiter(window_ms, max_requests)

    async def protect(
        self, key: str, input_text: str,
        executor: Callable[[str], str],
    ) -> dict:
        """Full protection pipeline."""
        rate_result = self.rate_limiter.check(key)
        if not rate_result.allowed:
            return {"output": "", "blocked": True, "reason": f"Rate limited. Retry in {rate_result.retry_after_ms:.0f}ms", "threats": []}

        scan = self.input_scanner.scan(input_text)
        if any(t.severity == "critical" for t in scan.threats):
            return {"output": "", "blocked": True, "reason": "Critical threat detected", "threats": scan.threats}

        raw_output = executor(scan.sanitized)
        filtered, _ = self.output_filter.filter(raw_output)
        return {"output": filtered, "blocked": False, "threats": scan.threats}


# ─── Factory ──────────────────────────────────────────────────────────────────

def create_input_scanner(max_length: int = 50000) -> InputScanner: return InputScanner(max_length)
def create_output_filter() -> OutputFilter: return OutputFilter()
def create_rate_limiter(window_ms: float = 60000, max_requests: int = 60) -> RateLimiter: return RateLimiter(window_ms, max_requests)
def create_security_shield(**kwargs) -> SecurityShield: return SecurityShield(**kwargs)
