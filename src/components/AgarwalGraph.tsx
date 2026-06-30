"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PillarNode {
  id: string;
  letter: string;
  title: string;
  tagline: string;
  description: string;
  color: string;
  glowColor: string;
  technologies: string[];
  angle: number; // position on circle (degrees)
}

const pillarsData: PillarNode[] = [
  {
    id: "agent",
    letter: "A",
    title: "Agent-First",
    tagline: "Autonomous Multi-Agent Systems",
    description:
      "Every function is an agent — planning, coding, testing, deploying. Orchestrated via MCP & A2A protocols with human oversight at decision gates.",
    color: "#10b981",
    glowColor: "rgba(16, 185, 129, 0.3)",
    technologies: ["MCP Protocol", "A2A Protocol", "LangGraph", "CrewAI", "Swarm Intelligence", "Agent Memory"],
    angle: -90, // top
  },
  {
    id: "governance",
    letter: "G",
    title: "Governance",
    tagline: "Trust Mesh & Compliance-as-Code",
    description:
      "Distributed real-time governance via Trust Mesh nodes. Policy-as-YAML, explainability standards, automated bias detection, and kill switch protocols.",
    color: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.3)",
    technologies: ["Trust Mesh", "XAI/SHAP", "EU AI Act", "Constitutional AI", "Bias Detection", "Kill Switch"],
    angle: -38.57,
  },
  {
    id: "algorithm",
    letter: "A",
    title: "Algorithm",
    tagline: "Self-Designing Intelligence",
    description:
      "Systems that design themselves. Neural Architecture Search, evolutionary optimization, meta-learning, and reinforcement learning at scale.",
    color: "#ec4899",
    glowColor: "rgba(236, 72, 153, 0.3)",
    technologies: ["Neural Architecture Search", "LLM-Guided NAS", "Meta-Learning", "CMA-ES", "RLHF/DPO", "MoE"],
    angle: 12.86,
  },
  {
    id: "resilient",
    letter: "R",
    title: "Resilient",
    tagline: "Quantum-Classical Hybrid",
    description:
      "Classical today, quantum tomorrow. Abstraction layers for hybrid compute, QML algorithms, post-quantum cryptography, and crypto-agility architecture.",
    color: "#a855f7",
    glowColor: "rgba(168, 85, 247, 0.3)",
    technologies: ["Quantum ML", "VQC/QAOA", "Post-Quantum Crypto", "Crypto-Agility", "Quantum Kernels", "Error Correction"],
    angle: 64.29,
  },
  {
    id: "workflow",
    letter: "W",
    title: "Workflow",
    tagline: "Self-Orchestrating Pipelines",
    description:
      "Agentic SDLC with self-composing pipelines. Dynamic stage composition based on risk analysis. Intent-based triggering, speculative execution.",
    color: "#3b82f6",
    glowColor: "rgba(59, 130, 246, 0.3)",
    technologies: ["Agentic SDLC", "Dynamic Pipelines", "Intent Triggers", "Fan-Out/Fan-In", "Canary Deploy", "Shadow Mode"],
    angle: 115.71,
  },
  {
    id: "autonomous",
    letter: "A",
    title: "Autonomous",
    tagline: "Adaptive Statistics & Evaluation",
    description:
      "Bayesian delivery estimation, causal inference for AI impact, information-theoretic metrics. Uncertainty quantified as distributions, not hidden.",
    color: "#14b8a6",
    glowColor: "rgba(20, 184, 166, 0.3)",
    technologies: ["AADV-Next™", "Bayesian Estimation", "Causal Inference", "AQI Score", "KL Divergence", "A/B Testing"],
    angle: 167.14,
  },
  {
    id: "lifecycle",
    letter: "L",
    title: "Lifecycle",
    tagline: "Continuous Evolution Loop",
    description:
      "No beginning, no end. Discover → Design → Build → Verify → Deploy → Observe → Evolve. Knowledge compounds with every cycle via federated learning.",
    color: "#f97316",
    glowColor: "rgba(249, 115, 22, 0.3)",
    technologies: ["Infinite Loop", "Federated Learning", "Knowledge Graph", "Self-Healing", "Drift Detection", "MLOps"],
    angle: 218.57,
  },
];

