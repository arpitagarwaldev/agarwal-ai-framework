"use client";

import { motion } from "framer-motion";
import { Bot, ShieldCheck, BarChart3, Workflow, Atom, Cpu } from "lucide-react";

const packages = [
  {
    name: "@agarwal-ai/core",
    icon: Cpu,
    color: "from-indigo-500 to-blue-500",
    description: "Framework initialization, configuration, retry utilities, ID generation, deep merge.",
    install: "npm i @agarwal-ai/core",
    size: "~4KB",
    deps: "0",
  },
  {
    name: "@agarwal-ai/agents",
    icon: Bot,
    color: "from-emerald-500 to-teal-500",
    description: "Multi-agent orchestration, circuit breakers, MCP tool types, agent memory patterns.",
    install: "npm i @agarwal-ai/agents",
    size: "~8KB",
    deps: "core",
  },
  {
    name: "@agarwal-ai/governance",
    icon: ShieldCheck,
    color: "from-amber-500 to-yellow-500",
    description: "Trust Mesh engine, policy-as-code, audit trails, bias detection, TMS scoring.",
    install: "npm i @agarwal-ai/governance",
    size: "~6KB",
    deps: "core",
  },
  {
    name: "@agarwal-ai/metrics",
    icon: BarChart3,
    color: "from-teal-500 to-cyan-500",
    description: "AQI calculator, AADV-Next velocity metric, sprint analytics, Bayesian confidence.",
    install: "npm i @agarwal-ai/metrics",
    size: "~7KB",
    deps: "core",
  },
  {
    name: "@agarwal-ai/workflow",
    icon: Workflow,
    color: "from-blue-500 to-sky-500",
    description: "Pipeline orchestration, dynamic stages, decision gates, parallel execution.",
    install: "npm i @agarwal-ai/workflow",
    size: "~6KB",
    deps: "core, agents",
  },
  {
    name: "@agarwal-ai/quantum",
    icon: Atom,
    color: "from-purple-500 to-violet-500",
    description: "QRI scoring, crypto inventory, PQC migration tracking, workload feasibility assessment.",
    install: "npm i @agarwal-ai/quantum",
    size: "~5KB",
    deps: "core",
  },
];

export function PackageGrid() {
  return (
    <section className="relative py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Available Packages</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Each package maps to a framework layer. Use one or all — they work together seamlessly.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((pkg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-5 hover:border-white/15 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${pkg.color} flex items-center justify-center`}>
                  <pkg.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">{pkg.name}</h3>
                  <div className="flex gap-3 text-[10px] text-slate-500">
                    <span>{pkg.size}</span>
                    <span>deps: {pkg.deps}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">{pkg.description}</p>
              <div className="bg-black/30 rounded-lg px-3 py-2 font-mono text-xs text-slate-300 border border-white/5">
                <span className="text-slate-500">$ </span>{pkg.install}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
