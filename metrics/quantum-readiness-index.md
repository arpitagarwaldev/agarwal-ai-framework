# 🔬 Quantum Readiness Index (QRI)

## Definition

The Quantum Readiness Index measures an organization's preparedness to leverage quantum-classical hybrid computing. It assesses technical infrastructure, team capability, and strategic positioning across six dimensions.

---

## Formula

```
QRI = Σ(wᵢ × sᵢ) 

Where:
  s₁ = Quantum Literacy Score          × w₁ = 0.15
  s₂ = Algorithm Suitability Score     × w₂ = 0.25
  s₃ = Crypto-Agility Score            × w₃ = 0.20
  s₄ = Infrastructure Abstraction      × w₄ = 0.20
  s₅ = Vendor Evaluation Score         × w₅ = 0.10
  s₆ = Experimental Pipeline Score     × w₆ = 0.10

Scale: 0-100
```

---

## Dimension Details

### 1. Quantum Literacy (w=0.15)

**What it measures:** Team's knowledge and readiness to work with quantum concepts.

| Score Range | Criteria |
|---|---|
| 0-20 | No quantum knowledge in team |
| 21-40 | Awareness training completed; team understands basics (superposition, entanglement) |
| 41-60 | Intermediate: team can read quantum circuits, understand VQC, QAOA |
| 61-80 | Advanced: team can design hybrid algorithms, evaluate quantum advantage |
| 81-100 | Expert: team publishes research, contributes to quantum open source |

**Assessment Methods:**
- Quantum knowledge quiz (quarterly)
- Certification tracking (IBM Quantum, Xanadu PennyLane, etc.)
- Hands-on lab completion rate
- Internal quantum study group activity

### 2. Algorithm Suitability (w=0.25)

**What it measures:** How many of the organization's workloads could benefit from quantum processing.

| Score Range | Criteria |
|---|---|
| 0-20 | No workloads identified with quantum potential |
| 21-40 | 1-3 candidate workloads identified, no analysis done |
| 41-60 | Feasibility studies completed, quantum advantage estimated |
| 61-80 | Proof-of-concept implementations running on simulators |
| 81-100 | Benchmarks show quantum advantage on real hardware for ≥1 workload |

**Candidate Workload Categories:**
```
High Quantum Potential:
├── Combinatorial Optimization (scheduling, routing, portfolio)
├── Quantum Chemistry Simulation (drug discovery, materials)
├── Cryptographic Operations (key generation, random numbers)
├── Machine Learning (kernel methods, sampling, optimization)
└── Financial Modeling (Monte Carlo, risk analysis)

Medium Quantum Potential:
├── Supply Chain Optimization
├── Natural Language Processing (via quantum feature maps)
├── Anomaly Detection (quantum sampling)
└── Graph Problems (quantum walk algorithms)

Low/No Quantum Potential (currently):
├── Simple CRUD operations
├── Basic data transformation
├── Standard web applications
└── Simple classification (classical is sufficient)
```

### 3. Crypto-Agility (w=0.20)

**What it measures:** Readiness to withstand quantum attacks on cryptographic systems.

| Score Range | Criteria |
|---|---|
| 0-20 | No cryptographic inventory; unaware of quantum threat |
| 21-40 | Crypto inventory started; threat assessment completed |
| 41-60 | PQC migration plan exists; hybrid crypto deployed in test |
| 61-80 | PQC deployed in production for critical systems; crypto-agile architecture |
| 81-100 | Full PQC migration complete; crypto-agile; quantum-safe certificates |

**Assessment Checklist:**
- [ ] Complete cryptographic asset inventory
- [ ] Classify data by confidentiality timeline (>10yr = urgent)
- [ ] Evaluate NIST PQC standards (ML-KEM, ML-DSA, SLH-DSA)
- [ ] Deploy hybrid encryption (classical + PQC) in test
- [ ] Implement crypto-agility layer (swap algorithms without code changes)
- [ ] Migrate production systems to PQC
- [ ] Establish quantum-safe certificate chain
- [ ] Regular PQC interoperability testing

### 4. Infrastructure Abstraction (w=0.20)

**What it measures:** How well the technical architecture supports quantum-classical hybrid execution.

| Score Range | Criteria |
|---|---|
| 0-20 | No abstraction; quantum = completely separate initiative |
| 21-40 | Quantum SDKs installed; team can run circuits locally |
| 41-60 | Abstraction layer designed; quantum callable from classical pipelines |
| 61-80 | Hybrid execution framework deployed; quantum jobs via API |
| 81-100 | Seamless quantum-classical; auto-routing to optimal backend |

