# 📦 AGARWAL AI Framework — Plugin Packages

Modular, pluggable packages that users can install individually into their projects.

## Available Packages

| Package | Description | Install |
|---------|-------------|---------|
| `@agarwal-ai/core` | Core utilities, types, config, retry logic | `npm i @agarwal-ai/core` |
| `@agarwal-ai/agents` | Multi-agent orchestration, MCP patterns, circuit breakers | `npm i @agarwal-ai/agents` |
| `@agarwal-ai/governance` | Trust Mesh, policy-as-code, audit trails, safety boundaries | `npm i @agarwal-ai/governance` |
| `@agarwal-ai/metrics` | AQI scoring, AADV-Next velocity, Bayesian estimation | `npm i @agarwal-ai/metrics` |
| `@agarwal-ai/workflow` | Pipeline orchestration, decision gates, dynamic stages | `npm i @agarwal-ai/workflow` |
| `@agarwal-ai/quantum` | QRI scoring, crypto inventory, PQC migration, workload assessment | `npm i @agarwal-ai/quantum` |

## Quick Start — Full Stack

```bash
npm install @agarwal-ai/core @agarwal-ai/agents @agarwal-ai/governance @agarwal-ai/metrics
```

```typescript
import { createAgarwal } from '@agarwal-ai/core';
import { createAgent, createOrchestrator } from '@agarwal-ai/agents';
import { createTrustMesh } from '@agarwal-ai/governance';
import { createAQI } from '@agarwal-ai/metrics';

// 1. Initialize framework
const framework = createAgarwal({ name: 'my-app' });

// 2. Create agents
const codeAgent = createAgent({
  name: 'code-generator',
  role: 'specialist',
  description: 'Generates production code',
  model: 'claude-opus-4.6',
  systemPrompt: 'You are a senior engineer...',
});

const reviewAgent = createAgent({
  name: 'code-reviewer',
  role: 'validator',
  description: 'Reviews code for quality and security',
  model: 'claude-opus-4.6',
  systemPrompt: 'You review code for...',
});

// 3. Create orchestrator
const orchestrator = createOrchestrator({
  name: 'dev-team',
  strategy: 'capability',
  agents: [codeAgent, reviewAgent],
});

// 4. Set up governance
const trustMesh = createTrustMesh({ maxTokenBudget: 100000, costCap: 5.0 });

// 5. Track metrics
const aqi = createAQI();
aqi.record({
  agentId: codeAgent.id,
  timestamp: Date.now(),
  taskCompleted: true,
  humanIntervention: false,
  taskComplexity: 'moderate',
  executionTimeMs: 4500,
  tokensUsed: 12000,
  costUSD: 0.03,
  qualityScore: 88,
  hadError: false,
});

const scores = aqi.calculate(codeAgent.id);
console.log(`AQI: ${scores.overall.toFixed(1)}`);
```

## Architecture

```
┌─────────────────────────────────────────────┐
│          YOUR APPLICATION                    │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ @agents  │  │@governance│  │ @metrics │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │              │              │        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │@workflow │  │ @quantum │  │  (more)  │  │
│  └────┬─────┘  └────┬─────┘  └──────────┘  │
│       │              │                       │
│       └──────┬───────┘                       │
│              │                               │
│       ┌──────▼──────┐                        │
│       │  @core      │                        │
│       │ (required)  │                        │
│       └─────────────┘                        │
│                                             │
└─────────────────────────────────────────────┘
```

## Use What You Need

Pick only the layers relevant to your project:

- **Just agents?** → `@agarwal-ai/core` + `@agarwal-ai/agents`
- **Just governance?** → `@agarwal-ai/core` + `@agarwal-ai/governance`
- **Just metrics?** → `@agarwal-ai/core` + `@agarwal-ai/metrics`
- **Full framework?** → All packages

## Package Details

