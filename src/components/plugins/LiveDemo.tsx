"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";

interface DemoOutput {
  lines: Array<{ text: string; type: "info" | "success" | "warn" | "error" | "data" }>;
}

const demos: Array<{
  id: string;
  title: string;
  description: string;
  run: () => DemoOutput;
}> = [
  {
    id: "aqi",
    title: "AQI Scoring",
    description: "Calculate Agent Quality Index from sample events",
    run: () => {
      const events = [
        { completed: true, human: false, complexity: "moderate", time: 3200, cost: 0.028, quality: 92, error: false },
        { completed: true, human: false, complexity: "complex", time: 8500, cost: 0.075, quality: 85, error: false },
        { completed: true, human: true, complexity: "critical", time: 12000, cost: 0.12, quality: 78, error: false },
        { completed: false, human: false, complexity: "simple", time: 1500, cost: 0.01, quality: 0, error: true },
        { completed: true, human: false, complexity: "moderate", time: 4100, cost: 0.032, quality: 90, error: false },
        { completed: true, human: false, complexity: "simple", time: 1800, cost: 0.012, quality: 95, error: false },
      ];

      // Simulate AQI calculation
      const autonomous = events.filter(e => e.completed && !e.human).length;
      const autonomyScore = (autonomous / events.length) * 100;
      const errors = events.filter(e => e.error).length;
      const reliabilityScore = ((events.length - errors) / events.length) * 100;
      const qualityScores = events.filter(e => e.quality > 0).map(e => e.quality);
      const alignmentScore = qualityScores.reduce((s, q) => s + q, 0) / qualityScores.length;
      const avgCost = events.reduce((s, e) => s + e.cost, 0) / events.length;
      const efficiencyScore = Math.max(0, 100 - avgCost * 800);
      const adaptabilityScore = 72;

      const overall = autonomyScore * 0.20 + reliabilityScore * 0.25 + alignmentScore * 0.25 + efficiencyScore * 0.15 + adaptabilityScore * 0.15;

      return {
        lines: [
          { text: `📊 AQI Calculation (6 recorded events)`, type: "info" },
          { text: ``, type: "info" },
          { text: `   Autonomy:      ${autonomyScore.toFixed(0)}/100  (${autonomous}/${events.length} tasks autonomous)`, type: "data" },
          { text: `   Reliability:   ${reliabilityScore.toFixed(0)}/100  (${errors} failures)`, type: "data" },
          { text: `   Alignment:     ${alignmentScore.toFixed(0)}/100  (avg quality score)`, type: "data" },
          { text: `   Efficiency:    ${efficiencyScore.toFixed(0)}/100  (avg cost: $${avgCost.toFixed(3)})`, type: "data" },
          { text: `   Adaptability:  ${adaptabilityScore}/100  (cross-complexity)`, type: "data" },
          { text: ``, type: "info" },
          { text: `   ═══════════════════════════════════`, type: "info" },
          { text: `   Overall AQI:   ${overall.toFixed(1)}/100`, type: "success" },
          { text: `   Rating:        ${overall >= 75 ? "Good" : "Acceptable"}`, type: "success" },
          { text: `   Action:        ${overall >= 75 ? "Production-ready" : "Increase oversight"}`, type: "success" },
        ],
      };
    },
  },
  {
    id: "governance",
    title: "Trust Mesh Validation",
    description: "Run governance policies against an agent action",
    run: () => {
      const policies = [
        { name: "no-pii-in-output", severity: "critical", passed: true },
        { name: "no-destructive-ops", severity: "high", passed: true },
        { name: "cost-threshold ($2.00)", severity: "medium", passed: true },
        { name: "no-direct-db-writes", severity: "high", passed: false },
      ];

      const explainability = 88;
      const compliance = 94;
      const safety = 96;
      const auditability = 82;
      const tms = explainability * 0.25 + compliance * 0.30 + safety * 0.25 + auditability * 0.20;

      return {
        lines: [
          { text: `🛡️ Trust Mesh Evaluation`, type: "info" },
          { text: `   Action: agent "code-gen" → write_file("src/db.ts")`, type: "info" },
          { text: ``, type: "info" },
          { text: `   Policy Results:`, type: "info" },
          ...policies.map(p => ({
            text: `   ${p.passed ? "✅" : "❌"} ${p.name} [${p.severity}] ${p.passed ? "PASS" : "BLOCKED"}`,
            type: (p.passed ? "success" : "error") as "success" | "error",
          })),
          { text: ``, type: "info" },
          { text: `   ⚠️  Action BLOCKED: "Direct SQL writes blocked — use the ORM"`, type: "warn" },
          { text: ``, type: "info" },
          { text: `   Trust Mesh Score:`, type: "info" },
          { text: `     Explainability:  ${explainability}/100`, type: "data" },
          { text: `     Compliance:      ${compliance}/100`, type: "data" },
          { text: `     Safety:          ${safety}/100`, type: "data" },
          { text: `     Auditability:    ${auditability}/100`, type: "data" },
          { text: `     ─────────────────────────`, type: "info" },
          { text: `     Overall TMS:     ${tms.toFixed(1)}/100 ✓`, type: "success" },
        ],
      };
    },
  },
  {
    id: "pipeline",
    title: "Workflow Pipeline",
    description: "Execute a feature delivery pipeline with decision gates",
    run: () => {
      return {
        lines: [
          { text: `🔄 Pipeline: "feature-delivery" [trigger: intent]`, type: "info" },
          { text: `   Risk Score: 25/100 (low)`, type: "info" },
          { text: ``, type: "info" },
          { text: `   ┌─ Stage: design`, type: "info" },
          { text: `   │  Agent: architect-agent → completed (1.2s)`, type: "success" },
          { text: `   │  Gate: human → approved by "tech-lead"`, type: "success" },
          { text: `   │`, type: "info" },
          { text: `   ├─ Stage: build (parallel)`, type: "info" },
          { text: `   │  Agent: code-gen → completed (4.5s)`, type: "success" },
          { text: `   │  Agent: test-gen → completed (3.8s)`, type: "success" },
          { text: `   │`, type: "info" },
          { text: `   ├─ Stage: review`, type: "info" },
          { text: `   │  Agent: code-reviewer → completed (2.1s)`, type: "success" },
          { text: `   │  Gate: auto → approved (all checks pass)`, type: "success" },
          { text: `   │`, type: "info" },
          { text: `   └─ Stage: deploy`, type: "info" },
          { text: `      Agent: deploy-agent → completed (8.3s)`, type: "success" },
          { text: `      Gate: risk-based → auto-approved (risk < 50)`, type: "success" },
          { text: ``, type: "info" },
          { text: `   ═══════════════════════════════════════════`, type: "info" },
          { text: `   Pipeline: COMPLETED in 19.9s`, type: "success" },
          { text: `   Stages: 4/4 passed | Gates: 3/3 approved`, type: "success" },
          { text: `   Human interventions: 1 (design gate)`, type: "data" },
        ],
      };
    },
  },
  {
    id: "quantum",
    title: "Quantum Readiness",
    description: "Assess quantum readiness and crypto migration status",
    run: () => {
      const qri = {
        literacy: 55,
        algorithmSuitability: 42,
        cryptoAgility: 65,
        infrastructure: 30,
        vendorEvaluation: 40,
        experimentalPipeline: 25,
      };
      const overall = qri.literacy * 0.15 + qri.algorithmSuitability * 0.25 + qri.cryptoAgility * 0.20 + qri.infrastructure * 0.20 + qri.vendorEvaluation * 0.10 + qri.experimentalPipeline * 0.10;

      return {
        lines: [
          { text: `⚛️  Quantum Readiness Index (QRI)`, type: "info" },
          { text: ``, type: "info" },
          { text: `   Literacy:            ${qri.literacy}/100  (team has Qiskit cert)`, type: "data" },
          { text: `   Algorithm Suitability: ${qri.algorithmSuitability}/100  (3 workloads identified)`, type: "data" },
          { text: `   Crypto-Agility:      ${qri.cryptoAgility}/100  (PQC migration 60%)`, type: "data" },
          { text: `   Infrastructure:      ${qri.infrastructure}/100  (abstraction layer WIP)`, type: "warn" },
          { text: `   Vendor Evaluation:   ${qri.vendorEvaluation}/100  (IBM, IonQ tested)`, type: "data" },
          { text: `   Experiments:         ${qri.experimentalPipeline}/100  (2 POCs running)`, type: "data" },
          { text: ``, type: "info" },
          { text: `   Overall QRI: ${overall.toFixed(1)}/100`, type: "success" },
          { text: `   Level: PREPARED (41-60 range)`, type: "success" },
          { text: ``, type: "info" },
          { text: `   📋 Crypto Inventory:`, type: "info" },
          { text: `      RSA-2048 (API Auth) → ML-KEM-768 [in-progress]`, type: "warn" },
          { text: `      ECDSA (Signing) → ML-DSA-65 [planned]`, type: "warn" },
          { text: `      AES-256 (Storage) → safe [no action]`, type: "success" },
          { text: `      Urgent migrations: 2 (>10yr confidentiality)`, type: "error" },
        ],
      };
    },
  },
];

