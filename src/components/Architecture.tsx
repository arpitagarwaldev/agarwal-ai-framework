"use client";

import { motion } from "framer-motion";

export function Architecture() {
  return (
    <section id="architecture" className="relative py-32 px-6">
      {/* Background accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-accent mb-4 block">
            System Design
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Compounding Intelligence Loop
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Each layer feeds the next in a continuous cycle of improvement.
            Intelligence compounds with every iteration.
          </p>
        </motion.div>

        {/* Architecture Diagram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="glass rounded-3xl p-8 md:p-12 overflow-hidden">
            {/* Central Loop Visualization */}
            <div className="relative max-w-4xl mx-auto">
              {/* Outer Ring */}
              <svg
                viewBox="0 0 600 600"
                className="w-full max-w-[500px] mx-auto"
                aria-label="AGARWAL Framework architecture loop diagram"
              >
                {/* Outer circle */}
                <circle
                  cx="300"
                  cy="300"
                  r="250"
                  fill="none"
                  stroke="url(#gradientRing)"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                  opacity="0.4"
                />
                {/* Inner circle */}
                <circle
                  cx="300"
                  cy="300"
                  r="100"
                  fill="url(#coreGradient)"
                  opacity="0.3"
                />
                <text
                  x="300"
                  y="290"
                  textAnchor="middle"
                  fill="#e2e8f0"
                  fontSize="12"
                  fontWeight="600"
                >
                  COMPOUNDING
                </text>
                <text
                  x="300"
                  y="310"
                  textAnchor="middle"
                  fill="#e2e8f0"
                  fontSize="12"
                  fontWeight="600"
                >
                  INTELLIGENCE
                </text>

                {/* Nodes */}
                {[
                  { x: 300, y: 60, label: "Agent", color: "#10b981" },
                  { x: 510, y: 150, label: "Governance", color: "#f59e0b" },
                  { x: 550, y: 370, label: "Algorithm", color: "#ec4899" },
                  { x: 430, y: 530, label: "Quantum", color: "#a855f7" },
                  { x: 170, y: 530, label: "Workflow", color: "#3b82f6" },
                  { x: 50, y: 370, label: "Statistics", color: "#14b8a6" },
                  { x: 90, y: 150, label: "Lifecycle", color: "#f97316" },
                ].map((node, i) => (
                  <g key={i}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="35"
                      fill={node.color}
                      opacity="0.15"
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="25"
                      fill={node.color}
                      opacity="0.3"
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="6"
                      fill={node.color}
                    />
                    <text
                      x={node.x}
                      y={node.y + 50}
                      textAnchor="middle"
                      fill={node.color}
                      fontSize="11"
                      fontWeight="500"
                    >
                      {node.label}
                    </text>
                  </g>
                ))}

                {/* Connecting arcs */}
                <path
                  d="M 330 75 A 250 250 0 0 1 495 165"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1.5"
                  opacity="0.4"
                  markerEnd="url(#arrowhead)"
                />
                <path
                  d="M 530 180 A 250 250 0 0 1 555 350"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  opacity="0.4"
                  markerEnd="url(#arrowhead)"
                />
                <path
                  d="M 535 395 A 250 250 0 0 1 445 515"
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="1.5"
                  opacity="0.4"
                  markerEnd="url(#arrowhead)"
                />
                <path
                  d="M 410 545 A 250 250 0 0 1 195 545"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="1.5"
                  opacity="0.4"
                  markerEnd="url(#arrowhead)"
                />
                <path
                  d="M 155 515 A 250 250 0 0 1 65 395"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  opacity="0.4"
                  markerEnd="url(#arrowhead)"
                />
                <path
                  d="M 45 350 A 250 250 0 0 1 75 170"
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="1.5"
                  opacity="0.4"
                  markerEnd="url(#arrowhead)"
                />
                <path
                  d="M 105 135 A 250 250 0 0 1 270 62"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="1.5"
                  opacity="0.4"
                  markerEnd="url(#arrowhead)"
                />

                {/* Definitions */}
                <defs>
                  <radialGradient id="coreGradient">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
                  </radialGradient>
                  <linearGradient id="gradientRing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                  <marker
                    id="arrowhead"
                    markerWidth="6"
                    markerHeight="6"
                    refX="5"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 6 3, 0 6" fill="#94a3b8" opacity="0.6" />
                  </marker>
                </defs>
              </svg>

              {/* Flow Description */}
              <div className="mt-12 grid md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="text-2xl mb-2">🔄</div>
                  <h4 className="text-sm font-semibold text-white mb-1">Self-Reinforcing</h4>
                  <p className="text-xs text-slate-500">
                    Each layer&apos;s output feeds the next. Intelligence compounds with every cycle.
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl mb-2">⚡</div>
                  <h4 className="text-sm font-semibold text-white mb-1">Parallel Execution</h4>
                  <p className="text-xs text-slate-500">
                    Layers operate concurrently. No sequential bottleneck. Speed of autonomous delivery.
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl mb-2">🧬</div>
                  <h4 className="text-sm font-semibold text-white mb-1">Evolutionary</h4>
                  <p className="text-xs text-slate-500">
                    The framework optimizes itself via meta-learning. It gets better at getting better.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
