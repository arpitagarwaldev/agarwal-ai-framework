"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";

const steps = [
  {
    title: "1. Install the packages you need",
    description: "Pick your layers. Core is always required.",
    code: `# Full framework
npm install @agarwal-ai/core @agarwal-ai/agents @agarwal-ai/governance @agarwal-ai/metrics @agarwal-ai/workflow @agarwal-ai/quantum

# Or just what you need
npm install @agarwal-ai/core @agarwal-ai/agents @agarwal-ai/governance`,
  },
  {
    title: "2. Initialize the framework",
    description: "Create your AGARWAL instance with project config.",
    code: `import { createAgarwal } from '@agarwal-ai/core';

const framework = createAgarwal({
  name: 'my-saas-app',
  settings: {
    logLevel: 'info',
    environment: 'production',
    maxRetries: 3,
    timeoutMs: 30000,
  }
});

// Enable the layers you're using
framework.enableLayer('agent');
framework.enableLayer('governance');
framework.enableLayer('workflow');

console.log(framework.getActiveLayers());
// => ['agent', 'governance', 'workflow', 'autonomous', 'lifecycle']`,
  },
  {
    title: "3. Create and orchestrate agents",
    description: "Define agents with roles, tools, and memory. Wire them into an orchestrator.",
    code: `import { createAgent, createOrchestrator, createSpecialist } from '@agarwal-ai/agents';

// Quick specialist agent
const reviewer = createSpecialist('code-reviewer', 'code review and security');

// Full-config agent
const coder = createAgent({
  name: 'code-generator',
  role: 'specialist',
  description: 'Generates production TypeScript code',
  model: 'claude-opus-4.6',
  temperature: 0.3,
  maxTokens: 4096,
  systemPrompt: 'You are a senior TypeScript engineer...',
  tools: [
    { name: 'read_file', description: 'Read a file', inputSchema: { path: 'string' } },
    { name: 'write_file', description: 'Write a file', inputSchema: { path: 'string', content: 'string' } },
  ],
  memory: { vectorMemory: true, retentionDays: 90 },
  circuitBreaker: { failureThreshold: 5, successThreshold: 3, timeoutMs: 30000 },
});

// Orchestrate a team
const team = createOrchestrator({
  name: 'engineering-team',
  strategy: 'capability',
  agents: [coder, reviewer],
});

// Dispatch work
const result = await team.dispatch('Build a REST API for user authentication');
console.log(result.output);`,
  },
  {
    title: "4. Add governance & safety",
    description: "Set up Trust Mesh with policies that auto-validate every agent action.",
    code: `import { createTrustMesh, createCostPolicy } from '@agarwal-ai/governance';

// Create mesh with guardrails
const mesh = createTrustMesh({
  maxTokenBudget: 100000,
  costCap: 5.0,
  blockedPatterns: [/password\\s*=\\s*['"][^'"]+['"]/i],
});

// Add custom policies
mesh.addPolicy({
  name: 'no-direct-db-writes',
  description: 'All DB writes must go through the ORM layer',
  severity: 'high',
  action: 'block',
  condition: (ctx) => ctx.action.includes('raw_sql') && ctx.action.includes('INSERT'),
  message: 'Direct SQL writes blocked — use the ORM',
});

mesh.addPolicy(createCostPolicy(2.0)); // Warn if task costs > $2

// Validate before any agent action
const { allowed, violations } = mesh.isAllowed({
  agentId: coder.id,
  action: 'write_file',
  input: { path: 'src/auth.ts', content: '...' },
});

if (!allowed) {
  console.error('BLOCKED:', violations.map(v => v.message));
}

// Calculate Trust Mesh Score
const tms = mesh.calculateTMS();
console.log(\`Trust Mesh Score: \${tms.overall.toFixed(1)}/100\`);`,
  },
  {
    title: "5. Track metrics & quality",
    description: "Measure agent quality (AQI) and delivery velocity (AADV-Next) with statistical rigor.",
    code: `import { createAQI, createAADV } from '@agarwal-ai/metrics';

// --- Agent Quality Index ---
const aqi = createAQI();

// Record events as agents work
aqi.record({
  agentId: coder.id,
  timestamp: Date.now(),
  taskCompleted: true,
  humanIntervention: false,
  taskComplexity: 'moderate',
  executionTimeMs: 4500,
  tokensUsed: 12000,
  costUSD: 0.036,
  qualityScore: 88,
  hadError: false,
});

const scores = aqi.calculate(coder.id);
console.log(\`AQI: \${scores.overall.toFixed(1)}\`);
console.log(\`  Autonomy: \${scores.autonomy.toFixed(0)}\`);
console.log(\`  Reliability: \${scores.reliability.toFixed(0)}\`);
console.log(\`  Alignment: \${scores.alignment.toFixed(0)}\`);

const { rating, action } = aqi.interpret(scores.overall);
console.log(\`Rating: \${rating} → \${action}\`);

// --- Delivery Velocity ---
const aadv = createAADV(0.5);
aadv.addSprint({
  storyPointsCompleted: 42,
  totalStoryPoints: 50,
  sprintDuration: 14,
  aiContributionRatio: 0.35,
  aiChurnRate: 0.08,
  defectRate: 0.04,
  testPassRate: 0.96,
});

const velocity = aadv.calculate();
console.log(\`AADV-Next: \${velocity.adjustedVelocity.toFixed(1)} pts/week\`);
console.log(\`AI Amplification: \${velocity.aiAmplification.toFixed(2)}x\`);
console.log(\`90% CI: [\${velocity.confidenceInterval.map(v => v.toFixed(1)).join(', ')}]\`);`,
  },
  {
    title: "6. Build pipelines with decision gates",
    description: "Self-orchestrating workflows with human-in-the-loop at critical decision points.",
    code: `import { createPipeline } from '@agarwal-ai/workflow';

const pipeline = createPipeline({
  name: 'feature-delivery',
  trigger: 'intent',
  stages: [
    { name: 'design', agents: [architectAgent], gate: 'human' },
    { name: 'build', agents: [coder, testAgent], parallel: true },
    { name: 'review', agents: [reviewer], gate: 'auto' },
    { name: 'deploy', agents: [deployAgent], gate: 'risk-based' },
  ],
  onFailure: 'stop',
});

// Set context
pipeline.setRiskScore(25); // Low risk → auto-gates pass
pipeline.setMetadata('feature', 'user-authentication');

// Custom gate handler
pipeline.onGate('risk-based', async (ctx, stage) => ({
  stage,
  gateType: 'risk-based',
  decision: ctx.riskScore < 50 ? 'approved' : 'pending',
  reason: ctx.riskScore < 50 ? 'Low risk auto-approved' : 'High risk needs review',
  decidedBy: ctx.riskScore < 50 ? 'auto' : 'human',
  timestamp: Date.now(),
}));

const result = await pipeline.run();
console.log(\`Pipeline: \${result.status}\`);
console.log(\`Stages: \${result.stages.map(s => \`\${s.name}:\${s.result.status}\`).join(' → ')}\`);
console.log(\`Duration: \${result.totalDurationMs}ms\`);`,
  },
];

function CodeBlock({ code, title }: { code: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Copy code"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
      </button>
      <pre className="bg-black/40 rounded-xl border border-white/5 p-5 overflow-x-auto text-[13px] leading-relaxed font-mono text-slate-300">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function InstallGuide() {
  return (
    <section id="install" className="relative py-24 px-6">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-4 block">Step by Step</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Integration Guide</h2>
          <p className="text-slate-400 max-w-xl mx-auto">From install to production in six steps. Each step builds on the previous.</p>
        </motion.div>

        <div className="space-y-12">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white mb-1">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.description}</p>
              </div>
              <CodeBlock code={step.code} title={step.title} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
