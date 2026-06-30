# 🛡️ Governance Audit Template

## AI System Governance Audit Checklist

Use this template for quarterly governance reviews of AI agent systems.

---

## Audit Information

| Field | Value |
|---|---|
| **Audit Date** | |
| **Auditor** | |
| **System/Agent** | |
| **Audit Type** | [ ] Initial  [ ] Quarterly  [ ] Incident-triggered |
| **Previous Audit Score** | |

---

## 1. Explainability (Weight: 25%)

| Check | Status | Evidence | Score (0-100) |
|---|---|---|---|
| Decision audit trail completeness | ☐ Pass / ☐ Fail | | |
| Counterfactual explanations available | ☐ Pass / ☐ Fail | | |
| Human-readable summaries generated | ☐ Pass / ☐ Fail | | |
| Feature attribution (SHAP/LIME) active | ☐ Pass / ☐ Fail | | |
| Reasoning chains logged | ☐ Pass / ☐ Fail | | |

**Explainability Score:** ___ / 100

---

## 2. Compliance (Weight: 30%)

| Regulation | Requirement | Status | Notes |
|---|---|---|---|
| EU AI Act | Risk classification documented | ☐ | |
| EU AI Act | Human oversight mechanisms | ☐ | |
| NIST AI RMF | Map, Measure, Manage, Govern | ☐ | |
| GDPR | Data minimization | ☐ | |
| GDPR | Right to explanation | ☐ | |
| SOC2 | Security controls | ☐ | |
| ISO 42001 | AI management system | ☐ | |

| Check | Status | Evidence | Score (0-100) |
|---|---|---|---|
| Policy violations (last 30 days) | Count: ___ | | |
| Regulatory audit pass rate | ___% | | |
| Data handling compliance | ☐ Pass / ☐ Fail | | |
| Consent management | ☐ Pass / ☐ Fail | | |
| Cross-border data transfer compliance | ☐ Pass / ☐ Fail | | |

**Compliance Score:** ___ / 100

---

## 3. Safety (Weight: 25%)

| Check | Status | Evidence | Score (0-100) |
|---|---|---|---|
| Red line violations (must be 0) | Count: ___ | | |
| Guardrail trigger frequency | ___/week | | |
| Adversarial robustness tests passed | ___% | | |
| Kill switch tested and functional | ☐ Pass / ☐ Fail | | |
| Hallucination rate below threshold | ___% (target: <5%) | | |
| Toxicity filters active | ☐ Pass / ☐ Fail | | |
| PII leakage prevention verified | ☐ Pass / ☐ Fail | | |

**Safety Score:** ___ / 100

---

## 4. Auditability (Weight: 20%)

| Check | Status | Evidence | Score (0-100) |
|---|---|---|---|
| Logging completeness (% of decisions logged) | ___% | | |
| Decisions reproducible from logs | ☐ Pass / ☐ Fail | | |
| Log retention policy followed | ☐ Pass / ☐ Fail | | |
| Model version tracking | ☐ Pass / ☐ Fail | | |
| Data lineage traceable | ☐ Pass / ☐ Fail | | |
| Access controls on logs | ☐ Pass / ☐ Fail | | |

**Auditability Score:** ___ / 100

---

## 5. Fairness & Bias

| Check | Status | Measurement | Threshold |
|---|---|---|---|
| Demographic parity | ☐ Pass / ☐ Fail | ___ | >0.80 |
| Equalized odds | ☐ Pass / ☐ Fail | ___ | >0.80 |
| Individual fairness (Lipschitz) | ☐ Pass / ☐ Fail | ___ | <0.10 |
| Counterfactual fairness | ☐ Pass / ☐ Fail | ___ | >0.90 |
| Protected attribute proxy detection | ☐ None found / ☐ Found | | |

---

## 6. Operational Health

| Metric | Value | Target | Status |
|---|---|---|---|
| Agent uptime | ___% | ≥99.5% | ☐ |
| Mean response time (P95) | ___ms | ≤___ms | ☐ |
| Error rate | ___% | ≤2% | ☐ |
| Cost per decision | $___ | ≤$___ | ☐ |
| Human escalation rate | ___% | ≤15% | ☐ |

---

## Trust Mesh Score Calculation

```
TMS = (Explainability × 0.25) + (Compliance × 0.30) + 
      (Safety × 0.25) + (Auditability × 0.20)
```

| Component | Score | Weight | Weighted |
|---|---|---|---|
| Explainability | ___ | × 0.25 | = ___ |
| Compliance | ___ | × 0.30 | = ___ |
| Safety | ___ | × 0.25 | = ___ |
| Auditability | ___ | × 0.20 | = ___ |
| **TMS TOTAL** | | | **= ___** |

---

## Findings & Actions

### Critical Findings (Require Immediate Action)
| # | Finding | Risk | Owner | Deadline |
|---|---|---|---|---|
| 1 | | | | |

### High Priority Findings
| # | Finding | Risk | Owner | Deadline |
|---|---|---|---|---|
| 1 | | | | |

### Improvement Recommendations
| # | Recommendation | Expected Benefit | Effort |
|---|---|---|---|
| 1 | | | Low / Med / High |

---

## Sign-off

| Role | Name | Date | Signature |
|---|---|---|---|
| Lead Auditor | | | |
| System Owner | | | |
| Governance Lead | | | |
| CISO/DPO (if applicable) | | | |

---

## Next Audit

**Scheduled Date:** _______________  
**Focus Areas:** _______________  
**Carry-forward Items:** _______________

---

*Template version: 1.0 | Part of the AGARWAL Framework™*
