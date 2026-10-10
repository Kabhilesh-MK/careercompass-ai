# Phase 3.4 / 3.4.1 Decision Policy & Probability Threshold Analysis
## Investigation of Decision Rules for Minority Class (Cloud, DevOps & Systems Engineering)

**Selected Model Family**: Candidate H — Random Forest (`n_estimators=300`, `class_weight=None`, skills-only 29 features).
**Protocol**: Evaluated strictly on Out-of-Fold (OOF) predicted probabilities from 5-fold cross-validation on Primary Training Data ($N = 192$).
**Safeguard**: Zero holdout data was used for threshold evaluation or policy selection.

### Pre-Declared Decision Rule
$$\hat{y}(\mathbf{x}) = \begin{cases} \text{Cloud, DevOps \& Systems Engineering} & \text{if } P(\text{Cloud} \mid \mathbf{x}) \ge \tau \\ \operatorname{argmax}_{c \neq \text{Cloud}} P(c \mid \mathbf{x}) & \text{otherwise} \end{cases}$$

---

## 1. Threshold Evaluation Grid Results (Candidate H OOF Probabilities)

| Threshold ($\tau$) | Cloud Recall | Cloud Precision | Cloud F1 | SDE Recall | Macro F1 | Overall Accuracy | Cloud TP (out of 15) | Cloud False Positives |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| *Argmax Baseline* | *0.0000* | *0.0000* | *0.0000* | *0.7015* | *0.6263* | *0.7865* | 0/15 | 0 |
| **0.10** | 1.0000 | 0.3261 | 0.4918 | 0.2388 | 0.6650 | 0.7031 | 15/15 | 31 |
| **0.15** | 1.0000 | 0.3261 | 0.4918 | 0.2388 | 0.6650 | 0.7031 | 15/15 | 31 |
| **0.20** | 1.0000 | 0.3261 | 0.4918 | 0.2388 | 0.6650 | 0.7031 | 15/15 | 31 |
| **0.25** | 1.0000 | 0.3261 | 0.4918 | 0.2388 | 0.6650 | 0.7031 | 15/15 | 31 |
| **0.30** | 0.8000 | 0.3077 | 0.4444 | 0.2985 | 0.6675 | 0.7083 | 12/15 | 27 |
| **0.35** | 0.2000 | 0.2143 | 0.2069 | 0.5373 | 0.6527 | 0.7448 | 3/15 | 11 |
| **0.40** | 0.0000 | 0.0000 | 0.0000 | 0.7015 | 0.6263 | 0.7865 | 0/15 | 0 |

---

## 2. In-Depth Operational Trade-Off Analysis

### A. Aggressive Thresholds ($\tau = 0.10 - 0.25$)
- **Minority Gain**: Recovers $100.0\%$ ($15/15$) of Cloud/DevOps samples because all 15 true Cloud samples exhibit $P(\text{Cloud}) \ge 0.2948$ under Candidate H.
- **Collateral Impact**: Incurs 31 false positives (non-cloud candidates misclassified as Cloud).
- Software Engineering recall drops from $70.15\%$ down to $23.88\%$.

### B. Intermediate Thresholds ($\tau = 0.30$)
- At $\tau = 0.30$, Cloud recall is **$80.0\%$** ($12/15$) with 27 false positives.
- SDE recall is $29.85\%$, Macro F1 reaches $0.6675$, and Overall Accuracy is $70.83\%$.

### C. Conservative Thresholds ($\tau = 0.35 - 0.40$)
- At $\tau = 0.35$, Cloud recall is $20.0\%$ ($3/15$) with only 11 false positives, while SDE recall rebounds to $53.73\%$.
- At $\tau = 0.40$, true Cloud recall is $0.0\%$ ($0/15$) because Candidate H's maximum out-of-fold probability for Cloud is $0.3663$. Argmax defaults are fully restored.

---

## 3. Scientific Recommendation & Policy Transparency

1. **Status of $\tau = 0.25$ / $\tau = 0.30$**: Thresholds such as $\tau = 0.25$ or $\tau = 0.30$ are strictly **OOF threshold candidates requiring further validation**. They are NOT declared as final production thresholds.
2. **Trade-Off Governance**: No single threshold is mathematically optimal. The choice of $\tau$ governs the explicit policy trade-off between minority sensitivity and false steering away from Software Engineering.
3. **Zero Holdout Contamination**: This threshold exploration was conducted strictly on training OOF probabilities. Holdout evaluation remained strictly under standard argmax.
