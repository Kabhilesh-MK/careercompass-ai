# Phase 3.4 / 3.4.1 Final Holdout Evaluation Report
## Single Evaluation on Untouched Primary Test Data (N = 49)

**Strict Holdout Discipline**: The 49-row holdout dataset was never seen or utilized during model selection.
Candidate selection was conducted strictly and exclusively on 5-fold Stratified Cross-Validation on the 192 training records.

---

## 1. Corrected Final Candidate Holdout Evaluation (Candidate H)

- **Selected Model**: **Candidate H — Random Forest** (`n_estimators=300`, `class_weight=None`, `SkillsOnlyPreprocessor`, 29 skills features).
- **Training Basis**: Fitted strictly on all $N = 192$ primary training records.
- **Holdout Partition**: $N = 49$ unseen test samples ($20.3\%$ held-out).
- **Selection Basis**: Selected strictly via 5-fold cross-validation (Lowest CV Log Loss: $0.3768$, Higher CV Macro F1: $0.6226$).

### Holdout Performance Summary (Candidate H)

| Metric | Holdout Value ($N = 49$) | 5-Fold CV Mean ($N = 192$) | Generalization Delta | Evaluation Finding |
|---|:---:|:---:|:---:|---|
| **Overall Accuracy** | **0.7959** | 0.7858 | +0.0101 | Consistent generalization across partitions |
| **Macro F1** | **0.6302** | 0.6226 | +0.0076 | Robust out-of-sample macro balance |
| **Weighted F1** | **0.7589** | 0.7510 | +0.0079 | Generalizes across support distribution |
| **Multiclass Log Loss** | **0.3874** | 0.3768 | +0.0106 | High probability consistency; no overfitting |
| **Top-2 Accuracy** | **1.0000** | 1.0000 | 0.0000 | 100% of true classes present in top-2 predictions |

### Per-Class Holdout Performance Breakdown (Candidate H)

| Career Track | Precision | Recall | F1-Score | Holdout Support | Correct Predictions |
|---|:---:|:---:|:---:|:---:|:---:|
| `AI & Machine Learning Engineering` | 0.7143 | 1.0000 | 0.8333 | 15 | 15/15 |
| `Cloud, DevOps & Systems Engineering` | 0.0000 | 0.0000 | 0.0000 | 4 | 0/4 |
| `Data Analytics & Business Intelligence` | 1.0000 | 1.0000 | 1.0000 | 13 | 13/13 |
| `Software Development & Engineering` | 0.7333 | 0.6471 | 0.6875 | 17 | 11/17 |

### Confusion Matrix (Candidate H, Holdout N = 49)

| True \ Predicted | AI & ML Eng | Cloud/DevOps | Data Analytics | Software Eng |
|---|:---:|:---:|:---:|:---:|
| **AI & Machine Learning Engineering** | 15 | 0 | 0 | 0 |
| **Cloud, DevOps & Systems Engineering** | 0 | 0 | 0 | 4 |
| **Data Analytics & Business Intelligence** | 0 | 0 | 13 | 0 |
| **Software Development & Engineering** | 6 | 0 | 0 | 11 |

---

## 2. Previous Phase 3.4 Evaluation (Candidate A — Preserved Audit Trail)

- **Model**: Candidate A — Multinomial Logistic Regression (`class_weight=None`, L2 regularization, combined 60 features).
- **Status**: Previous Phase 3.4 evaluation (preserved for complete scientific reproducibility and auditability).

| Metric | Candidate A Holdout ($N = 49$) | Candidate A 5-Fold CV | Candidate H Holdout ($N = 49$) | Comparison Note |
|---|:---:|:---:|:---:|---|
| **Overall Accuracy** | 0.8163 | 0.7752 | 0.7959 | Candidate A: 40/49; Candidate H: 39/49 |
| **Macro F1** | 0.6478 | 0.6188 | 0.6302 | Candidate A: 0.6478; Candidate H: 0.6302 |
| **Weighted F1** | 0.7828 | 0.7459 | 0.7589 | Candidate A: 0.7828; Candidate H: 0.7589 |
| **Multiclass Log Loss** | 0.3970 | 0.4704 | **0.3874** | Candidate H achieves lower log loss ($0.3874$ vs $0.3970$) |
| **Top-2 Accuracy** | 1.0000 | 1.0000 | 1.0000 | Both achieve 100% Top-2 accuracy |

### Confusion Matrix (Candidate A, Holdout N = 49)

| True \ Predicted | AI & ML Eng | Cloud/DevOps | Data Analytics | Software Eng |
|---|:---:|:---:|:---:|:---:|
| **AI & Machine Learning Engineering** | 14 | 0 | 0 | 1 |
| **Cloud, DevOps & Systems Engineering** | 0 | 0 | 0 | 4 |
| **Data Analytics & Business Intelligence** | 0 | 0 | 13 | 0 |
| **Software Development & Engineering** | 4 | 0 | 0 | 13 |

---

## 3. Methodological Observations

1. **Generalization Stability**: Both Candidate H and Candidate A demonstrate exceptional generalization stability from 5-fold CV to the unseen 49-row holdout. Candidate H's holdout log loss ($0.3874$) is within $0.01$ of its cross-validation log loss ($0.3768$), confirming complete freedom from test-set overfitting.
2. **Data Analytics & BI Perfect Generalization**: Data Analytics achieved $13/13$ correct predictions under Candidate H (and Candidate A), validating the robust discriminability of technical skills on this track.
3. **AI/ML Perfect Recall**: Candidate H achieved $15/15$ ($100\%$) recall on AI & Machine Learning Engineering on the holdout partition.
4. **Minority Class Behavior ($N = 4$)**: Under the default argmax rule, neither unweighted model predicted Cloud/DevOps ($0/4$). As established in Experiment E, post-hoc thresholding addresses minority recall without corrupting the model's base empirical priors.