**Architecture Target:**
```
Application Code (unchanged)
         │
    ┌────▼────┐
    │Abstraction│ ← Decides: classical or quantum?
    │  Layer    │
    └────┬────┘
    ┌────┼────────────┐
    ▼    ▼            ▼
Classical  Quantum     Quantum
 Backend   Simulator   Hardware
 (GPU/CPU) (Aer,       (IBM, IonQ,
            Pennylane)  Quantinuum)
```

### 5. Vendor Evaluation (w=0.10)

**What it measures:** Breadth and depth of quantum hardware/service evaluation.

| Score Range | Criteria |
|---|---|
| 0-20 | No vendor evaluation |
| 21-40 | 1-2 vendors researched (documentation only) |
| 41-60 | Accounts provisioned; basic circuits executed on ≥2 platforms |
| 61-80 | Benchmark suite run across 3+ platforms; cost/performance comparison |
| 81-100 | Strategic partnership established; dedicated quantum resources |

### 6. Experimental Pipeline (w=0.10)

**What it measures:** Active experimentation and learning velocity.

| Score Range | Criteria |
|---|---|
| 0-20 | No experiments |
| 21-40 | Ad-hoc experiments; results not documented |
| 41-60 | Regular experiments (monthly); results shared internally |
| 61-80 | Experiment pipeline automated; A/B quantum vs classical |
| 81-100 | Continuous quantum experimentation; results inform production decisions |

---

## QRI Maturity Levels

| QRI Score | Level | Label | Meaning |
|---|---|---|---|
| 0-20 | 1 | **Unaware** | Quantum not on radar |
| 21-40 | 2 | **Aware** | Team educated, planning started |
| 41-60 | 3 | **Prepared** | Infrastructure ready, experiments running |
| 61-80 | 4 | **Hybrid** | Production quantum-classical workloads |
| 81-100 | 5 | **Quantum-Native** | Quantum advantage achieved, integrated |

---

## Assessment Template

### Quarterly QRI Assessment

**Date:** _______________  
**Assessed by:** _______________  
**Team/Organization:** _______________

| Dimension | Score (0-100) | Evidence | Priority Actions |
|---|---|---|---|
| Quantum Literacy | ___ | | |
| Algorithm Suitability | ___ | | |
| Crypto-Agility | ___ | | |
| Infrastructure Abstraction | ___ | | |
| Vendor Evaluation | ___ | | |
| Experimental Pipeline | ___ | | |

**Calculated QRI:** ___  
**Previous QRI:** ___  
**Trend:** ↑/↓/→  
**Target QRI (next quarter):** ___

---

## Industry Benchmarks (2026)

| Industry | Typical QRI | Leaders |
|---|---|---|
| Financial Services | 35-55 | JPMorgan (65), Goldman (60) |
| Pharmaceutical | 40-60 | Roche (70), Pfizer (55) |
| Technology | 30-50 | Google (85), IBM (90), Microsoft (75) |
| Manufacturing | 15-30 | BMW (45), Airbus (50) |
| Government/Defense | 25-45 | NSA (80), DARPA (85) |
| Healthcare | 20-35 | Mayo Clinic (40), Cleveland (35) |
| Energy | 20-40 | ExxonMobil (45), BP (40) |

---

## Action Plan by Score Range

### QRI 0-20: Getting Started
1. Executive briefing on quantum computing relevance
2. Assign quantum champion/working group
3. Start crypto inventory (most urgent action)
4. Team completes introductory quantum course

### QRI 21-40: Building Foundations
1. Complete PQC threat assessment and migration plan
2. Identify top 3 quantum-suitable workloads
3. Set up quantum development environment
4. Run first experiments on cloud quantum services
5. Establish quantum budget allocation

### QRI 41-60: Accelerating
1. Deploy abstraction layer for quantum-classical hybrid
2. Run feasibility studies on identified workloads
3. Begin PQC production migration
4. Establish vendor relationships
5. Publish internal quantum use case catalog

### QRI 61-80: Leading
1. Deploy production hybrid workloads
2. Achieve quantum advantage on ≥1 workload
3. Establish quantum center of excellence
4. Contribute to open-source quantum projects
5. Explore quantum networking/communication

### QRI 81-100: Pioneering
1. Expand quantum advantage to additional workloads
2. Research fault-tolerant quantum algorithms
3. Evaluate quantum hardware co-design opportunities
4. Lead industry quantum working groups
5. Explore quantum-native application architectures

---

*QRI is assessed quarterly and reported to leadership alongside AQI and TMS.*