export function AgarwalGraph() {
  const [activeNode, setActiveNode] = useState<PillarNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const centerX = 300;
  const centerY = 300;
  const radius = 200;

  const getNodePosition = (angle: number) => ({
    x: centerX + radius * Math.cos((angle * Math.PI) / 180),
    y: centerY + radius * Math.sin((angle * Math.PI) / 180),
  });

  return (
    <section id="agarwal-graph" className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-4 block">
            Interactive Framework
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            The <span className="gradient-text">AGARWAL</span> Graph
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Click any letter to explore its layer. Each node connects to every other —
            forming a compounding intelligence loop.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Interactive SVG Graph */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative w-full max-w-[600px] aspect-square"
          >
            <svg
              viewBox="0 0 600 600"
              className="w-full h-full"
              role="img"
              aria-label="AGARWAL Framework interactive graph showing 7 interconnected pillars"
            >
              {/* Background subtle grid */}
              <defs>
                <radialGradient id="centerGlow">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
                  <stop offset="70%" stopColor="#6366f1" stopOpacity="0.02" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </radialGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Center glow */}
              <circle cx={centerX} cy={centerY} r="120" fill="url(#centerGlow)" />

              {/* Connection lines between all nodes */}
              {pillarsData.map((node, i) => {
                const pos = getNodePosition(node.angle);
                return pillarsData.map((otherNode, j) => {
                  if (j <= i) return null;
                  const otherPos = getNodePosition(otherNode.angle);
                  const isHighlighted =
                    hoveredNode === node.id || hoveredNode === otherNode.id || activeNode?.id === node.id || activeNode?.id === otherNode.id;
                  return (
                    <line
                      key={`${i}-${j}`}
                      x1={pos.x}
                      y1={pos.y}
                      x2={otherPos.x}
                      y2={otherPos.y}
                      stroke={isHighlighted ? node.color : "#334155"}
                      strokeWidth={isHighlighted ? "1.5" : "0.5"}
                      opacity={isHighlighted ? 0.6 : 0.2}
                      className="transition-all duration-300"
                    />
                  );
                });
              })}

              {/* Connection lines to center */}
              {pillarsData.map((node, i) => {
                const pos = getNodePosition(node.angle);
                const isActive = hoveredNode === node.id || activeNode?.id === node.id;
                return (
                  <line
                    key={`center-${i}`}
                    x1={pos.x}
                    y1={pos.y}
                    x2={centerX}
                    y2={centerY}
                    stroke={isActive ? node.color : "#1e293b"}
                    strokeWidth={isActive ? "2" : "1"}
                    opacity={isActive ? 0.8 : 0.3}
                    strokeDasharray={isActive ? "none" : "4 4"}
                    className="transition-all duration-300"
                  />
                );
              })}

              {/* Center label */}
              <text
                x={centerX}
                y={centerY - 8}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="10"
                fontWeight="500"
              >
                COMPOUNDING
              </text>
              <text
                x={centerX}
                y={centerY + 8}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="10"
                fontWeight="500"
              >
                INTELLIGENCE
              </text>

              {/* Nodes */}
              {pillarsData.map((node, i) => {
                const pos = getNodePosition(node.angle);
                const isActive = activeNode?.id === node.id;
                const isHovered = hoveredNode === node.id;
                const scale = isActive || isHovered ? 1.15 : 1;

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer"
                    onClick={() => setActiveNode(isActive ? null : node)}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    style={{ transform: `scale(${scale})`, transformOrigin: `${pos.x}px ${pos.y}px`, transition: "transform 0.3s ease" }}
                  >
                    {/* Outer glow ring */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isActive ? 48 : isHovered ? 44 : 38}
                      fill={node.color}
                      opacity={isActive ? 0.12 : isHovered ? 0.08 : 0.04}
                      className="transition-all duration-300"
                    />

                    {/* Main circle */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="32"
                      fill="#0f0f23"
                      stroke={node.color}
                      strokeWidth={isActive ? "3" : isHovered ? "2.5" : "2"}
                      opacity={1}
                      filter={isActive || isHovered ? "url(#glow)" : ""}
                      className="transition-all duration-300"
                    />

                    {/* Letter */}
                    <text
                      x={pos.x}
                      y={pos.y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={node.color}
                      fontSize="22"
                      fontWeight="900"
                      fontFamily="Inter, system-ui, sans-serif"
                    >
                      {node.letter}
                    </text>

                    {/* Title label below */}
                    <text
                      x={pos.x}
                      y={pos.y + 52}
                      textAnchor="middle"
                      fill={isActive || isHovered ? node.color : "#64748b"}
                      fontSize="11"
                      fontWeight="600"
                      className="transition-all duration-300"
                    >
                      {node.title}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Rotating dashed ring animation */}
            <div className="absolute inset-0 pointer-events-none">
              <svg viewBox="0 0 600 600" className="w-full h-full animate-[spin_60s_linear_infinite]">
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={radius}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="0.5"
                  strokeDasharray="3 8"
                  opacity="0.2"
                />
              </svg>
            </div>
          </motion.div>

          {/* Detail Panel */}
          <div className="flex-1 min-h-[400px] w-full lg:max-w-md">
            <AnimatePresence mode="wait">
              {activeNode ? (
                <motion.div
                  key={activeNode.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="glass rounded-2xl p-8 h-full"
                  style={{
                    borderColor: `${activeNode.color}30`,
                    boxShadow: `0 0 40px ${activeNode.glowColor}`,
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black"
                      style={{
                        backgroundColor: `${activeNode.color}15`,
                        color: activeNode.color,
                        border: `2px solid ${activeNode.color}40`,
                      }}
                    >
                      {activeNode.letter}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {activeNode.title}
                      </h3>
                      <p className="text-sm" style={{ color: activeNode.color }}>
                        {activeNode.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {activeNode.description}
                  </p>

                  {/* Technologies */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      Key Technologies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeNode.technologies.map((tech, i) => (
                        <span
                          key={i}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium"
                          style={{
                            backgroundColor: `${activeNode.color}10`,
                            color: activeNode.color,
                            border: `1px solid ${activeNode.color}25`,
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Close hint */}
                  <p className="mt-6 text-xs text-slate-600 text-center">
                    Click the node again to close
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-2xl">👆</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Select a Node
                  </h3>
                  <p className="text-sm text-slate-500 max-w-xs">
                    Click any letter in the AGARWAL graph to explore that layer&apos;s
                    technologies, purpose, and capabilities.
                  </p>
                  <div className="mt-6 flex gap-1">
                    {pillarsData.map((p) => (
                      <span
                        key={p.id}
                        className="text-xl font-black"
                        style={{ color: p.color }}
                      >
                        {p.letter}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