### @agarwal-ai/agents
```typescript
import { createAgent, createOrchestrator, createSpecialist } from '@agarwal-ai/agents';

// Simple specialist
const agent = createSpecialist('reviewer', 'code review and security analysis');

// Full config
const agent = createAgent({
  name: 'architect',
  role: 'orchestrator',
  model: 'claude-opus-4.6',
  tools: [{ name: 'read_file', description: '...', inputSchema: {} }],
  memory: { vectorMemory: true, retentionDays: 90 },
  circuitBreaker: { failureThreshold: 5, successThreshold: 3, timeoutMs: 30000 },
});

// Orchestrate
const team = createOrchestrator({
  name: 'dev-team',
  strategy: 'capability',
  agents: [agent1, agent2, agent3],
});
const result = await team.dispatch('Build the login page');
```

### @agarwal-ai/governance
```typescript
import { createTrustMesh, createCostPolicy } from '@agarwal-ai/governance';

const mesh = createTrustMesh({ maxTokenBudget: 50000 });

// Add custom policy
mesh.addPolicy({
  name: 'no-production-writes',
  description: 'Block direct writes to production DB',
  severity: 'critical',
  action: 'block',
  condition: (ctx) => ctx.action.includes('production') && ctx.action.includes('write'),
  message: 'Production writes require deployment pipeline',
});

// Check before acting
const { allowed, violations } = mesh.isAllowed({
  agentId: 'agent_123',
  action: 'write_to_production_db',
  input: { table: 'users' },
});

// Get Trust Mesh Score
const tms = mesh.calculateTMS();
console.log(`TMS: ${tms.overall.toFixed(1)}/100`);
```

### @agarwal-ai/metrics
```typescript
import { createAQI, createAADV } from '@agarwal-ai/metrics';

// Track agent quality
const aqi = createAQI({ reliability: 0.30, alignment: 0.30 }); // custom weights
// ... record events ...
const scores = aqi.calculate('agent_xyz');
const { rating, action } = aqi.interpret(scores.overall);

// Track delivery velocity
const aadv = createAADV(0.5); // calibration factor
aadv.addSprint({ storyPointsCompleted: 42, totalStoryPoints: 50, sprintDuration: 14, aiContributionRatio: 0.35, aiChurnRate: 0.08, defectRate: 0.05, testPassRate: 0.95 });
const velocity = aadv.calculate();
console.log(`AADV: ${velocity.adjustedVelocity.toFixed(1)} [${velocity.confidenceInterval.map(v => v.toFixed(1)).join(', ')}]`);
```

### @agarwal-ai/quantum
```typescript
import { createQRI, createCryptoInventory, assessQuantumWorkload } from '@agarwal-ai/quantum';

// Assess quantum readiness
const qri = createQRI();
qri.setScore('literacy', 55);
qri.setScore('algorithmSuitability', 40);
qri.setScore('cryptoAgility', 60);
qri.setScore('infrastructure', 35);
console.log(`QRI: ${qri.calculate().overall.toFixed(1)} — Level: ${qri.getLevel()}`);

// Track crypto migration
const crypto = createCryptoInventory();
crypto.add({ id: '1', name: 'API Auth', algorithm: 'RSA-2048', keySize: 2048, usage: 'TLS', migrationStatus: 'in-progress', confidentialityYears: 15 });
console.log(`Urgent migrations: ${crypto.getUrgent().length}`);
console.log(`Recommended PQC: ${crypto.recommendPQC('key-exchange')}`);

// Assess workload
const assessment = assessQuantumWorkload('portfolio-optimization', 'optimization', 500, 'O(2^n)');
console.log(`${assessment.recommendation} — score: ${assessment.feasibilityScore}`);
```

### @agarwal-ai/workflow
```typescript
import { createPipeline } from '@agarwal-ai/workflow';
import { createAgent } from '@agarwal-ai/agents';

const pipeline = createPipeline({
  name: 'feature-delivery',
  trigger: 'intent',
  stages: [
    { name: 'design', agents: [architectAgent], gate: 'human' },
    { name: 'build', agents: [codeAgent, testAgent], parallel: true },
    { name: 'review', agents: [reviewAgent], gate: 'auto' },
    { name: 'deploy', agents: [deployAgent], gate: 'risk-based' },
  ],
  onFailure: 'stop',
});

pipeline.setRiskScore(35); // low risk = auto-gates pass
const result = await pipeline.run();
```
