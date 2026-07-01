"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface APIItem {
  name: string;
  signature: string;
  description: string;
  returns: string;
  example: string;
}

interface PackageAPI {
  package: string;
  color: string;
  items: APIItem[];
}

const apiData: PackageAPI[] = [
  {
    package: "@agarwal-ai/core",
    color: "text-indigo-400",
    items: [
      { name: "createAgarwal", signature: "(config?: Partial<AgarwalConfig>) => Agarwal", description: "Initialize the AGARWAL framework with optional config", returns: "Agarwal instance", example: "const fw = createAgarwal({ name: 'app' })" },
      { name: "withRetry", signature: "(fn, options?) => Promise<T>", description: "Retry async function with exponential backoff", returns: "Promise resolving to fn result", example: "await withRetry(() => fetch(url), { maxRetries: 3 })" },
      { name: "generateId", signature: "(prefix?: string) => string", description: "Generate unique timestamped ID", returns: "String like 'ag_lx1abc_def456'", example: "const id = generateId('task')" },
      { name: "deepMerge", signature: "(target, ...sources) => T", description: "Deep merge objects recursively", returns: "Merged object", example: "deepMerge(defaults, userConfig)" },
    ],
  },
  {
    package: "@agarwal-ai/agents",
    color: "text-emerald-400",
    items: [
      { name: "createAgent", signature: "(config: AgentConfig) => Agent", description: "Create a fully configured agent", returns: "Agent instance with execute(), pause(), terminate()", example: "const agent = createAgent({ name: 'coder', role: 'specialist', model: 'claude-opus-4.6' })" },
      { name: "createOrchestrator", signature: "(config: OrchestratorConfig) => Orchestrator", description: "Create multi-agent orchestrator", returns: "Orchestrator with dispatch(), fanOut()", example: "const orch = createOrchestrator({ name: 'team', strategy: 'capability', agents })" },
      { name: "createSpecialist", signature: "(name, specialization, model?) => Agent", description: "Quick-create a specialist agent", returns: "Pre-configured Agent", example: "const reviewer = createSpecialist('reviewer', 'code review')" },
      { name: "agent.execute", signature: "(input: string) => Promise<AgentResult>", description: "Execute a task on the agent", returns: "AgentResult with status, output, confidence", example: "const result = await agent.execute('Build auth API')" },
    ],
  },
  {
    package: "@agarwal-ai/governance",
    color: "text-amber-400",
    items: [
      { name: "createTrustMesh", signature: "(guardrails?: GuardrailConfig) => TrustMesh", description: "Create Trust Mesh with default policies (PII, destructive ops)", returns: "TrustMesh instance", example: "const mesh = createTrustMesh({ costCap: 5.0 })" },
      { name: "mesh.addPolicy", signature: "(policy: Omit<Policy, 'id'>) => string", description: "Register a governance policy", returns: "Policy ID", example: "mesh.addPolicy({ name: 'my-rule', severity: 'high', ... })" },
      { name: "mesh.isAllowed", signature: "(context: PolicyContext) => { allowed, violations }", description: "Check if an action passes all policies", returns: "{ allowed: boolean, violations: PolicyResult[] }", example: "const { allowed } = mesh.isAllowed({ agentId, action, input })" },
      { name: "mesh.calculateTMS", signature: "() => TrustMeshScores", description: "Calculate Trust Mesh Score (0-100)", returns: "Scores for explainability, compliance, safety, auditability, overall", example: "const tms = mesh.calculateTMS()" },
    ],
  },
  {
    package: "@agarwal-ai/metrics",
    color: "text-cyan-400",
    items: [
      { name: "createAQI", signature: "(weights?: Partial<AQIWeights>) => AQICalculator", description: "Create AQI calculator with custom weights", returns: "AQICalculator instance", example: "const aqi = createAQI({ reliability: 0.30 })" },
      { name: "aqi.record", signature: "(event: AgentMetricEvent) => void", description: "Record an agent performance event", returns: "void", example: "aqi.record({ agentId, taskCompleted: true, ... })" },
      { name: "aqi.calculate", signature: "(agentId?: string) => AQIScores", description: "Calculate AQI scores", returns: "{ autonomy, reliability, alignment, efficiency, adaptability, overall }", example: "const scores = aqi.calculate(agentId)" },
      { name: "createAADV", signature: "(calibrationFactor?: number) => AADVCalculator", description: "Create delivery velocity calculator", returns: "AADVCalculator with addSprint(), calculate()", example: "const aadv = createAADV(0.5)" },
    ],
  },
  {
    package: "@agarwal-ai/workflow",
    color: "text-blue-400",
    items: [
      { name: "createPipeline", signature: "(config: PipelineConfig) => Pipeline", description: "Create a workflow pipeline with stages and gates", returns: "Pipeline instance", example: "const pipe = createPipeline({ name: 'deploy', stages: [...] })" },
      { name: "pipeline.run", signature: "() => Promise<PipelineResult>", description: "Execute all stages sequentially with gate checks", returns: "PipelineResult with status, stages, duration", example: "const result = await pipeline.run()" },
      { name: "pipeline.onGate", signature: "(type, handler) => this", description: "Register custom decision gate handler", returns: "Pipeline (chainable)", example: "pipeline.onGate('risk-based', async (ctx, stage) => { ... })" },
      { name: "pipeline.setRiskScore", signature: "(score: number) => this", description: "Set pipeline risk score (0-100)", returns: "Pipeline (chainable)", example: "pipeline.setRiskScore(25)" },
    ],
  },
  {
    package: "@agarwal-ai/quantum",
    color: "text-purple-400",
    items: [
      { name: "createQRI", signature: "(weights?) => QRICalculator", description: "Create Quantum Readiness Index calculator", returns: "QRICalculator with setScore(), calculate(), getLevel()", example: "const qri = createQRI()" },
      { name: "createCryptoInventory", signature: "() => CryptoInventory", description: "Create crypto asset inventory for PQC migration", returns: "CryptoInventory with add(), getVulnerable(), getUrgent()", example: "const crypto = createCryptoInventory()" },
      { name: "assessQuantumWorkload", signature: "(name, type, inputSize, complexity) => Assessment", description: "Evaluate if a workload benefits from quantum", returns: "{ feasibilityScore, recommendation, quantumSpeedup }", example: "assessQuantumWorkload('optimize', 'optimization', 500, 'O(2^n)')" },
      { name: "qri.getLevel", signature: "() => QRILevel", description: "Get maturity level from QRI score", returns: "'unaware' | 'aware' | 'prepared' | 'hybrid' | 'quantum-native'", example: "qri.getLevel() // => 'prepared'" },
    ],
  },
];

function APISection({ pkg }: { pkg: PackageAPI }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors"
      >
        <span className={`font-mono font-bold text-sm ${pkg.color}`}>{pkg.package}</span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="border-t border-white/5 divide-y divide-white/5">
          {pkg.items.map((item, i) => (
            <div key={i} className="px-5 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 mb-1.5">
                <span className="font-mono text-sm font-semibold text-white">{item.name}</span>
                <span className="font-mono text-xs text-slate-500">{item.signature}</span>
              </div>
              <p className="text-xs text-slate-400 mb-2">{item.description}</p>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-slate-500">Returns: <span className="text-slate-400">{item.returns}</span></span>
                <code className="text-[11px] text-cyan-300/80 bg-black/30 rounded px-2 py-1 font-mono">{item.example}</code>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function APIReference() {
  return (
    <section id="api" className="relative py-24 px-6">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-4 block">Reference</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">API Reference</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Click a package to expand its API. Every function with signature, description, and usage example.</p>
        </motion.div>

        <div className="space-y-3">
          {apiData.map((pkg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <APISection pkg={pkg} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
