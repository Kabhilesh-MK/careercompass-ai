# Experiment D: Probability Calibration Report (Phase 3.3)
## Formal Out-of-Fold Calibration Evaluation & Reliability Curves

**Context**: The Phase 3.2 baseline report observed 100% Top-2 accuracy. This report formally tests whether predicted class-probability distributions are genuinely calibrated or merely rank-preserving.
**Protocol**: Evaluated on $N = 192$ Out-of-Fold (OOF) cross-validation predictions. (Holdout test set strictly excluded).
**Binning Methodology**: 10 equal-width bins on top predicted confidence $[0.0, 1.0]$. Empty bins are handled safely with zero mass contribution.

---

## 1. Multi-Class Calibration Metrics Summary

| Model | Config | Multiclass Log Loss | Multi-Class Brier Score | Normalized Brier (/4) | Expected Calibration Error (ECE) | Maximum Calibration Error (MCE) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Logistic Regression** | `A1` | 0.4696 | 0.3030 | 0.0758 | 0.0974 | 0.2510 |
| **Random Forest** | `A4` | 0.5770 | 0.3948 | 0.0987 | 0.1455 | 0.3402 |

---

## 2. Class-Wise One-vs-Rest Calibration Error (OvR ECE)

| Model | AI & ML Eng | Cloud/DevOps | Data Analytics | Software Eng |
|---|:---:|:---:|:---:|:---:|
| **Logistic Regression** | 0.0984 | 0.0538 | 0.0344 | 0.0795 |
| **Random Forest** | 0.0835 | 0.0952 | 0.0155 | 0.1638 |

---

## 3. Detailed Reliability Bin Distribution (10 Bins)

### Logistic Regression (ECE = 0.0974)

| Bin | Confidence Range | Sample Count | Mean Confidence | Empirical Accuracy | Calibration Error |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | `[0.0, 0.1)` | 0 | — | — | 0.0000 (Empty) |
| 2 | `[0.1, 0.2)` | 0 | — | — | 0.0000 (Empty) |
| 3 | `[0.2, 0.3)` | 0 | — | — | 0.0000 (Empty) |
| 4 | `[0.3, 0.4)` | 0 | — | — | 0.0000 (Empty) |
| 5 | `[0.4, 0.5)` | 4 | 0.4945 | 0.5000 | 0.0055 |
| 6 | `[0.5, 0.6)` | 42 | 0.5462 | 0.5952 | 0.0490 |
| 7 | `[0.6, 0.7)` | 26 | 0.6452 | 0.7692 | 0.1241 |
| 8 | `[0.7, 0.8)` | 22 | 0.7510 | 0.5000 | 0.2510 |
| 9 | `[0.8, 0.9)` | 28 | 0.8571 | 0.7500 | 0.1071 |
| 10 | `[0.9, 1.0)` | 70 | 0.9305 | 1.0000 | 0.0695 |

### Random Forest (ECE = 0.1455)

| Bin | Confidence Range | Sample Count | Mean Confidence | Empirical Accuracy | Calibration Error |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | `[0.0, 0.1)` | 0 | — | — | 0.0000 (Empty) |
| 2 | `[0.1, 0.2)` | 0 | — | — | 0.0000 (Empty) |
| 3 | `[0.2, 0.3)` | 0 | — | — | 0.0000 (Empty) |
| 4 | `[0.3, 0.4)` | 0 | — | — | 0.0000 (Empty) |
| 5 | `[0.4, 0.5)` | 0 | — | — | 0.0000 (Empty) |
| 6 | `[0.5, 0.6)` | 16 | 0.5637 | 0.3750 | 0.1887 |
| 7 | `[0.6, 0.7)` | 21 | 0.6551 | 0.6190 | 0.0361 |
| 8 | `[0.7, 0.8)` | 27 | 0.7476 | 0.4074 | 0.3402 |
| 9 | `[0.8, 0.9)` | 40 | 0.8562 | 0.5750 | 0.2812 |
| 10 | `[0.9, 1.0)` | 88 | 0.9629 | 0.9205 | 0.0424 |

---

## 4. Scientific Calibration Findings & Disclosures

1. **Top-2 Accuracy Does NOT Imply Probability Calibration**:
   - Both models achieve 100% Top-2 accuracy, indicating that the true label is virtually always in the top 2 ranked predictions.
   - However, the raw predicted probabilities exhibit non-zero calibration error (ECE). Models tend to be overconfident in the highest bin.

2. **Logistic Regression vs Random Forest Calibration Profile**:
   - Multinomial Logistic Regression directly optimizes multinomial cross-entropy (log loss), leading to lower multi-class log loss and lower multiclass Brier score.
   - Random Forest class probabilities, obtained by averaging tree vote proportions, are known in literature to be push-centered towards intermediate values or overconfident at pure leaves, resulting in a higher Brier score.

3. **Saved Reliability Curve Figures**:
   - Logistic Regression: `ml/reports/figures/calibration_logistic.png`
   - Random Forest: `ml/reports/figures/calibration_random_forest.png`
