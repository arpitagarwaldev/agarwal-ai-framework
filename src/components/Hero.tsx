"use client";

import { motion } from "framer-motion";
import { ArrowDown, Zap, Shield, Brain, Atom } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] animate-pulse-slow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-quantum/10 rounded-full blur-[200px]" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-300 tracking-wide uppercase">
            Framework v1.0 · Future-Native AI Delivery
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6"
        >
          <span className="gradient-text">AGARWAL</span>
          <br />
          <span className="text-white/90 text-3xl md:text-4xl lg:text-5xl font-light tracking-wide">
            AI Framework
          </span>
        </motion.h1>

        {/* Acronym */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-x-1 gap-y-2 mb-8 text-sm md:text-base"
        >
          {[
            { letter: "A", word: "Agent-First", color: "text-agent" },
            { letter: "G", word: "Governance", color: "text-governance" },
            { letter: "A", word: "Algorithm", color: "text-algorithm" },
            { letter: "R", word: "Resilient", color: "text-quantum" },
            { letter: "W", word: "Workflow", color: "text-workflow" },
            { letter: "A", word: "Autonomous", color: "text-stats" },
            { letter: "L", word: "Lifecycle", color: "text-lifecycle" },
          ].map((item, i) => (
            <span key={i} className="flex items-center">
              <span className={`font-bold ${item.color}`}>{item.letter}</span>
              <span className="text-slate-400 font-light">{item.word}</span>
              {i < 6 && <span className="text-slate-600 mx-2">·</span>}
            </span>
          ))}
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          A seven-layer, future-native AI delivery & intelligence framework.
          Built for autonomous agents, quantum-classical hybrid computing,
          and self-evolving enterprise systems.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          <a
            href="#agarwal-graph"
            className="group px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-base hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
          >
            Explore the Framework
            <ArrowDown className="inline-block ml-2 w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </a>
          <a
            href="#metrics"
            className="px-8 py-4 rounded-xl gradient-border text-slate-300 font-medium text-base hover:text-white transition-colors"
          >
            View Metrics
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {[
            { icon: Brain, label: "Pillars", value: "7", color: "from-primary to-primary-light" },
            { icon: Zap, label: "Agent Patterns", value: "5+", color: "from-agent to-emerald-400" },
            { icon: Atom, label: "QML Algorithms", value: "12+", color: "from-quantum to-purple-400" },
            { icon: Shield, label: "Governance Nodes", value: "4", color: "from-governance to-amber-400" },
          ].map((stat, i) => (
            <div
              key={i}
              className="glass rounded-xl p-4 text-center hover:border-primary/30 transition-colors"
            >
              <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-slate-600 flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 rounded-full bg-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
}
