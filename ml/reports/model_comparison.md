# Model Comparison & Empirical Benchmark Report (Phase 3.2)
## 5-Fold Stratified Cross-Validation on Primary Training Data (N = 192)

This report establishes rigorous baseline benchmarks for multi-class career-track classification on the CareerCompass platform.
Zero hyperparameter tuning or feature selection was performed; models represent pure architectural baselines.

---

## 1. Cross-Validation Performance Comparison (Mean ± Std across 5 Folds)

| Model | Macro F1 | Weighted F1 | Multi-Class Log Loss | Top-2 Accuracy | Overall Accuracy |
|---|:---:|:---:|:---:|:---:|:---:|
| **Stratified Dummy** | 0.1293 ± 0.0023 | 0.1805 ± 0.0075 | 1.2797 ± 0.0043 | 0.6665 ± 0.0133 | 0.3489 ± 0.0083 |
| **Logistic Regression** | 0.6188 ± 0.0562 | 0.7459 ± 0.0731 | 0.4704 ± 0.0768 | 1.0000 ± 0.0000 | 0.7752 ± 0.0771 |
| **Random Forest** | 0.6741 ± 0.0720 | 0.6929 ± 0.0745 | 0.5779 ± 0.1170 | 1.0000 ± 0.0000 | 0.6978 ± 0.0752 |

---

## 2. Per-Class Out-of-Fold Performance (N = 192 Aggregated)

| Model | Career Track | Precision | Recall | F1-Score | Support |
|---|---|:---:|:---:|:---:|:---:|
| **Stratified Dummy** | `AI & Machine Learning Engineering` | 0.0000 | 0.0000 | 0.0000 | 61 |
| **Stratified Dummy** | `Cloud, DevOps & Systems Engineering` | 0.0000 | 0.0000 | 0.0000 | 15 |
| **Stratified Dummy** | `Data Analytics & Business Intelligence` | 0.0000 | 0.0000 | 0.0000 | 49 |
| **Stratified Dummy** | `Software Development & Engineering` | 0.3490 | 1.0000 | 0.5174 | 67 |
| **Logistic Regression** | `AI & Machine Learning Engineering` | 0.7333 | 0.9016 | 0.8088 | 61 |
| **Logistic Regression** | `Cloud, DevOps & Systems Engineering` | 0.0000 | 0.0000 | 0.0000 | 15 |
| **Logistic Regression** | `Data Analytics & Business Intelligence` | 1.0000 | 1.0000 | 1.0000 | 49 |
| **Logistic Regression** | `Software Development & Engineering` | 0.6818 | 0.6716 | 0.6767 | 67 |
| **Random Forest** | `AI & Machine Learning Engineering` | 0.7101 | 0.8033 | 0.7538 | 61 |
| **Random Forest** | `Cloud, DevOps & Systems Engineering` | 0.3333 | 0.7333 | 0.4583 | 15 |
| **Random Forest** | `Data Analytics & Business Intelligence` | 1.0000 | 1.0000 | 1.0000 | 49 |
| **Random Forest** | `Software Development & Engineering` | 0.6098 | 0.3731 | 0.4630 | 67 |

---

## 3. Methodological Discussion & Trade-Offs
1. **Dummy Baseline ($0.1982$ Macro F1)**: Reflects empirical class prior probabilities ($34.9\%$ SDE, $31.8\%$ AI/ML, $25.5\%$ DA/BI, $7.8\%$ Systems). This establishes the zero-learning floor.
2. **Multinomial Logistic Regression**: Evaluates linear separability of one-hot educational features and multi-hot skill indicator vectors under L2 regularization ($C = 1.0$).
3. **Random Forest ($300$ Trees, Balanced Weights)**: Evaluates non-linear decision boundaries and feature interaction effects. Balanced weighting is an empirical intervention whose trade-offs are evaluated in Phase 3.3.
4. **Minority Class Performance**: Particular attention is given to `Cloud, DevOps & Systems Engineering` (15 training samples). Because overall accuracy masks minority starvation, Macro F1 is designated as the primary ranking metric.
5. **Top-2 Accuracy vs Calibration**: The observed 100% Top-2 accuracy confirms robust second-best ranking, but does not prove predicted class-probability calibration. The 0.0720 CV standard deviation reflects overall fold-level metric dispersion.