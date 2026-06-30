"use client";

import { motion } from "framer-motion";
import {
  Bot,
  ShieldCheck,
  BrainCircuit,
  Atom,
  Workflow,
  BarChart3,
  RefreshCcw,
} from "lucide-react";

const pillars = [
  {
    letter: "A",
    title: "Agent-First Architecture",
    description:
      "Autonomous multi-agent orchestration via MCP & A2A protocols. Agents plan, execute, evaluate — humans steer.",
    icon: Bot,
    color: "from-emerald-500 to-emerald-400",
    bgGlow: "bg-emerald-500/10",
    borderColor: "hover:border-emerald-500/40",
    features: ["MCP Integration", "A2A Protocol", "Swarm Patterns", "Agent Memory"],
  },
  {
    letter: "G",
    title: "Governance & Trust Mesh",
    description:
      "Distributed, real-time governance. Policy-as-code, explainability standards, and automated compliance gates.",
    icon: ShieldCheck,
    color: "from-amber-500 to-yellow-400",
    bgGlow: "bg-amber-500/10",
    borderColor: "hover:border-amber-500/40",
    features: ["Trust Mesh", "XAI Standards", "Kill Switch", "Bias Detection"],
  },
  {
    letter: "A",
    title: "Algorithm Intelligence",
    description:
      "Self-designing systems via NAS, evolutionary optimization, and meta-learning. Architectures that discover themselves.",
    icon: BrainCircuit,
    color: "from-pink-500 to-rose-400",
    bgGlow: "bg-pink-500/10",
    borderColor: "hover:border-pink-500/40",
    features: ["Neural Architecture Search", "Meta-Learning", "Evolutionary Opt.", "RL Scaling"],
  },
  {
    letter: "R",
    title: "Resilient Quantum-Classical Hybrid",
    description:
      "Classical today, quantum tomorrow. Abstraction layers, QML algorithms, and post-quantum cryptography readiness.",
    icon: Atom,
    color: "from-purple-500 to-violet-400",
    bgGlow: "bg-purple-500/10",
    borderColor: "hover:border-purple-500/40",
    features: ["QML Algorithms", "VQC/QAOA", "PQC Migration", "Crypto-Agility"],
  },
  {
    letter: "W",
    title: "Workflow Autonomy Engine",
    description:
      "Self-orchestrating delivery pipelines. Dynamic stage composition based on risk. Human gates where they matter.",
    icon: Workflow,
    color: "from-blue-500 to-sky-400",
    bgGlow: "bg-blue-500/10",
    borderColor: "hover:border-blue-500/40",
    features: ["Agentic SDLC", "Dynamic Pipelines", "Intent Triggers", "Speculative Exec."],
  },
  {
    letter: "A",
    title: "Adaptive Statistics & Evaluation",
    description:
      "Bayesian estimation, causal inference, and information-theoretic metrics. Uncertainty quantified, not hidden.",
    icon: BarChart3,
    color: "from-teal-500 to-cyan-400",
    bgGlow: "bg-teal-500/10",
    borderColor: "hover:border-teal-500/40",
    features: ["AADV-Next™", "Bayesian Estimation", "Causal Inference", "AQI Scoring"],
  },
  {
    letter: "L",
    title: "Lifecycle Continuum",
    description:
      "No beginning, no end. Continuous discovery → build → verify → deploy → observe → evolve. Knowledge compounds.",
    icon: RefreshCcw,
    color: "from-orange-500 to-amber-400",
    bgGlow: "bg-orange-500/10",
    borderColor: "hover:border-orange-500/40",
    features: ["Infinite Loop", "Federated Learning", "Knowledge Graph", "Self-Healing"],
  },
];

export function Pillars() {
  return (
    <section id="pillars" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-4 block">
            The Seven Layers
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Framework Pillars
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Each layer amplifies the next — precision compounding at every stage.
            Together they form a self-reinforcing intelligence loop.
          </p>
        </motion.div>

        {/* Pillars Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
          {pillars.map((pillar, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`relative group rounded-2xl p-6 glass ${pillar.borderColor} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
            >
              {/* Glow effect */}
              <div
                className={`absolute inset-0 rounded-2xl ${pillar.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity blur-xl`}
              />

              <div className="relative z-10">
                {/* Icon + Letter */}
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pillar.color} flex items-center justify-center shadow-lg`}
                  >
                    <pillar.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-black text-white/20">
                    {pillar.letter}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-2">{pillar.title}</h3>

                {/* Description */}
                <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                  {pillar.description}
                </p>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-2">
                  {pillar.features.map((f, j) => (
                    <span
                      key={j}
                      className="text-xs px-2.5 py-1 rounded-md bg-white/5 text-slate-400 border border-white/5"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Center card for the 7th pillar (lifecycle spans full width on lg) */}
      </div>
    </section>
  );
}
