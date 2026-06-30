# 📊 Agent Quality Index (AQI)

## Definition

The Agent Quality Index is a composite metric measuring the overall effectiveness of AI agents in production delivery systems. It provides a single score (0-100) that captures five critical dimensions of agent performance.

---

## Formula

```
AQI = (w₁ × Autonomy) + (w₂ × Reliability) + (w₃ × Alignment) + (w₄ × Efficiency) + (w₅ × Adaptability)

Default Weights:
  w₁ = 0.20 (Autonomy)
  w₂ = 0.25 (Reliability)
  w₃ = 0.25 (Alignment)
  w₄ = 0.15 (Efficiency)
  w₅ = 0.15 (Adaptability)
```

---

## Component Definitions

### 1. Autonomy Score (0-100)

**What it measures:** Percentage of tasks an agent completes without human intervention, weighted by task complexity.

```
Autonomy = Σ(task_completed_autonomously × complexity_weight) / Σ(total_tasks × complexity_weight) × 100

Complexity weights:
  Trivial (typo fixes, formatting) = 0.5
  Simple (single-file changes) = 1.0
  Moderate (multi-file, single-component) = 2.0
  Complex (multi-component, API changes) = 4.0
  Critical (architecture, security) = 8.0
```

**Target:** ≥ 70 for production agents

### 2. Reliability Score (0-100)

**What it measures:** Consistency and correctness of agent outputs over time.

```
Reliability = (1 - Weighted_Failure_Rate) × 100

Weighted_Failure_Rate = Σ(failure_i × severity_weight_i) / total_executions

Severity weights:
  Critical (data loss, security breach) = 1.0
  High (feature broken, deploy failure) = 0.7
  Medium (test failures, minor bugs) = 0.3
  Low (style issues, minor improvements) = 0.1
  
Additional factors:
  - MTTR (Mean Time to Recovery): How quickly agent self-corrects
  - Flakiness: Variance in output for identical inputs
  - Graceful degradation: Behavior under resource constraints
```

**Target:** ≥ 85 for production agents

### 3. Alignment Score (0-100)

**What it measures:** How well agent outputs match intended behavior and organizational standards.

```
Alignment = (Correctness × 0.4) + (Completeness × 0.3) + (Standards_Adherence × 0.3)

Correctness:
  cosine_similarity(agent_output_embedding, verified_gold_standard) × 100
  
Completeness:
  requirements_addressed / total_requirements × 100
  
Standards_Adherence:
  (passing_lint_rules + style_compliance + security_compliance) / total_checks × 100
```

**Measurement methods:**
- Automated eval against human-validated samples (weekly)
- LLM-judge evaluation with calibrated scoring (continuous)
- Human spot-check sampling (monthly, n=50+)
- A/B testing against human performance (quarterly)

**Target:** ≥ 80 for production agents

### 4. Efficiency Score (0-100)

**What it measures:** Value delivered relative to resources consumed.

```
Efficiency = normalize_to_100(Value_Delivered / Total_Cost)

Value_Delivered:
  story_points_completed × quality_multiplier × persistence_factor
  
  quality_multiplier = test_pass_rate × (1 - defect_escape_rate)
  persistence_factor = (1 - code_churn_within_sprint)

Total_Cost:
  token_cost = tokens_consumed × price_per_token
  compute_cost = GPU_hours × price_per_GPU_hour
  time_cost = wall_clock_seconds × opportunity_cost_per_second
  human_intervention_cost = escalations × avg_human_time × hourly_rate

Normalization: Scale against team's historical baseline
```

**Target:** ≥ 60 (indicates positive ROI)

### 5. Adaptability Score (0-100)

**What it measures:** Agent's ability to maintain performance under changing conditions.

```
Adaptability = (Distribution_Shift_Resilience × 0.4) + 
               (New_Task_Learning × 0.3) + 
               (Recovery_Speed × 0.3)

Distribution_Shift_Resilience:
  performance_on_shifted_data / performance_on_baseline_data × 100
  
New_Task_Learning:
  performance_after_N_examples / expert_performance × 100
  (measured with 5-shot evaluation on new task types)
  
Recovery_Speed:
  1 / (time_to_recover_performance_after_change) × normalization_factor
```

**Target:** ≥ 65 for production agents

---

## Scoring Interpretation

| AQI Score | Rating | Action |
|---|---|---|
| 90-100 | Excellent | Agent ready for expanded autonomy |
| 75-89 | Good | Production-ready, normal monitoring |
| 60-74 | Acceptable | Production with increased oversight |
| 40-59 | Needs Improvement | Restricted to non-critical tasks |
| 0-39 | Failing | Remove from production, retrain/redesign |

---

## Measurement Cadence

| Component | Measurement Frequency | Data Source |
|---|---|---|
| Autonomy | Daily (aggregate weekly) | Task completion logs |
| Reliability | Continuous | Error monitoring, incident logs |
| Alignment | Weekly (human eval monthly) | Eval pipeline, LLM-judge |
| Efficiency | Sprint-level | Cost tracking, delivery metrics |
| Adaptability | Monthly + on-change | Performance tests under shift |

---

## Dashboard Template

```
╔══════════════════════════════════════════════════════════════╗
║                  AGENT QUALITY INDEX                          ║
║                                                              ║
║  Agent: code-review-agent-v3            AQI: 82 (Good)      ║
║  Period: Sprint 2026-Q2-S4              Trend: ↑ +3         ║
║                                                              ║
║  ┌─────────────────────────────────────────────────┐        ║
║  │ Autonomy     ████████████████████░░░  78        │        ║
║  │ Reliability  █████████████████████████ 91       │        ║
║  │ Alignment    ████████████████████████░ 84       │        ║
║  │ Efficiency   ████████████████░░░░░░░░ 68       │        ║
║  │ Adaptability █████████████████████░░░ 79       │        ║
║  └─────────────────────────────────────────────────┘        ║
║                                                              ║
║  Alerts: Efficiency below target (68 < 70)                  ║
║  Action: Investigate token consumption spike on Jun 25      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Customization

Organizations should calibrate weights based on priorities:

| Priority | Suggested Weights |
|---|---|
| **Safety-Critical** (healthcare, finance) | Reliability=0.35, Alignment=0.30, Autonomy=0.15, Efficiency=0.10, Adaptability=0.10 |
| **Speed-Critical** (startup, MVP) | Efficiency=0.25, Autonomy=0.25, Adaptability=0.20, Reliability=0.20, Alignment=0.10 |
| **Quality-Critical** (enterprise SaaS) | Alignment=0.30, Reliability=0.25, Autonomy=0.20, Efficiency=0.15, Adaptability=0.10 |
| **Innovation-Critical** (R&D) | Adaptability=0.30, Autonomy=0.25, Alignment=0.20, Efficiency=0.15, Reliability=0.10 |

---

*AQI is computed and tracked automatically by the AGARWAL metrics infrastructure.*
