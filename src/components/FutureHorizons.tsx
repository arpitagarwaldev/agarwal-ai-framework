"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const horizons = [
  {
    year: "2026",
    label: "NOW",
    items: [
      { name: "Agentic AI", category: "Agents", color: "bg-emerald-500" },
      { name: "MCP / A2A Protocols", category: "Protocols", color: "bg-blue-500" },
      { name: "Post-Quantum Crypto", category: "Security", color: "bg-red-500" },
      { name: "Mixture of Experts", category: "Architecture", color: "bg-pink-500" },
      { name: "State Space Models", category: "Architecture", color: "bg-pink-500" },
      { name: "Federated Learning", category: "Privacy", color: "bg-teal-500" },
      { name: "LLM-Guided NAS", category: "Algorithm", color: "bg-purple-500" },
      { name: "RLHF/DPO Alignment", category: "Alignment", color: "bg-amber-500" },
    ],
  },
  {
    year: "2027",
    label: "NEXT",
    items: [
      { name: "Persistent Agents", category: "Agents", color: "bg-emerald-500" },
      { name: "World Models", category: "Architecture", color: "bg-pink-500" },
      { name: "Neuro-Symbolic AI", category: "Reasoning", color: "bg-orange-500" },
      { name: "Liquid Neural Nets", category: "Architecture", color: "bg-pink-500" },
      { name: "Cognitive Architecture", category: "Systems", color: "bg-cyan-500" },
      { name: "Digital Twin Intelligence", category: "Simulation", color: "bg-violet-500" },
      { name: "Swarm Intelligence", category: "Agents", color: "bg-emerald-500" },
      { name: "Causal Representation", category: "Learning", color: "bg-yellow-500" },
    ],
  },
  {
    year: "2028-29",
    label: "HORIZON",
    items: [
      { name: "Quantum ML Advantage", category: "Quantum", color: "bg-purple-500" },
      { name: "Recursive Self-Improvement", category: "AGI", color: "bg-red-500" },
      { name: "Intent Computing", category: "Paradigm", color: "bg-indigo-500" },
      { name: "Verifiable AI", category: "Safety", color: "bg-amber-500" },
      { name: "Program Synthesis", category: "Code", color: "bg-blue-500" },
      { name: "Neuromorphic Computing", category: "Hardware", color: "bg-slate-400" },
      { name: "Embodied AI", category: "Robotics", color: "bg-orange-500" },
      { name: "Synthetic Biology + AI", category: "Bio", color: "bg-green-500" },
    ],
  },
  {
    year: "2030+",
    label: "FRONTIER",
    items: [
      { name: "Quantum Internet", category: "Quantum", color: "bg-purple-500" },
      { name: "Fault-Tolerant QC", category: "Quantum", color: "bg-purple-500" },
      { name: "Autonomous Evolution", category: "AGI", color: "bg-red-500" },
      { name: "Topological Quantum", category: "Hardware", color: "bg-violet-500" },
      { name: "Quantum-Native AI", category: "Paradigm", color: "bg-indigo-500" },
      { name: "Sovereign AI Nations", category: "Geopolitics", color: "bg-slate-400" },
    ],
  },
];

export function FutureHorizons() {
  return (
    <section id="future" className="relative py-32 px-6">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lifecycle/30 to-transparent" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-lifecycle mb-4 block">
            Research & Futures
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Future Horizons
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Technologies and paradigms that will reshape AI delivery.
            The AGARWAL Framework is designed to absorb them.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-quantum to-lifecycle opacity-30" />

          {horizons.map((horizon, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={`relative mb-16 md:w-1/2 ${
                i % 2 === 0 ? "md:pr-12 md:ml-0" : "md:pl-12 md:ml-auto"
              } pl-16 md:pl-0`}
            >
              {/* Timeline dot */}
              <div
                className={`absolute left-6 md:left-auto ${
                  i % 2 === 0 ? "md:-right-3" : "md:-left-3"
                } top-6 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent border-4 border-surface`}
              />

              {/* Card */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold text-white">{horizon.year}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                    {horizon.label}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {horizon.items.map((item, j) => (
                    <div
                      key={j}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/15 transition-colors group"
                    >
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-xs text-slate-300 group-hover:text-white transition-colors">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-600">{item.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