export function LiveDemo() {
  const [activeDemo, setActiveDemo] = useState(demos[0].id);
  const [output, setOutput] = useState<DemoOutput | null>(null);
  const [running, setRunning] = useState(false);

  const runDemo = () => {
    setRunning(true);
    setOutput(null);
    const demo = demos.find(d => d.id === activeDemo);
    // Simulate processing time
    setTimeout(() => {
      if (demo) setOutput(demo.run());
      setRunning(false);
    }, 600);
  };

  const reset = () => {
    setOutput(null);
  };

  return (
    <section id="demo" className="relative py-24 px-6">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-accent mb-4 block">Interactive</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Live Demo</h2>
          <p className="text-slate-400 max-w-xl mx-auto">See the plugins in action. Select a demo and hit Run.</p>
        </motion.div>

        {/* Demo Selector */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {demos.map(demo => (
            <button
              key={demo.id}
              onClick={() => { setActiveDemo(demo.id); setOutput(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeDemo === demo.id
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-white/5 text-slate-400 border border-white/5 hover:text-white"
              }`}
            >
              {demo.title}
            </button>
          ))}
        </div>

        {/* Demo Area */}
        <div className="glass rounded-2xl overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-black/20">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {demos.find(d => d.id === activeDemo)?.description}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={reset}
                className="p-1.5 rounded-md hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
                aria-label="Reset"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={runDemo}
                disabled={running}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
              >
                <Play className="w-3 h-3" />
                {running ? "Running..." : "Run"}
              </button>
            </div>
          </div>

          {/* Output */}
          <div className="p-5 min-h-[320px] font-mono text-[13px] leading-relaxed">
            {!output && !running && (
              <div className="text-slate-600 text-center py-16">
                Click &quot;Run&quot; to execute the demo
              </div>
            )}
            {running && (
              <div className="text-slate-500 flex items-center gap-2">
                <span className="animate-pulse">●</span> Executing...
              </div>
            )}
            {output && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-0.5"
              >
                {output.lines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={
                      line.type === "success" ? "text-emerald-400" :
                      line.type === "error" ? "text-red-400" :
                      line.type === "warn" ? "text-amber-400" :
                      line.type === "data" ? "text-cyan-300" :
                      "text-slate-400"
                    }
                  >
                    {line.text || "\u00A0"}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
