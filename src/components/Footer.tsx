"use client";

import { motion } from "framer-motion";
import { Cpu, GitBranch, Link, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative py-20 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-4 gap-12 mb-16"
        >
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">
                <span className="gradient-text">AGARWAL</span>
                <span className="text-slate-400 font-light ml-1">AI Framework™</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-6">
              A seven-layer, future-native AI delivery & intelligence framework.
              Agent-first, quantum-ready, and built for autonomous enterprise transformation.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                aria-label="GitHub"
              >
                <GitBranch className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                aria-label="LinkedIn"
              >
                <Link className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Framework Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Framework</h4>
            <ul className="space-y-2.5">
              {[
                "Agent-First Architecture",
                "Governance & Trust",
                "Algorithm Intelligence",
                "Quantum-Hybrid Layer",
                "Workflow Engine",
                "Adaptive Statistics",
                "Lifecycle Continuum",
              ].map((link) => (
                <li key={link}>
                  <a
                    href="#pillars"
                    className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2.5">
              {[
                { name: "Maturity Assessment", href: "#maturity" },
                { name: "AQI Scoring", href: "#metrics" },
                { name: "Quantum Readiness", href: "#metrics" },
                { name: "Agent Design Canvas", href: "#" },
                { name: "Glossary", href: "#" },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="https://aiwithpradeep.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1"
                >
                  Inspired by PATEL Model
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © 2026 AGARWAL AI Framework™ · Built for the post-GPT era
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-slate-600">v1.0.0</span>
            <span className="text-xs text-slate-600">MIT License</span>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Framework Active
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
