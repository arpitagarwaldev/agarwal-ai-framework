"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const levels = [
  {
    level: 1,
    name: "Manual",
    tagline: "Human-driven, no automation",
    color: "bg-slate-600",
    glowColor: "shadow-slate-600/20",
    active: false,
  },
  {
    level: 2,
    name: "Automated",
    tagline: "CI/CD + basic AI tools",
    color: "bg-blue-600",
    glowColor: "shadow-blue-600/20",
    active: false,
  },
  {
    level: 3,
    name: "Augmented",
    tagline: "AI assists at multiple stages",
    color: "bg-cyan-500",
    glowColor: "shadow-cyan-500/20",
    active: true,
  },
  {
    level: 4,
    name: "Orchestrated",
    tagline: "Multi-agent coordination",
    color: "bg-purple-500",
    glowColor: "shadow-purple-500/20",
    active: false,
  },
  {
    level: 5,
    name: "Autonomous",
    tagline: "Self-orchestrating delivery",
    color: "bg-emerald-500",
    glowColor: "shadow-emerald-500/20",
    active: false,
  },
  {
    level: 6,
    name: "Self-Evolving",
    tagline: "System improves itself",
    color: "bg-amber-500",
    glowColor: "shadow-amber-500/20",
    active: false,
  },
];

const comparisonData = [
  {
    dimension: "Agent Usage",
    traditional: "Single copilot",
    agarwal: "Multi-agent orchestration via MCP",
  },
  {
    dimension: "Governance",
    traditional: "Manual review boards",
    agarwal: "Real-time Trust Mesh automation",
  },
  {
    dimension: "Architecture",
    traditional: "Human-designed models",
    agarwal: "NAS + evolutionary self-design",
  },
  {
    dimension: "Compute",
    traditional: "Classical only",
    agarwal: "Quantum-classical hybrid ready",
  },
  {
    dimension: "Metrics",
    traditional: "Point estimates (story points)",
    agarwal: "Bayesian distributions + causal inference",
  },
  {
    dimension: "Lifecycle",
    traditional: "Linear project (start → end)",
    agarwal: "Continuous self-evolving loop",
  },
];

export function MaturityModel() {
  return (
    <section id="maturity" className="relative py-32 px-6">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-quantum/30 to-transparent" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-quantum mb-4 block">
            Assessment
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Maturity Model
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Six levels from manual delivery to self-evolving systems.
            Where does your organization stand?
          </p>
        </motion.div>

        {/* Maturity Levels - Horizontal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-2xl p-8 mb-16 overflow-x-auto"
        >
          <div className="flex items-end gap-4 min-w-[700px]">
            {levels.map((level, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                {/* Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  whileInView={{ height: `${(level.level / 6) * 200 + 40}px` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className={`w-full max-w-[60px] rounded-t-lg ${level.color} ${
                    level.active ? `shadow-lg ${level.glowColor} ring-2 ring-white/20` : "opacity-60"
                  } relative flex items-start justify-center pt-3`}
                >
                  <span className="text-white font-bold text-lg">{level.level}</span>
                  {level.active && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-white text-slate-900 rounded-full">
                        YOU
                      </span>
                    </div>
                  )}
                </motion.div>
                {/* Label */}
                <div className="mt-3 text-center">
                  <div className="text-xs font-semibold text-white">{level.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{level.tagline}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Traditional vs AGARWAL
          </h3>
          <div className="glass rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 gap-px bg-white/5">
              {/* Header */}
              <div className="bg-surface-card p-4">
                <span className="text-sm font-semibold text-slate-400">Dimension</span>
              </div>
              <div className="bg-surface-card p-4">
                <span className="text-sm font-semibold text-red-400/80">
                  Traditional
                </span>
              </div>
              <div className="bg-surface-card p-4">
                <span className="text-sm font-semibold text-emerald-400">
                  AGARWAL Framework
                </span>
              </div>

              {/* Rows */}
              {comparisonData.map((row, i) => (
                <>
                  <div
                    key={`dim-${i}`}
                    className="bg-surface-card/50 p-4 flex items-center"
                  >
                    <span className="text-sm text-slate-300 font-medium">
                      {row.dimension}
                    </span>
                  </div>
                  <div
                    key={`trad-${i}`}
                    className="bg-surface-card/50 p-4 flex items-center"
                  >
                    <span className="text-sm text-slate-500">{row.traditional}</span>
                  </div>
                  <div
                    key={`ag-${i}`}
                    className="bg-surface-card/50 p-4 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-sm text-slate-300">{row.agarwal}</span>
                  </div>
                </>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
