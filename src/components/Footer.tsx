"use client";

import { motion } from "framer-motion";
import { Cpu, GitBranch, Mail, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative py-20 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        {/* Contact Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 glass rounded-2xl p-8 md:p-10 text-center"
          style={{ borderColor: "rgba(99, 102, 241, 0.2)" }}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Get in Touch
          </h3>
          <p className="text-slate-400 max-w-lg mx-auto mb-8">
            Questions about the framework? Want to collaborate or contribute?
            Reach out directly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Email */}
            <a
              href="mailto:arpit.dev@outlook.com"
              className="flex items-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
            >
              <Mail className="w-5 h-5" />
              arpit.dev@outlook.com
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/arpitagarwaldev/agarwal-ai-framework"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3.5 rounded-xl gradient-border text-slate-300 font-semibold hover:text-white transition-all hover:-translate-y-0.5"
            >
              <GitBranch className="w-5 h-5" />
              GitHub Repository
              <ArrowUpRight className="w-4 h-4 opacity-50" />
            </a>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-500">
            <span>Built by <span className="text-slate-300 font-medium">Arpit Agarwal</span></span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <a
              href="https://github.com/arpitagarwaldev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              @arpitagarwaldev
            </a>
          </div>
        </motion.div>

        {/* Main Footer Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
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
            <div className="flex gap-3">
              <a
                href="https://github.com/arpitagarwaldev/agarwal-ai-framework"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                aria-label="GitHub"
              >
                <GitBranch className="w-4 h-4" />
              </a>
              <a
                href="mailto:arpit.dev@outlook.com"
                className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
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
                { name: "Plugins & SDKs", href: "/plugins" },
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
            </ul>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © 2026 AGARWAL AI Framework™ · Built by Arpit Agarwal
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
