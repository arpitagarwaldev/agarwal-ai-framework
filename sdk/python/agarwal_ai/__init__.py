"""
AGARWAL AI Framework — Python SDK
A complete AI delivery & intelligence toolkit.

Modules:
    core        — Framework configuration, utilities, retry logic
    agents      — Multi-agent orchestration, circuit breakers
    governance  — Trust Mesh, policy engine, audit trails
    metrics     — AQI scoring, AADV-Next velocity
    security    — Input scanning, output filtering, rate limiting
    knowledge   — RAG pipeline, chunking, vector search
    engine      — Universal LLM engine, multi-provider
    router      — Intelligent LLM routing, A/B testing
"""

__version__ = "1.0.0"

from agarwal_ai.core import Agarwal, AgarwalConfig, create_agarwal
from agarwal_ai.agents import Agent, Orchestrator, create_agent, create_orchestrator
from agarwal_ai.governance import TrustMesh, create_trust_mesh
from agarwal_ai.metrics import AQICalculator, AADVCalculator, create_aqi, create_aadv
from agarwal_ai.security import SecurityShield, create_security_shield
from agarwal_ai.knowledge import RAGPipeline, create_rag
from agarwal_ai.engine import AIEngine, create_engine
from agarwal_ai.router import LLMRouter, create_router

__all__ = [
    "Agarwal", "AgarwalConfig", "create_agarwal",
    "Agent", "Orchestrator", "create_agent", "create_orchestrator",
    "TrustMesh", "create_trust_mesh",
    "AQICalculator", "AADVCalculator", "create_aqi", "create_aadv",
    "SecurityShield", "create_security_shield",
    "RAGPipeline", "create_rag",
    "AIEngine", "create_engine",
    "LLMRouter", "create_router",
]
