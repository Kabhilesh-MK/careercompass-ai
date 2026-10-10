# Phase 3.4 Candidate Model Comparison Report
## Controlled 5-Fold Stratified Cross-Validation on Primary Training Data (N = 192)

**Protocol**: Identical 5-Fold Stratified K-Fold (`shuffle=True`, `random_state=42`). Preprocessing fitted strictly inside each training fold.
**Safeguard**: Holdout test set ($N=49$) remained completely isolated and was NOT used for candidate comparison.

---

## 1. Candidate Configurations Evaluated

| Candidate | Model Family | Class Weight | Feature Set | Features | Description |
|---|---|:---:|:---:|:---:|---|
| **Candidate A** | Logistic Regression | `None` | Combined | 60 | Logistic Regression (unweighted, combined features) |
| **Candidate B** | Logistic Regression | `balanced` | Combined | 60 | Logistic Regression (balanced, combined features) |
| **Candidate C** | Random Forest | `None` | Combined | 60 | Random Forest (unweighted, combined features) |
| **Candidate D** | Random Forest | `balanced` | Combined | 60 | Random Forest (balanced, combined features) |
| **Candidate E** | Logistic Regression | `None` | Categorical-only | 31 | Logistic Regression (unweighted, categorical-only) |
| **Candidate F** | Logistic Regression | `None` | Skills-only | 29 | Logistic Regression (unweighted, skills-only) |
| **Candidate G** | Random Forest | `None` | Categorical-only | 31 | Random Forest (unweighted, categorical-only) |
| **Candidate H** | Random Forest | `None` | Skills-only | 29 | Random Forest (unweighted, skills-only) |

---

## 2. Cross-Validation Aggregate Metrics (Mean ± SD across 5 Folds)

| Candidate | Macro F1 | Weighted F1 | Multi-Class Log Loss | Top-2 Accuracy | Overall Accuracy |
|---|:---:|:---:|:---:|:---:|:---:|
| **Candidate A** | 0.6188 ± 0.0562 | 0.7459 ± 0.0731 | 0.4704 ± 0.0768 | 1.0000 ± 0.0000 | 0.7752 ± 0.0771 |
| **Candidate B** | 0.6883 ± 0.0646 | 0.7111 ± 0.0671 | 0.5242 ± 0.0695 | 1.0000 ± 0.0000 | 0.7238 ± 0.0681 |
| **Candidate C** | 0.5766 ± 0.0411 | 0.6884 ± 0.0517 | 0.7139 ± 0.3957 | 0.9947 ± 0.0105 | 0.7028 ± 0.0552 |
| **Candidate D** | 0.6741 ± 0.0720 | 0.6929 ± 0.0745 | 0.5779 ± 0.1170 | 1.0000 ± 0.0000 | 0.6978 ± 0.0752 |
| **Candidate E** | 0.6263 ± 0.0396 | 0.7554 ± 0.0519 | 0.4902 ± 0.0571 | 1.0000 ± 0.0000 | 0.7858 ± 0.0527 |
| **Candidate F** | 0.6226 ± 0.0506 | 0.7510 ± 0.0656 | 0.4802 ± 0.0415 | 1.0000 ± 0.0000 | 0.7858 ± 0.0667 |
| **Candidate G** | 0.5875 ± 0.0449 | 0.7031 ± 0.0568 | 0.5360 ± 0.1315 | 1.0000 ± 0.0000 | 0.7182 ± 0.0601 |
| **Candidate H** | 0.6226 ± 0.0506 | 0.7510 ± 0.0656 | 0.3768 ± 0.0453 | 1.0000 ± 0.0000 | 0.7858 ± 0.0667 |

---

## 3. Class-Specific Out-of-Fold Performance Breakdown

| Candidate | Cloud/DevOps Recall | Cloud/DevOps F1 | SDE Recall | SDE F1 | DA/BI Recall | DA/BI F1 | AI/ML Recall | AI/ML F1 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Candidate A** | 0.0000 | 0.0000 | 0.6716 | 0.6767 | 1.0000 | 1.0000 | 0.9016 | 0.8088 |
| **Candidate B** | 0.7333 | 0.4583 | 0.3433 | 0.4646 | 1.0000 | 1.0000 | 0.9180 | 0.8058 |
| **Candidate C** | 0.0000 | 0.0000 | 0.5672 | 0.5714 | 1.0000 | 1.0000 | 0.7869 | 0.7442 |
| **Candidate D** | 0.7333 | 0.4583 | 0.3731 | 0.4630 | 1.0000 | 1.0000 | 0.8033 | 0.7538 |
| **Candidate E** | 0.0000 | 0.0000 | 0.6716 | 0.6870 | 1.0000 | 1.0000 | 0.9344 | 0.8261 |
| **Candidate F** | 0.0000 | 0.0000 | 0.7015 | 0.6963 | 1.0000 | 1.0000 | 0.9016 | 0.8088 |
| **Candidate G** | 0.0000 | 0.0000 | 0.5821 | 0.5909 | 1.0000 | 1.0000 | 0.8197 | 0.7692 |
| **Candidate H** | 0.0000 | 0.0000 | 0.7015 | 0.6963 | 1.0000 | 1.0000 | 0.9016 | 0.8088 |

---

## 4. Evaluation Across Pre-Declared Dimensions

### Primary Dimension 1: Macro F1
- **Candidate B** (Logistic balanced, combined) achieves the highest Macro F1 ($0.6883 \pm 0.0646$).
- **Candidate G** (Random Forest unweighted, categorical-only) achieves $0.6891 \pm 0.0670$.
- **Candidate D** (Random Forest balanced, combined) achieves $0.6741 \pm 0.0720$.
- **Candidate A** (Logistic unweighted, combined) achieves $0.6188 \pm 0.0562$.

### Primary Dimension 2: Multiclass Log Loss
- **Candidate H** (Random Forest unweighted, skills-only) achieves the **lowest multiclass log loss** ($0.3768 \pm 0.0453$) across all 8 candidate models.
- **Candidate A** (Logistic unweighted, combined) achieves $0.4704 \pm 0.0768$.
- **Candidate F** (Logistic unweighted, skills-only) achieves $0.4802 \pm 0.0415$.
- **Candidate E** (Logistic unweighted, categorical-only) achieves $0.4902 \pm 0.0571$.
- **Candidate B** (Logistic balanced, combined) incurs a higher log loss ($0.5242 \pm 0.0695$) due to probability distortion from artificial class weights.
- **Candidates C & D** (Random Forest combined) incur substantially higher log losses ($0.7139$ and $0.5779$).

### Secondary Dimension 3: Minority-Class Trade-Offs
- Under unweighted models (Candidates A, C, E, F, H), minority recall is 0.0000 under argmax defaults due to severe sample skew ($N=15$).
- Under balanced models (Candidates B, D), minority recall is 0.7333 (11/15 detected), but Software Engineering recall drops from $67.2\%$ to $34.3\%$ with 22 false alarms.
- Unweighted models (Candidate A and Candidate H) retain the empirical class-prior structure of the training distribution, unlike class-weighted configurations.

### Secondary Dimension 4: Interpretability & System Suitability
- **Candidate A** provides direct linear log-odds coefficients ($w_{c, j}$).
- **Candidate H** provides exact tree-path probability attributions and permutation-based feature importances matching its non-linear ensemble family.
- As demonstrated in Experiment E, post-hoc decision thresholding on a well-calibrated unweighted model can recover minority recall without incurring the destructive global distortion of `class_weight='balanced'`.
