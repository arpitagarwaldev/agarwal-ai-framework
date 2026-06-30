"use client";

import { motion } from "framer-motion";
import { TrendingUp, Activity, Gauge, Shield } from "lucide-react";

const metrics = [
  {
    name: "AQI",
    fullName: "Agent Quality Index",
    value: "82",
    target: "≥75",
    trend: "+3",
    description:
      "Composite score measuring agent autonomy, reliability, alignment, efficiency, and adaptability.",
    icon: Activity,
    color: "from-emerald-500 to-teal-400",
    barColor: "bg-emerald-500",
    barWidth: "82%",
    components: [
      { name: "Autonomy", value: 78 },
      { name: "Reliability", value: 91 },
      { name: "Alignment", value: 84 },
      { name: "Efficiency", value: 68 },
      { name: "Adaptability", value: 79 },
    ],
  },
  {
    name: "QRI",
    fullName: "Quantum Readiness Index",
    value: "45",
    target: "≥40",
    trend: "+8",
    description:
      "Organization's preparedness for quantum-classical hybrid workloads across 6 dimensions.",
    icon: Gauge,
    color: "from-purple-500 to-violet-400",
    barColor: "bg-purple-500",
    barWidth: "45%",
    components: [
      { name: "Literacy", value: 55 },
      { name: "Algorithm Fit", value: 40 },
      { name: "Crypto-Agility", value: 60 },
      { name: "Infrastructure", value: 35 },
      { name: "Vendor Eval", value: 45 },
    ],
  },
  {
    name: "AADV-Next™",
    fullName: "AI-Adjusted Delivery Velocity",
    value: "1.4x",
    target: "≥1.2x",
    trend: "+0.2",
    description:
      "Bayesian delivery velocity metric accounting for AI agent contributions, quality, and rework.",
    icon: TrendingUp,
    color: "from-blue-500 to-cyan-400",
    barColor: "bg-blue-500",
    barWidth: "70%",
    components: [
      { name: "Base Velocity", value: 42 },
      { name: "AI Amplification", value: 85 },
      { name: "Quality Weight", value: 88 },
      { name: "Rework Penalty", value: 12 },
      { name: "Confidence", value: 90 },
    ],
  },
  {
    name: "TMS",
    fullName: "Trust Mesh Score",
    value: "88",
    target: "≥80",
    trend: "+2",
    description:
      "Governance health across AI system boundaries — explainability, compliance, safety, auditability.",
    icon: Shield,
    color: "from-amber-500 to-yellow-400",
    barColor: "bg-amber-500",
    barWidth: "88%",
    components: [
      { name: "Explainability", value: 85 },
      { name: "Compliance", value: 92 },
      { name: "Safety", value: 90 },
      { name: "Auditability", value: 84 },
    ],
  },
];

export function Metrics() {
  return (
    <section id="metrics" className="relative py-32 px-6">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-stats mb-4 block">
            Measurement
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Core Metrics
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Four proprietary metrics that measure what actually matters —
            with uncertainty quantified, not hidden.
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {metrics.map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl p-6 hover:border-white/10 transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center`}
                  >
                    <metric.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{metric.name}</h3>
                    <p className="text-xs text-slate-500">{metric.fullName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{metric.value}</div>
                  <div className="text-xs text-emerald-400 font-medium">
                    ↑ {metric.trend}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-400 mb-4">{metric.description}</p>

              {/* Overall Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Current</span>
                  <span>Target: {metric.target}</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: metric.barWidth }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                    className={`h-full rounded-full ${metric.barColor}`}
                  />
                </div>
              </div>

              {/* Component Breakdown */}
              <div className="space-y-2">
                {metric.components.map((comp, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-28 shrink-0">
                      {comp.name}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${comp.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.5 + j * 0.05 }}
                        className={`h-full rounded-full ${metric.barColor} opacity-60`}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-8 text-right">
                      {comp.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
