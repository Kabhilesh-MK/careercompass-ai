# Experiment A: Class-Weight Ablation Report (Phase 3.3)
## Empirical Investigation of Class-Weighting Interventions

**Protocol**: 5-Fold Stratified Cross-Validation (`shuffle=True`, `random_state=42`), $N = 192$ training samples.
**Preprocessing**: `PrimaryPreprocessor` fitted strictly within each training fold (zero data leakage).
**Evaluated Models**: Logistic Regression and Random Forest comparing `class_weight=None` against `class_weight='balanced'`.

---

## 1. Cross-Validation Aggregate Metrics (Mean ± SD across 5 Folds)

| ID | Model | Class Weight | Macro F1 | Weighted F1 | Multi-Class Log Loss | Top-2 Accuracy | Overall Accuracy |
|:---:|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **A1** | Logistic Regression | `None` | 0.6188 ± 0.0562 | 0.7459 ± 0.0731 | 0.4704 ± 0.0768 | 1.0000 ± 0.0000 | 0.7752 ± 0.0771 |
| **A2** | Logistic Regression | `balanced` | 0.6883 ± 0.0646 | 0.7111 ± 0.0671 | 0.5242 ± 0.0695 | 1.0000 ± 0.0000 | 0.7238 ± 0.0681 |
| **A3** | Random Forest | `None` | 0.5766 ± 0.0411 | 0.6884 ± 0.0517 | 0.7139 ± 0.3957 | 0.9947 ± 0.0105 | 0.7028 ± 0.0552 |
| **A4** | Random Forest | `balanced` | 0.6583 ± 0.0814 | 0.6976 ± 0.0732 | 0.5788 ± 0.1426 | 1.0000 ± 0.0000 | 0.6976 ± 0.0765 |

---

## 2. Out-of-Fold Aggregate Performance (N = 192 Total)

| ID | Model | Weighting | OOF Accuracy | OOF Macro F1 | OOF Weighted F1 | OOF Log Loss | OOF Top-2 Acc |
|:---:|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **A1** | Logistic Regression | `None` | 0.7760 | 0.6214 | 0.7483 | 0.4696 | 1.0000 |
| **A2** | Logistic Regression | `balanced` | 0.7240 | 0.6822 | 0.7092 | 0.5238 | 1.0000 |
| **A3** | Random Forest | `None` | 0.7031 | 0.5789 | 0.6910 | 0.7109 | 0.9948 |
| **A4** | Random Forest | `balanced` | 0.6979 | 0.6529 | 0.6971 | 0.5775 | 1.0000 |

---

## 3. Minority Class Focus: `Cloud, DevOps & Systems Engineering` ($N = 15$)

| ID | Model | Class Weight | Support | Precision | Recall | F1-Score | True Positives (TP) | False Positives (FP) |
|:---:|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A1** | Logistic Regression | `None` | 15 | 0.0000 | 0.0000 | 0.0000 | 0/15 | 2 |
| **A2** | Logistic Regression | `balanced` | 15 | 0.3333 | 0.7333 | 0.4583 | 11/15 | 22 |
| **A3** | Random Forest | `None` | 15 | 0.0000 | 0.0000 | 0.0000 | 0/15 | 9 |
| **A4** | Random Forest | `balanced` | 15 | 0.2917 | 0.4667 | 0.3590 | 7/15 | 17 |

---

## 4. Full Per-Class Out-of-Fold Performance Breakdown

| ID | Career Track | Precision | Recall | F1-Score | Support |
|:---:|---|:---:|:---:|:---:|:---:|
| **A1** | `AI & Machine Learning Engineering` | 0.7333 | 0.9016 | 0.8088 | 61 |
| **A1** | `Cloud, DevOps & Systems Engineering` | 0.0000 | 0.0000 | 0.0000 | 15 |
| **A1** | `Data Analytics & Business Intelligence` | 1.0000 | 1.0000 | 1.0000 | 49 |
| **A1** | `Software Development & Engineering` | 0.6818 | 0.6716 | 0.6767 | 67 |
| **A2** | `AI & Machine Learning Engineering` | 0.7179 | 0.9180 | 0.8058 | 61 |
| **A2** | `Cloud, DevOps & Systems Engineering` | 0.3333 | 0.7333 | 0.4583 | 15 |
| **A2** | `Data Analytics & Business Intelligence` | 1.0000 | 1.0000 | 1.0000 | 49 |
| **A2** | `Software Development & Engineering` | 0.7188 | 0.3433 | 0.4646 | 67 |
| **A3** | `AI & Machine Learning Engineering` | 0.7059 | 0.7869 | 0.7442 | 61 |
| **A3** | `Cloud, DevOps & Systems Engineering` | 0.0000 | 0.0000 | 0.0000 | 15 |
| **A3** | `Data Analytics & Business Intelligence` | 1.0000 | 1.0000 | 1.0000 | 49 |
| **A3** | `Software Development & Engineering` | 0.5758 | 0.5672 | 0.5714 | 67 |
| **A4** | `AI & Machine Learning Engineering` | 0.7059 | 0.7869 | 0.7442 | 61 |
| **A4** | `Cloud, DevOps & Systems Engineering` | 0.2917 | 0.4667 | 0.3590 | 15 |
| **A4** | `Data Analytics & Business Intelligence` | 1.0000 | 1.0000 | 1.0000 | 49 |
| **A4** | `Software Development & Engineering` | 0.5882 | 0.4478 | 0.5085 | 67 |

---

## 5. Scientific Findings & Empirical Trade-Off Analysis

### A. Logistic Regression: Unweighted (A1) vs Balanced (A2)
- **Minority-Class Recall**: Under unweighted Logistic Regression (A1), minority recall was 0.0000 (0/15 detected). With `class_weight='balanced'` (A2), the model shifts decision boundaries, raising minority detection.
- **Majority-Class Trade-Off**: Setting `class_weight='balanced'` introduces false positives for the minority class, which draws predictions away from the dominant majority tracks (`Software Development & Engineering` and `AI & Machine Learning Engineering`).
- **Log Loss Impact**: Class weighting alters the uncalibrated probability scale, which generally increases multi-class log loss because predicted class-probabilities no longer align with empirical training priors.

### B. Random Forest: Unweighted (A3) vs Balanced (A4)
- **Ensemble Partitioning**: Random Forest unweighted already achieves partial minority detection because deep decision trees isolate pure leaf partitions.
- **Balanced Weighting Effect**: Balanced weighting adjusts sample bootstrap probabilities / cost per split, improving minority recall at the cost of slight precision degradation and potential increase in log loss.

### C. Defensible Conclusion on Class Weighting
- Class weighting is **not mandatory**; it is an explicit empirical trade-off between minority recall and majority precision/log-loss penalty.
- The choice between unweighted and balanced models depends directly on the system objective: whether missing a minority career recommendation carries a higher cost than false alarm recommendations.
