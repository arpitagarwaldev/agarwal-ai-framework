"use client";

import { motion } from "framer-motion";
import { Package, ArrowDown } from "lucide-react";

export function PluginHero() {
  return (
    <section className="relative pt-32 pb-20 px-6">
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/15 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-[128px]" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
        >
          <Package className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-slate-300 tracking-wide uppercase">
            Modular Plugins · Install What You Need
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl md:text-6xl font-black tracking-tight mb-6"
        >
          <span className="gradient-text">AGARWAL</span>{" "}
          <span className="text-white">Plugins</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Six independently installable packages. Pick the layers you need —
          agents, governance, metrics, workflow, quantum, or the full stack.
          Plug into any TypeScript/JavaScript project.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <a href="#install" className="group px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
            Quick Start <ArrowDown className="inline-block ml-2 w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </a>
          <a href="#demo" className="px-6 py-3 rounded-xl gradient-border text-slate-300 font-medium hover:text-white transition-colors">
            Live Demo
          </a>
          <a href="#api" className="px-6 py-3 rounded-xl gradient-border text-slate-300 font-medium hover:text-white transition-colors">
            API Reference
          </a>
        </motion.div>
      </div>
    </section>
  );
}
