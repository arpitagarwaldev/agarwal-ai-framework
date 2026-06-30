# 🔬 Quantum Feasibility Assessment Template

## Use this template to evaluate whether a workload is a candidate for quantum acceleration.

---

## Workload Identification

| Field | Value |
|---|---|
| **Workload Name** | |
| **Current System** | |
| **Owner** | |
| **Date** | |
| **Assessor** | |

---

## Problem Characterization

### Problem Description
*Describe the computational problem in 2-3 sentences:*



### Problem Classification
- [ ] Optimization (find best solution from many candidates)
- [ ] Simulation (model complex system dynamics)
- [ ] Sampling (generate samples from complex distributions)
- [ ] Search (find needle in exponential haystack)
- [ ] Factoring/Cryptanalysis
- [ ] Machine Learning (training or inference)
- [ ] Other: _______________

### Scale Parameters
| Parameter | Value |
|---|---|
| Input size (N) | |
| Decision variables | |
| Constraints | |
| Solution space size | |
| Classical complexity | O(___) |
| Current runtime | ___ seconds/minutes/hours |
| Acceptable runtime target | |

---

## Quantum Advantage Assessment

### Criterion 1: Combinatorial Explosion
*Does the search space grow exponentially with input size?*

- [ ] YES — Problem is NP-hard or has exponential state space
- [ ] PARTIAL — Polynomial but very high degree
- [ ] NO — Linear or low-polynomial complexity

**Evidence:** 

### Criterion 2: Known Quantum Speedup
*Is there a quantum algorithm with proven speedup for this problem class?*

| Algorithm | Speedup | Applicability |
|---|---|---|
| Grover's Search | Quadratic (√N) | Unstructured search |
| Shor's Algorithm | Exponential | Integer factoring |
| QAOA | Heuristic | Combinatorial optimization |
| VQE | Heuristic | Ground-state energy |
| Quantum Walk | Polynomial | Graph traversal |
| HHL Algorithm | Exponential (caveats) | Linear systems |
| Quantum Monte Carlo | Quadratic | Sampling/integration |
| Quantum Kernel | Potential exponential | Feature mapping |

**Selected algorithm:** 
**Expected speedup:** 
**Caveats/Limitations:**

### Criterion 3: Data Encoding Feasibility
*Can classical data be efficiently loaded into quantum states?*

- [ ] Amplitude encoding (N values in log₂(N) qubits — efficient but complex)
- [ ] Angle encoding (1 value per qubit — simple but qubit-hungry)
- [ ] Basis encoding (binary representation — straightforward)
- [ ] Problem is naturally quantum (simulation of quantum systems)

**Encoding overhead estimate:** ___ qubits required
**Encoding circuit depth:** ___

### Criterion 4: Noise Tolerance
*Can the algorithm produce useful results with current quantum error rates?*

| Error Source | Current Rate | Algorithm Tolerance | Compatible? |
|---|---|---|---|
| Gate error | ~0.1-1% | | Yes / No / Marginal |
| Readout error | ~1-5% | | Yes / No / Marginal |
| Decoherence time | ~100μs | | Yes / No / Marginal |

- [ ] Algorithm is noise-tolerant (variational, short-depth)
- [ ] Requires error correction (need logical qubits)
- [ ] Unknown — needs simulation study

### Criterion 5: Classical Overhead Assessment
*Does quantum-classical communication overhead negate the speedup?*

| Factor | Estimate |
|---|---|
| Classical pre-processing time | |
| Quantum circuit execution time | |
| Number of quantum shots needed | |
| Classical post-processing time | |
| Total hybrid time | |
| Classical-only time (baseline) | |

**Net benefit:** [ ] Positive  [ ] Neutral  [ ] Negative  [ ] Unknown

---

## Feasibility Verdict

### Scoring
| Criterion | Score (0-5) | Weight | Weighted |
|---|---|---|---|
| Combinatorial Explosion | ___ | 0.25 | ___ |
| Known Quantum Speedup | ___ | 0.30 | ___ |
| Data Encoding Feasibility | ___ | 0.15 | ___ |
| Noise Tolerance | ___ | 0.20 | ___ |
| Classical Overhead | ___ | 0.10 | ___ |
| **TOTAL** | | | **___/5.00** |

### Verdict
| Score | Recommendation |
|---|---|
| 4.0-5.0 | **Strong Candidate** — Proceed to proof-of-concept |
| 3.0-3.9 | **Promising** — Conduct simulation study |
| 2.0-2.9 | **Monitor** — Revisit as hardware improves |
| 1.0-1.9 | **Unlikely** — Classical approaches preferred |
| 0-0.9 | **Not Suitable** — No quantum advantage expected |

**This workload's verdict:** 

---

## Recommended Next Steps

### If Strong Candidate / Promising:
- [ ] Implement on quantum simulator (Qiskit Aer, Cirq, PennyLane)
- [ ] Benchmark against classical solution
- [ ] Estimate qubit requirements at production scale
- [ ] Identify quantum hardware provider(s)
- [ ] Design hybrid architecture with classical fallback
- [ ] Define success criteria for quantum advantage proof

### If Monitor:
- [ ] Document current findings
- [ ] Set calendar reminder to reassess in 6 months
- [ ] Track relevant quantum hardware milestones
- [ ] Maintain classical optimization improvements

### If Not Suitable:
- [ ] Document reasoning for future reference
- [ ] Consider quantum-inspired classical algorithms as alternative
- [ ] Focus quantum investment on other workloads

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Hardware insufficient for problem size | | | Classical fallback |
| Algorithm doesn't converge | | | Hybrid approach, classical optimizer |
| Cost exceeds classical alternative | | | Budget caps, cost monitoring |
| Vendor lock-in | | | Multi-provider abstraction |
| Technology pivots make approach obsolete | | | Modular architecture |

---

## References

- IBM Quantum Roadmap: https://www.ibm.com/quantum/roadmap
- Google Quantum AI: https://quantumai.google/
- Quantum Algorithm Zoo: https://quantumalgorithmzoo.org/
- PennyLane Demos: https://pennylane.ai/qml/demonstrations/
- Qiskit Textbook: https://learning.quantum.ibm.com/

---

*Template version: 1.0 | Part of the AGARWAL Framework™*
