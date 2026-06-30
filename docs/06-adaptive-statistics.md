# Layer A: Adaptive Statistics & Evaluation

## Overview

Replace intuition-driven project management with rigorous statistical methods. This layer brings Bayesian estimation, causal inference, information theory, and advanced evaluation frameworks to measure what actually matters — with uncertainty quantified, not hidden.

---

## Key Concepts

### 1. AADV-Next™ (AI-Adjusted Delivery Velocity)

Traditional velocity metrics break down when AI generates 41%+ of code. AADV-Next accounts for AI contribution quality, not just quantity.

#### Formula
```
AADV-Next = Base_Velocity × AI_Amplification × (1 - Rework_Penalty)

Where:
  Base_Velocity = Σ(completed_story_points) / sprint_duration
  
  AI_Amplification = 1 + (α × AI_Contribution_Ratio × Quality_Weight)
    α = calibration factor (org-specific, typically 0.3-0.7)
    AI_Contribution_Ratio = AI_generated_LOC / total_LOC
    Quality_Weight = (1 - AI_defect_rate) × test_pass_rate
    
  Rework_Penalty = β × (AI_churn_rate × severity_factor)
    β = rework sensitivity (0.1-0.5)
    AI_churn_rate = AI_code_modified_within_sprint / AI_code_generated
    severity_factor = weighted_severity_of_rework_items

Report as: Posterior distribution with 90% credible interval
Example: "Sprint velocity: 42 points [38, 47] 90% CI, AI amplification: 1.3x"
```

#### Why Not Traditional Velocity?
| Problem | Traditional | AADV-Next |
|---|---|---|
| AI inflates story points | Counts all points equally | Weights by quality and persistence |
| Rework hidden | Only measures completion | Penalizes code churn |
| Uncertainty ignored | Single point estimate | Full posterior distribution |
| AI contribution unclear | No attribution | Explicit AI vs human tracking |
| Cross-team comparison | Apples to oranges | Normalized by team calibration |

### 2. Bayesian Delivery Estimation

#### From Point Estimates to Distributions
```
Traditional: "This epic will take 5 sprints"
Bayesian:    "This epic completes in 4-7 sprints (90% credible interval),
              with 5.2 as the posterior mean, given historical team data
              and current sprint evidence"

Prior:      Team's historical velocity distribution
Likelihood: Current sprint evidence (tasks completed, blockers, etc.)
Posterior:  Updated estimate combining prior knowledge + current data
```

#### Sequential Bayesian Updating
```python
# Pseudocode for daily estimate refinement
class BayesianSprintEstimator:
    def __init__(self, team_history):
        # Prior: Based on team's historical performance
        self.prior = fit_distribution(team_history)  # e.g., LogNormal
        
    def update(self, daily_evidence):
        """Update estimate with each day's progress"""
        # Evidence: tasks completed, blockers encountered, etc.
        likelihood = compute_likelihood(daily_evidence)
        
        # Posterior = Prior × Likelihood (normalized)
        self.posterior = self.prior * likelihood
        self.posterior.normalize()
        
        # Report
        return {
            "mean": self.posterior.mean(),
            "median": self.posterior.median(),
            "ci_90": self.posterior.credible_interval(0.90),
            "p_on_time": self.posterior.cdf(deadline),
            "risk_level": classify_risk(self.posterior)
        }
    
    def monte_carlo_simulation(self, n_simulations=10000):
        """Simulate possible outcomes"""
        return [self.simulate_sprint() for _ in range(n_simulations)]
```

#### Hierarchical Bayesian Models for Multi-Team
```
Organization-level parameters (hyperpriors)
    │
    ├── Team A parameters (partial pooling)
    ├── Team B parameters (partial pooling)  
    └── Team C parameters (partial pooling)

Benefits:
• Small teams borrow strength from organization-wide data
• Teams with more data contribute more to shared knowledge
• Natural handling of team heterogeneity
• Automatic shrinkage prevents overfitting to small samples
```

### 3. Causal Inference for AI Impact

#### The Fundamental Problem
"Did AI actually improve our delivery, or would we have improved anyway?"

Correlation ≠ Causation. We need causal methods.

#### Method 1: Difference-in-Differences (DiD)
```
                    Before AI    After AI    Difference
AI Teams:             V₁           V₂         ΔV_AI = V₂ - V₁
Control Teams:        C₁           C₂         ΔV_Control = C₂ - C₁

Causal Effect of AI = ΔV_AI - ΔV_Control

Assumptions: Parallel trends (both groups would have evolved similarly without AI)
```

#### Method 2: Instrumental Variables
When you can't randomize AI adoption, find an "instrument" — something that affects AI adoption but doesn't directly affect velocity.

Example: Team proximity to AI champion (affects adoption) → AI usage → Velocity

#### Method 3: Regression Discontinuity
If there's a threshold for AI adoption (e.g., teams >5 people get AI tools):
```
Compare teams just above threshold (got AI) vs just below (didn't get AI)
Local treatment effect ≈ causal effect
```

#### Method 4: Synthetic Control
```
Construct "synthetic team" = weighted combination of control teams
that matches treated team's pre-AI characteristics.
Compare real team post-AI vs synthetic team post-AI.
```

### 4. Information-Theoretic Metrics

