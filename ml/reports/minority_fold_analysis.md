# Experiment E: Per-Fold Minority Analysis Report (Phase 3.3)
## Detailed Fold-by-Fold Diagnostic for `Cloud, DevOps & Systems Engineering`

**Context**: The minority class comprises only $N = 15$ training samples (7.8% of primary training data).
**Protocol**: 5-Fold Stratified Cross-Validation produces exactly **$3$ validation samples per fold** ($15 / 5 = 3$).
**Methodological Caveat**: Because sample sizes are tiny ($N = 3$ per fold), a single sample misclassification changes fold recall by $33.3\%$.
**Strict Limitation Disclosure**: These fold-by-fold numbers are diagnostic rather than statistically definitive. They provide insight into fold variance under severe data scarcity.

---

## 1. Out-of-Fold Minority Summary (N = 15 Aggregated Across Folds)

| ID | Model | Class Weight | Total Support | TP | FP | FN | OOF Precision | OOF Recall | OOF F1 | Fold Mean Recall ± SD | Fold Mean F1 ± SD |
|:---:|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A1** | Logistic Regression | `None` | 15 | 0 | 2 | 15 | 0.0000 | 0.0000 | 0.0000 | 0.0000 ± 0.0000 | 0.0000 ± 0.0000 |
| **A2** | Logistic Regression | `balanced` | 15 | 11 | 22 | 4 | 0.3333 | 0.7333 | 0.4583 | 0.7333 ± 0.2494 | 0.4846 ± 0.1749 |
| **A3** | Random Forest | `None` | 15 | 0 | 9 | 15 | 0.0000 | 0.0000 | 0.0000 | 0.0000 ± 0.0000 | 0.0000 ± 0.0000 |
| **A4** | Random Forest | `balanced` | 15 | 11 | 22 | 4 | 0.3333 | 0.7333 | 0.4583 | 0.7333 ± 0.2494 | 0.4846 ± 0.1749 |

---

## 2. Detailed Fold-by-Fold Metrics Breakdown

### A1: Logistic Regression (Unweighted)

| Fold | Validation Support | True Positives (TP) | False Positives (FP) | False Negatives (FN) | Precision | Recall | F1-Score |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Fold 1 | 3 | 0/3 | 0 | 3 | 0.0000 | 0.0000 | 0.0000 |
| Fold 2 | 3 | 0/3 | 0 | 3 | 0.0000 | 0.0000 | 0.0000 |
| Fold 3 | 3 | 0/3 | 0 | 3 | 0.0000 | 0.0000 | 0.0000 |
| Fold 4 | 3 | 0/3 | 2 | 3 | 0.0000 | 0.0000 | 0.0000 |
| Fold 5 | 3 | 0/3 | 0 | 3 | 0.0000 | 0.0000 | 0.0000 |

### A2: Logistic Regression (Balanced)

| Fold | Validation Support | True Positives (TP) | False Positives (FP) | False Negatives (FN) | Precision | Recall | F1-Score |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Fold 1 | 3 | 1/3 | 8 | 2 | 0.1111 | 0.3333 | 0.1667 |
| Fold 2 | 3 | 3/3 | 4 | 0 | 0.4286 | 1.0000 | 0.6000 |
| Fold 3 | 3 | 2/3 | 1 | 1 | 0.6667 | 0.6667 | 0.6667 |
| Fold 4 | 3 | 2/3 | 4 | 1 | 0.3333 | 0.6667 | 0.4444 |
| Fold 5 | 3 | 3/3 | 5 | 0 | 0.3750 | 1.0000 | 0.5455 |

### A3: Random Forest (Unweighted)

| Fold | Validation Support | True Positives (TP) | False Positives (FP) | False Negatives (FN) | Precision | Recall | F1-Score |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Fold 1 | 3 | 0/3 | 5 | 3 | 0.0000 | 0.0000 | 0.0000 |
| Fold 2 | 3 | 0/3 | 0 | 3 | 0.0000 | 0.0000 | 0.0000 |
| Fold 3 | 3 | 0/3 | 0 | 3 | 0.0000 | 0.0000 | 0.0000 |
| Fold 4 | 3 | 0/3 | 3 | 3 | 0.0000 | 0.0000 | 0.0000 |
| Fold 5 | 3 | 0/3 | 1 | 3 | 0.0000 | 0.0000 | 0.0000 |

### A4: Random Forest (Balanced)

| Fold | Validation Support | True Positives (TP) | False Positives (FP) | False Negatives (FN) | Precision | Recall | F1-Score |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Fold 1 | 3 | 1/3 | 8 | 2 | 0.1111 | 0.3333 | 0.1667 |
| Fold 2 | 3 | 3/3 | 4 | 0 | 0.4286 | 1.0000 | 0.6000 |
| Fold 3 | 3 | 2/3 | 1 | 1 | 0.6667 | 0.6667 | 0.6667 |
| Fold 4 | 3 | 2/3 | 4 | 1 | 0.3333 | 0.6667 | 0.4444 |
| Fold 5 | 3 | 3/3 | 5 | 0 | 0.3750 | 1.0000 | 0.5455 |

---

## 3. Scientific Interpretation of Minority Fold Dynamics

1. **Unweighted Models Completely Collapse (TP = 0/15 across all folds)**:
   - In both Logistic Regression (`class_weight=None`) and Random Forest (`class_weight=None`), the model predicts 0 true positives across all 5 folds.
   - Because the prior probability is small (7.8%) and the minority class feature profile overlaps with majority BCA students in Software Engineering, the unweighted objective function achieves lower loss by ignoring this class entirely.

2. **Balanced Weighting Consistently Recovers Samples Across Folds**:
   - Logistic Regression Balanced (A2) correctly detects 11 of 15 samples across folds (2 or 3 TP per fold).
   - Random Forest Balanced (A4) also correctly detects 11 of 15 samples across folds.
   - However, this recovery comes at the cost of substantial false positives (FP = 22 for both models across folds), confirming the high precision penalty of global balanced weighting.

3. **Extreme Small-Sample Sensitivity**:
   - With $N = 3$ validation samples per fold, a swing of one correct prediction shifts fold recall from $0.6667$ to $1.0000$ (a 33.3 percentage point jump).
   - Hence, fold standard deviations reflect small-sample discretization noise rather than steady-state population variance.
   - All downstream claims must transparently cite this $N = 15$ constraint.
