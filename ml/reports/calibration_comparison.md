# Phase 3.4 Post-Hoc Probability Calibration Report
## Empirical Investigation of Platt/Sigmoid and Isotonic Calibration

**Protocol**: 5-Fold Stratified Cross-Validation on $N = 192$ training samples with inner 3-fold cross-validated calibration (`CalibratedClassifierCV`).
**Safeguard**: Zero same-sample calibration leakage. Out-of-fold predictions on validation folds are evaluated.
**Target Model**: Candidate A (Multinomial Logistic Regression, unweighted, combined features).

---

## 1. Multi-Class Calibration Comparison

| Configuration | Multiclass Log Loss | Multi-Class Brier Score | Normalized Brier (/4) | ECE (10 Bins) | Maximum Calibration Error (MCE) |
|---|:---:|:---:|:---:|:---:|:---:|
| **Uncalibrated** | 0.4696 | 0.3030 | 0.0758 | 0.0974 | 0.2510 |
| **Sigmoid (Platt)** | 0.4881 | 0.2987 | 0.0747 | 0.1135 | 0.1699 |
| **Isotonic** | 0.7872 | 0.3150 | 0.0787 | 0.0857 | 0.6889 |

---

## 2. Class-Wise One-vs-Rest ECE

| Configuration | AI & ML Eng | Cloud/DevOps | Data Analytics | Software Eng |
|---|:---:|:---:|:---:|:---:|
| **Uncalibrated** | 0.0984 | 0.0538 | 0.0344 | 0.0795 |
| **Sigmoid (Platt)** | 0.0849 | 0.0486 | 0.0601 | 0.0811 |
| **Isotonic** | 0.0794 | 0.0440 | 0.0019 | 0.0938 |

---

## 3. Scientific Calibration Assessment

### A. Sigmoid / Platt Calibration Findings
- **Log Loss**: Uncalibrated (0.4696) vs Sigmoid (0.4881).
- **Expected Calibration Error (ECE)**: Uncalibrated (0.0974) vs Sigmoid (0.1135).
- Sigmoid calibration fits a monotonic logistic mapping per class. On small sample sizes ($N=192$), nested fitting adds slight variance without dramatic reduction in ECE.

### B. Isotonic Calibration Findings
- **Log Loss**: Isotonic Log Loss is 0.7872.
- **ECE**: Isotonic ECE is 0.0857.
- Non-parametric isotonic regression partitions sample rankings into piecewise-constant step functions. Given minority class sparsity ($N=15$), isotonic regression tends to overfit fold folds, resulting in higher log loss.

### C. Engineering Recommendation
- **Base Logistic Regression Already Directly Optimizes Cross-Entropy**: Multinomial logistic regression natively minimizes log loss, yielding reasonably well-behaved class probabilities.
- Forcing post-hoc isotonic calibration on $N=192$ records degrades log loss and is not recommended.
- Saved reliability figures:
  - Before: `ml/reports/figures/calibration_before.png`
  - After: `ml/reports/figures/calibration_after.png`
