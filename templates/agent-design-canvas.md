# 🎨 Agent Design Canvas

## Template for Designing Production AI Agents

Use this canvas to design, document, and review AI agents before deployment.

---

## Agent Identity

| Field | Value |
|---|---|
| **Agent Name** | |
| **Version** | |
| **Owner** | |
| **Purpose (1 sentence)** | |
| **Agent Type** | [ ] Specialist  [ ] Orchestrator  [ ] Validator  [ ] Monitor |
| **Autonomy Level** | [ ] Copilot  [ ] Delegate  [ ] Autonomous  [ ] Self-Evolving |

---

## Capabilities & Boundaries

### What This Agent DOES
1. 
2. 
3. 
4. 
5. 

### What This Agent Does NOT Do (Explicit Boundaries)
1. 
2. 
3. 

### Tools Required (MCP Connections)
| Tool | Purpose | Access Level | Auto-Approve? |
|---|---|---|---|
| | | Read / Write / Admin | Yes / No |
| | | Read / Write / Admin | Yes / No |
| | | Read / Write / Admin | Yes / No |

---

## Input / Output Contract

### Inputs
```json
{
  "required": {
    "field_1": "type — description",
    "field_2": "type — description"
  },
  "optional": {
    "field_3": "type — description (default: value)"
  }
}
```

### Outputs
```json
{
  "success": {
    "result": "type — description",
    "confidence": "number (0-1)",
    "reasoning": "string — explanation of decision"
  },
  "failure": {
    "error_code": "string",
    "error_message": "string",
    "recovery_suggestion": "string"
  }
}
```

---

## Decision Logic

### Decision Tree
```
Input received
├── Pre-condition check
│   ├── FAIL → Return error with recovery suggestion
│   └── PASS → Continue
├── Classify complexity
│   ├── SIMPLE → Direct execution
│   ├── MODERATE → Plan → Execute → Validate
│   └── COMPLEX → Decompose → Delegate → Synthesize
├── Execute
│   ├── SUCCESS → Validate output → Return
│   └── FAILURE → Retry logic (max 3)
│       ├── Retry SUCCESS → Return
│       └── Retry EXHAUSTED → Escalate
└── Post-execution
    ├── Log decision trail
    ├── Update knowledge base
    └── Trigger downstream agents (if applicable)
```

### Confidence Thresholds
| Confidence | Action |
|---|---|
| ≥ 0.90 | Proceed autonomously |
| 0.70 - 0.89 | Proceed with enhanced logging |
| 0.50 - 0.69 | Seek validation from specialist agent |
| < 0.50 | Escalate to human |

---

## Failure Modes & Mitigations

| Failure Mode | Detection | Mitigation | Severity |
|---|---|---|---|
| | | | Critical / High / Medium / Low |
| | | | |
| | | | |

### Circuit Breaker Configuration
```yaml
circuit_breaker:
  failure_threshold: 5          # failures before opening
  success_threshold: 3          # successes before closing
  timeout_seconds: 300          # time in open state before half-open
  monitoring_window: 600        # window for counting failures
```

---

## Memory & Context

### Short-Term Memory
- Context window usage: ___K tokens (max: ___K)
- Session state managed by: [ ] Framework  [ ] Custom  [ ] External DB

### Long-Term Memory
- Vector store: [ ] Pinecone  [ ] Weaviate  [ ] Qdrant  [ ] pgvector  [ ] Other: ___
- Knowledge graph: [ ] Neo4j  [ ] Neptune  [ ] None
- Retention policy: ___ days/indefinite

### Organizational Memory Access
- [ ] Read from shared knowledge base
- [ ] Write to shared knowledge base
- [ ] Access cross-project patterns
- [ ] Contribute to anti-pattern catalog

---

## Governance & Compliance

### Trust Mesh Integration
- [ ] Ethics node validation required
- [ ] Compliance node validation required
- [ ] Security node validation required
- [ ] Quality node validation required

### Governance Policies Applied
| Policy | Enforcement |
|---|---|
| | Block / Warn / Log |
| | Block / Warn / Log |

### Audit Trail
- Decision logging: [ ] Full  [ ] Summary  [ ] Critical-only
- Log retention: ___ days
- Explainability: [ ] SHAP  [ ] Attention  [ ] Chain-of-thought  [ ] All

---

## Performance Targets

| Metric | Target | Alert Threshold |
|---|---|---|
| Response time (P95) | ≤ ___ms | > ___ms |
| Accuracy/Alignment | ≥ ___% | < ___% |
| Autonomy rate | ≥ ___% | < ___% |
| Failure rate | ≤ ___% | > ___% |
| Token cost per task | ≤ $___ | > $___ |
| AQI target | ≥ ___ | < ___ |

---

## Dependencies & Interactions

### Upstream (Who calls this agent?)
| Caller | Trigger | Expected Frequency |
|---|---|---|
| | | |

### Downstream (Who does this agent call?)
| Callee | Purpose | Protocol |
|---|---|---|
| | | MCP / A2A / Direct |

### Conflict Resolution
When this agent disagrees with another agent:
- [ ] This agent defers
- [ ] This agent's decision takes priority
- [ ] Escalate to orchestrator
- [ ] Human arbitration

---

## Deployment & Operations

### Deployment Configuration
```yaml
deployment:
  instances: 1                  # Horizontal scaling
  model: "claude-opus-4.6"     # Foundation model
  temperature: 0.3             # Creativity level
  max_tokens: 4096             # Output limit
  timeout_seconds: 120         # Per-request timeout
  retry_policy:
    max_retries: 3
    backoff: exponential
    initial_delay_ms: 1000
```

### Monitoring
- [ ] Latency dashboard
- [ ] Error rate alerting
- [ ] Cost tracking
- [ ] AQI scoring
- [ ] Drift detection

### Rollback Plan
If this agent fails critically:
1. 
2. 
3. 

---

## Sign-off

| Role | Name | Date | Approval |
|---|---|---|---|
| Agent Designer | | | ☐ |
| Security Reviewer | | | ☐ |
| Governance Lead | | | ☐ |
| Team Lead | | | ☐ |

---

*Template version: 1.0 | Part of the AGARWAL Framework™*