#### Shannon Entropy of Backlogs
```
H(Backlog) = -Σ p(category) × log₂(p(category))

High entropy = diverse, uncertain backlog (many different types of work)
Low entropy = focused, predictable backlog (concentrated work types)

Application: Track entropy over time to detect planning disorder
Alert when H(Backlog) increases >20% sprint-over-sprint
```

#### Mutual Information Between Components
```
I(X; Y) = H(X) + H(Y) - H(X, Y)

High I(X; Y) = components X and Y are highly coupled
Low I(X; Y) = components are independent

Application: Detect hidden coupling between services
Inform architecture decisions (what to decouple)
```

#### KL Divergence for Distribution Shift
```
D_KL(P || Q) = Σ P(x) × log(P(x) / Q(x))

P = expected distribution (planned)
Q = actual distribution (observed)

Application: Detect when actual delivery deviates from plan
Alert when D_KL > threshold (plan is no longer valid)
```

#### Fisher Information for Estimation Precision
```
I(θ) = -E[∂²log f(X|θ) / ∂θ²]

High Fisher Info = data is very informative about parameter
Low Fisher Info = need more data before estimating with confidence

Application: Determine minimum sample size for reliable velocity estimates
Know when you have "enough sprints" to trust estimates
```

### 5. Agent Quality Index (AQI)

#### Composite Metric
```
AQI = w₁×Autonomy + w₂×Reliability + w₃×Alignment + w₄×Efficiency + w₅×Adaptability

Default weights: w₁=0.20, w₂=0.25, w₃=0.25, w₄=0.15, w₅=0.15
```

#### Component Definitions

**Autonomy (0-100)**
```
Autonomy = (tasks_completed_without_human / total_tasks) × 100
Adjusted for task complexity weighting
```

**Reliability (0-100)**
```
Reliability = (1 - weighted_failure_rate) × 100
weighted_failure_rate = Σ(failure_count × severity_weight) / total_executions
Severity weights: critical=1.0, high=0.7, medium=0.3, low=0.1
```

**Alignment (0-100)**
```
Alignment = cosine_similarity(agent_output_embedding, gold_standard_embedding) × 100
Measured via:
• Automated evaluation against human-validated samples
• Reward model scoring
• A/B testing against human performance
```

**Efficiency (0-100)**
```
Efficiency = normalize(value_delivered / (compute_cost + time_cost))
value_delivered = story_points_completed × quality_multiplier
compute_cost = tokens_consumed × price_per_token + GPU_hours × price_per_hour
time_cost = wall_clock_time × opportunity_cost_per_hour
```

**Adaptability (0-100)**
```
Adaptability = performance_under_shift / performance_baseline × 100
Measured by:
• Performance on out-of-distribution tasks
• Recovery time after environment changes
• Learning speed on new task types
```

### 6. Statistical Process Control for AI Systems

#### Control Charts for Agent Performance
```
UCL (Upper Control Limit) = μ + 3σ  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
                                     
Mean                       = μ  ────────────────────────────
                                     
LCL (Lower Control Limit) = μ - 3σ  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─

Rules for "out of control":
• 1 point beyond 3σ
• 9 consecutive points on same side of mean
• 6 consecutive points trending same direction
• 2 out of 3 consecutive points beyond 2σ
```

#### A/B Testing for Agent Improvements
```
Hypothesis: New agent version improves code quality
Design: 
  • Control: Current agent v2.1
  • Treatment: New agent v2.2
  • Metric: Code review score (0-100)
  • Power: 80%
  • Significance: α = 0.05
  • MDE (Minimum Detectable Effect): 3 points
  
Sample size needed: n = 2×(z_α/2 + z_β)² × σ² / δ²
Duration: Based on task throughput
```

### 7. Evaluation Frameworks for LLM-Based Systems

#### LLM-as-Judge Evaluation
```
┌─────────────────────────────────────────────────┐
│         EVALUATION PIPELINE                      │
├─────────────────────────────────────────────────┤
│                                                  │
│  Agent Output ──► LLM Judge ──► Score (1-5)     │
│                      │                           │
│                 Calibration Set                   │
│              (Human-scored samples)              │
│                                                  │
│  Checks:                                        │
│  • Inter-rater reliability (Cohen's κ > 0.7)    │
│  • Position bias correction                     │
│  • Self-bias detection                          │
│  • Calibration via human agreement rate         │
│                                                  │
└─────────────────────────────────────────────────┘
```

#### Evaluation Dimensions
| Dimension | What It Measures | Method |
|---|---|---|
| Correctness | Output factually/logically correct | Ground truth comparison |
| Completeness | All requirements addressed | Checklist evaluation |
| Coherence | Logical flow and consistency | LLM-judge + human sample |
| Harmlessness | No dangerous/biased content | Safety classifier |
| Helpfulness | Actually useful to the user | User satisfaction survey |
| Efficiency | Tokens/time relative to output quality | Cost-quality ratio |

---

## Implementation Checklist

- [ ] Implement AADV-Next metric with Bayesian estimation
- [ ] Set up sequential updating infrastructure (daily estimate refinement)
- [ ] Design causal inference study for AI impact measurement
- [ ] Deploy statistical process control charts for agent monitoring
- [ ] Implement AQI scoring for all production agents
- [ ] Create evaluation pipeline with LLM-judge + human calibration
- [ ] Build metrics dashboard with confidence intervals (not point estimates)
- [ ] Establish quarterly causal analysis cadence

---

*Next: [07-lifecycle-continuum.md](./07-lifecycle-continuum.md)*
