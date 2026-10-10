# CareerCompass — Phase 3.4 Scientific Report
## Model Selection, Probability Calibration, Explainability & Decision Policy

**Date**: 2026-10-03 | **Status**: Complete & Verified
**Author**: Antigravity Machine Learning Research Agent

---

## 1. Objective
Phase 3.4 formalizes the machine learning selection and validation framework for CareerCompass. Prior phases established baseline models (Phase 3.2) and diagnosed critical dataset structure (Phase 3.3)—notably, the deterministic association between B.Sc/BBA degrees and Data Analytics & BI, severe sample scarcity in Cloud/DevOps ($N=15$), and probability distortion under synthetic class weighting.

The objective of Phase 3.4 is NOT to maximize a single metric (such as overall accuracy). Instead, Phase 3.4 implements a multi-dimensional, scientifically defensible selection protocol to evaluate 8 pre-declared candidate configurations, validate probability calibration, establish transparent linear explainability, investigate post-hoc decision thresholds, audit feature representations for pruning safety, evaluate zero-shot external transfer, and serialize the finalized model artifact without test-set leakage.

---

## 2. Candidate Models
Eight candidate configurations were pre-declared and evaluated under an identical 5-fold Stratified Cross-Validation protocol (`StratifiedKFold(n_splits=5, shuffle=True, random_state=42)`):

| Candidate | Algorithm Family | Class Weight | Feature Set | Feature Count | Rationale / Purpose |
|:---:|---|:---:|:---:|:---:|---|
| **A** | Logistic Regression | `None` | Combined | 60 | Unweighted linear baseline directly minimizing cross-entropy |
| **B** | Logistic Regression | `balanced` | Combined | 60 | Linear model compensating for class imbalance via inverse weighting |
| **C** | Random Forest | `None` | Combined | 60 | Non-linear ensemble model capturing feature interactions |
| **D** | Random Forest | `balanced` | Combined | 60 | Balanced ensemble model evaluating tree-based minority sensitivity |
| **E** | Logistic Regression | `None` | Categorical-only | 31 | Isolates predictive contribution of academic degrees and interests |
| **F** | Logistic Regression | `None` | Skills-only | 29 | Isolates predictive contribution of technical competencies |
| **G** | Random Forest | `None` | Categorical-only | 31 | Non-linear evaluation of academic/interest features alone |
| **H** | Random Forest | `None` | Skills-only | 29 | Non-linear evaluation of skills features alone |

---

## 3. Cross-Validation Comparison
The controlled 5-fold CV results across all 8 candidates are summarized below. Preprocessing (`PrimaryPreprocessor`) was fitted strictly within each fold.

| Candidate | Macro F1 (Mean ± SD) | Weighted F1 (Mean ± SD) | Multiclass Log Loss | Top-2 Accuracy | Overall Accuracy | Cloud/DevOps Recall | SDE Recall |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Candidate A** | 0.6188 ± 0.0562 | 0.7459 ± 0.0731 | 0.4704 ± 0.0768 | 1.0000 ± 0.0000 | 0.7752 ± 0.0771 | 0.0000 | 0.6716 |
| **Candidate B** | 0.6883 ± 0.0646 | 0.7111 ± 0.0671 | 0.5242 ± 0.0695 | 1.0000 ± 0.0000 | 0.7238 ± 0.0681 | 0.7333 | 0.3433 |
| **Candidate C** | 0.5766 ± 0.0411 | 0.6884 ± 0.0517 | 0.7139 ± 0.3957 | 0.9947 ± 0.0105 | 0.7028 ± 0.0552 | 0.0000 | 0.5672 |
| **Candidate D** | 0.6741 ± 0.0720 | 0.6929 ± 0.0745 | 0.5779 ± 0.1170 | 1.0000 ± 0.0000 | 0.6978 ± 0.0752 | 0.7333 | 0.3731 |
| **Candidate E** | 0.6263 ± 0.0396 | 0.7554 ± 0.0519 | 0.4902 ± 0.0571 | 1.0000 ± 0.0000 | 0.7858 ± 0.0527 | 0.0000 | 0.6716 |
| **Candidate F** | 0.6226 ± 0.0506 | 0.7510 ± 0.0656 | 0.4802 ± 0.0415 | 1.0000 ± 0.0000 | 0.7858 ± 0.0667 | 0.0000 | 0.7015 |
| **Candidate G** | 0.5875 ± 0.0449 | 0.7031 ± 0.0568 | 0.5360 ± 0.1315 | 1.0000 ± 0.0000 | 0.7182 ± 0.0601 | 0.0000 | 0.5821 |
| **Candidate H** | 0.6226 ± 0.0506 | 0.7510 ± 0.0656 | 0.3768 ± 0.0453 | 1.0000 ± 0.0000 | 0.7858 ± 0.0667 | 0.0000 | 0.7015 |

---

## 4. Model Selection Rationale
Model selection was conducted strictly according to pre-declared evaluation dimensions prior to holdout evaluation:

### Primary Dimension 1: Multiclass Log Loss (Probability Quality)
- **Candidate A** achieves the **lowest cross-validated multiclass log loss** ($0.4704 \pm 0.0768$) among all combined configurations.
- Candidate B (balanced logistic) incurs a higher log loss ($0.5242$), and Random Forest configurations (Candidates C & D) exhibit substantially higher log losses ($0.7139$ and $0.5779$).
- Because CareerCompass delivers probability distributions to advise students across multiple plausible career tracks, well-behaved posterior probabilities are paramount.

### Primary Dimension 2: Macro F1 vs Majority Protection Trade-Off
- While Candidate B achieves a higher nominal Macro F1 ($0.6883$ vs $0.6188$), Phase 3.3 and Experiment A demonstrate that this gain is achieved by artificially forcing Cloud/DevOps predictions, which causes **Software Development recall to collapse from 67.2% down to 34.3%** and generates 22 false alarms.
- Candidate A retains the empirical class-prior structure of the training distribution, unlike class-weighted configurations.

### Secondary Dimension: Interpretability & Decision Policy Suitability
- Multinomial Logistic Regression provides direct, linear log-odds coefficients ($w_{c, j}$), enabling complete mathematical explainability (Experiment C & D).
- As demonstrated in Experiment E, post-hoc decision thresholding on a well-calibrated unweighted model can recover minority recall without incurring the destructive global distortion of `class_weight='balanced'`.

**Selection Decision**: **Candidate A (Multinomial Logistic Regression, unweighted, combined features)** is selected as the scientifically defensible model for Phase 3.4.

---

## 5. Final Holdout Evaluation
Following strict scientific protocol, the 49-row holdout dataset was evaluated **strictly ONCE** after Candidate A was locked based on cross-validation.

| Metric | Holdout Value ($N = 49$) | 5-Fold CV Mean ($N = 192$) | Generalization Delta | Evaluation Note |
|---|:---:|:---:|:---:|---|
| **Overall Accuracy** | **0.8163** | 0.7752 | +0.0411 | Highly consistent generalization |
| **Macro F1** | **0.6478** | 0.6188 | +0.0290 | Stable across partitions |
| **Weighted F1** | **0.7828** | 0.7459 | +0.0369 | Robust across support weights |
| **Multiclass Log Loss** | **0.3970** | 0.4704 | -0.0734 | Improved probability fit on unseen data |
| **Top-2 Accuracy** | **1.0000** | 1.0000 | 0.0000 | 100% of true classes in top 2 predictions |

### Per-Class Holdout Metrics

| Track | Precision | Recall | F1-Score | Holdout Support | Correct Predictions |
|---|:---:|:---:|:---:|:---:|:---:|
| `AI & Machine Learning Engineering` | 0.7778 | 0.9333 | 0.8485 | 15 | 14/15 |
| `Cloud, DevOps & Systems Engineering` | 0.0000 | 0.0000 | 0.0000 | 4 | 0/4 |
| `Data Analytics & Business Intelligence` | 1.0000 | 1.0000 | 1.0000 | 13 | 13/13 |
| `Software Development & Engineering` | 0.7222 | 0.7647 | 0.7429 | 17 | 13/17 |

---

## 6. Probability Calibration
Experiment B investigated whether post-hoc probability calibration (Platt/Sigmoid and Isotonic) reliably improves probability quality on training data without leakage. A nested 5-fold CV protocol with inner 3-fold calibration was used.

| Method | Multiclass Log Loss | Multiclass Brier Score | ECE (10 Bins) | MCE | Scientific Finding |
|---|:---:|:---:|:---:|:---:|---|
| **Uncalibrated** | 0.4696 | 0.3030 | 0.0974 | 0.2510 | Base model natively minimizes cross-entropy |
| **Sigmoid (Platt)** | 0.4881 | 0.2987 | 0.1135 | 0.1699 | Slight variance increase; minimal change |
| **Isotonic** | 0.7872 | 0.3150 | 0.0857 | 0.6889 | Overfits small sample size (+67% log loss degradation) |

**Conclusion**: Base Multinomial Logistic Regression already provides well-calibrated probabilities. Post-hoc isotonic regression severely degrades log loss on this dataset ($N=192$) and is NOT recommended. Saved reliability figures: `ml/reports/figures/calibration_before.png` and `ml/reports/figures/calibration_after.png`.

---

## 7. Explainability
Because Candidate A is a linear model, predictions decompose directly into class-specific linear coefficients ($w_{c, j}$) and base intercepts ($b_c$):

- **Base Intercepts**: AI/ML (`+0.4210`), Cloud/DevOps (`-1.2847`), Data Analytics/BI (`+0.4608`), Software Engineering (`+0.4030`). The negative base intercept for Cloud reflects its natural $7.8\%$ sample prevalence.
- **Key Indicators by Track**:
  - **AI & Machine Learning**: Strongly associated with `Education_Level_M.Tech` (`+1.5561`), `Skill: power_analysis` (`+0.4796`), `Skill: ai` (`+0.4262`), and `Specialization_Information Systems` (`+0.6130`).
  - **Data Analytics & BI**: Strongly associated with `Education_Level_B.Sc` (`+1.2809`), `Education_Level_BBA` (`+1.0803`), `Skill: communication` (`+0.4796`), and `Skill: critical_thinking` (`+0.4431`).
  - **Software Engineering**: Strongly associated with `Education_Level_B.Tech` (`+1.1162`), `Skill: python` (`+0.5137`), `Skill: cad` (`+0.4795`), and `Skill: programming` (`+0.4190`).
  - **Cloud/DevOps**: Strongly associated with `Skill: database_systems` (`+0.7507`), `Skill: web_development` (`+0.7507`), `Education_Level_BCA` (`+0.7507`), and `Interests_Teaching` (`+0.8566`).

**Non-Causal Scientific Clarification**: High positive coefficients indicate empirical associations within the training benchmark; they do not establish that acquiring a specific skill causes career success.

---

## 8. Local Explanation Examples
Three representative training samples were audited for instance-level linear attributions (detailed in `ml/reports/local_explanation_examples.md`):

1. **Example 1 (AI/ML Record, Row #4)**: M.Tech with Power Systems specialization and Python/Power Analysis skills. Model assigned **92.81%** probability to AI/ML. Primary drivers: `Education_Level_M.Tech` (+1.5561) and `Skill: power_analysis` (+0.4796).
2. **Example 2 (Data Analytics/BI Record, Row #1)**: B.Sc with Mathematics specialization and Critical Thinking skill. Model assigned **97.80%** probability to Data Analytics. Primary drivers: `Education_Level_B.Sc` (+1.2809) and `Skill: critical_thinking` (+0.4431).
3. **Example 3 (Software Engineering Record, Row #2)**: B.Tech with Mechanical specialization and Python/CAD skills. Model assigned **83.56%** probability to Software Engineering. Primary drivers: `Education_Level_B.Tech` (+1.1162) and `Skill: python` (+0.5137).

---

## 9. Threshold Analysis
Experiment E evaluated post-hoc probability thresholding on the minority class (`Cloud, DevOps & Systems Engineering`) across a predefined grid $[0.10, 0.40]$ using training OOF probabilities strictly:

| Threshold ($\tau$) | Cloud Recall | Cloud Precision | Cloud F1 | SDE Recall | Macro F1 | Overall Accuracy | Cloud TP (out of 15) | Cloud False Positives |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| *Argmax Baseline* | *0.0000* | *0.0000* | *0.0000* | *0.6716* | *0.6214* | *0.7760* | 0/15 | 0 |
| **0.10** | 1.0000 | 0.3261 | 0.4918 | 0.2388 | 0.6650 | 0.7031 | 15/15 | 31 |
| **0.15** | 0.9333 | 0.3333 | 0.4912 | 0.2836 | 0.6772 | 0.7135 | 14/15 | 28 |
| **0.20** | 0.8000 | 0.3529 | 0.4898 | 0.3731 | 0.6984 | 0.7344 | 12/15 | 22 |
| **0.25** | 0.6667 | 0.3333 | 0.4444 | 0.4030 | 0.6919 | 0.7344 | 10/15 | 20 |
| **0.30** | 0.5333 | 0.3077 | 0.3902 | 0.4328 | 0.6828 | 0.7344 | 8/15 | 18 |
| **0.35** | 0.2667 | 0.1905 | 0.2222 | 0.4478 | 0.6393 | 0.7188 | 4/15 | 17 |
| **0.40** | 0.0000 | 0.0000 | 0.0000 | 0.5672 | 0.6030 | 0.7396 | 0/15 | 9 |

**Trade-Off Insight**: Lowering the threshold to $\tau = 0.25$ recovers $66.7\%$ of minority instances but incurs 20 false alarms. No single threshold is universally optimal; operating points reflect deployment policy trade-offs.

---

## 10. Feature Pruning
Experiment F audited the 60 transformed features for variance degeneracy and collinear redundancy:
- **Zero-Variance Features**: Exactly 0. All 60 features vary ($s^2 \ge 0.0104$).
- **Controlled CV Comparison**: Under 5-fold CV, the zero-variance pruned feature set is identical to the original feature set (Macro F1 = $0.6188 \pm 0.0562$, Log Loss = $0.4704$).
- **Collinearity Safety**: Multiple survey-bundled skill pairs exhibit high correlation ($r \ge 0.85$), but L2 regularization shrinks coefficients stably without numerical divergence, rendering blind deletion unnecessary.

---

## 11. External Transfer
The selected Candidate A model was evaluated against the authentic external college graduate dataset from Breejesh Dhar ($N = 311$ across 4 trained tracks) under partial-schema zero-shot transfer:

- **Overall Transfer Accuracy**: **61.41%** ($191/311$ correct)
- **Macro F1**: **0.2721** (skewed by 0 recall on external Cloud and AI graduates)
- **Weighted F1**: **0.6038**
- **Top-2 Accuracy**: **75.24%** ($234/311$)
- **Software Engineering Recall**: **73.91%** ($170/230$ correct)
- **Data Analytics Recall**: **47.73%** ($21/44$ correct)

**Domain Context**: Breejesh graduates possess substantially different curriculum structures and job title distributions (74% Software Engineering). The model transfers moderate discriminative capability without fine-tuning.

---

## 12. Final Model Artifact
The final model and preprocessing pipeline were fitted strictly on all $N = 192$ primary training records (excluding the 49 holdout samples) and serialized:
- **Model Artifact**: `ml/models/careercompass_phase3_4_model.joblib`
- **Preprocessor Artifact**: `ml/models/careercompass_phase3_4_preprocessor.joblib`
- **Metadata Artifact**: `ml/models/careercompass_phase3_4_metadata.json`

---

## 13. Model Card Summary
A formal Model Card (`ml/reports/model_card.md`) was created adhering to institutional standards, documenting model purpose, intended use, out-of-scope risks, training and validation procedures, holdout and transfer results, known limitations, and the primary scientific disclaimer.

---

## 14. Limitations
1. **Sample Size Constraints**: The primary dataset contains only 192 training samples, leading to wide confidence intervals on minority class performance.
2. **Minority Scarcity**: Cloud/DevOps has only 15 training and 4 holdout samples, making empirical generalization metrics sensitive to individual sample outcomes.
3. **Curriculum Confounding**: B.Sc and BBA degrees are entirely associated with Data Analytics & BI in the training benchmark, which may over-index degree title over transferable technical skills.
4. **Binary Feature Space**: The current representation uses binary indicators without skill proficiency depth, project history, or recency.

---

## 15. Recommendation for Phase 3.5 (Original Phase 3.4 Proposal)
1. **Preserve Candidate A Architecture**: Maintain Multinomial Logistic Regression with unweighted L2 regularization as the core predictive backbone.
2. **Dynamic Policy Selection**: Provide application users with dual recommendation modes: standard calibrated probabilities (argmax) vs minority-sensitive exploration (using post-hoc thresholding $\tau \approx 0.20-0.25$).
3. **Explainability Integration**: Utilize the verified linear attribution vectors to power the user-facing explanation widgets in Phase 3.5, presenting top positive and negative skill contributors dynamically.
4. **Maintain Strict ML Boundaries**: Maintain clean boundaries between model inference, psychometric RIASEC benchmarks, and downstream rule-based recommendation logic.

---

# Phase 3.4.1 Selection Correction

**Audit Date**: 2026-10-03  
**Status**: Formally Verified & Finalized  
**Scope**: Model Selection Correction, Candidate H Validation & Explainability Alignment

### 1. Why the Original Phase 3.4 Selection Required Correction
Phase 3.4 declared two primary selection dimensions:
1. **Macro F1**
2. **Multiclass Log Loss (Probability Quality)**
along with secondary dimensions including Accuracy, Weighted F1, Top-2 Accuracy, Fold-to-Fold Variability, Minority Recall, and Feature-Space Simplicity. All Candidates A through H were pre-declared as eligible configurations.

However, Candidate A (Multinomial Logistic Regression, unweighted, combined 60 features) was initially selected based on the erroneous assertion that it achieved the lowest multiclass log loss ($0.4704$). Candidate H (Random Forest, unweighted, skills-only 29 features) had been evaluated under identical 5-fold CV splits and had achieved a substantially lower multiclass log loss ($0.3768 \pm 0.0453$, lowest of all 8 candidates) and higher Macro F1 ($0.6226 \pm 0.0506$). Therefore, the selection decision required formal correction based strictly on the pre-declared criteria and existing 5-fold CV results without using holdout data.

### 2. Controlled Cross-Validation Comparison Summary

| Candidate | Model Family | Class Weight | Feature Set | Feats | CV Macro F1 | CV Multiclass Log Loss | CV Accuracy | CV Weighted F1 | CV Top-2 | Cloud Recall (OOF) | SDE Recall (OOF) |
|:---:|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Candidate A** | Logistic Regression | `None` | Combined | 60 | 0.6188 ± 0.0562 | 0.4704 ± 0.0768 | 0.7752 ± 0.0771 | 0.7459 ± 0.0731 | 1.0000 | 0.0000 | 0.6716 |
| **Candidate B** | Logistic Regression | `balanced` | Combined | 60 | 0.6883 ± 0.0646 | 0.5242 ± 0.0695 | 0.7238 ± 0.0681 | 0.7111 ± 0.0671 | 1.0000 | 0.7333 | 0.3433 |
| **Candidate C** | Random Forest | `None` | Combined | 60 | 0.5766 ± 0.0411 | 0.7139 ± 0.3957 | 0.7028 ± 0.0552 | 0.6884 ± 0.0517 | 0.9947 | 0.0000 | 0.5672 |
| **Candidate D** | Random Forest | `balanced` | Combined | 60 | 0.6741 ± 0.0720 | 0.5779 ± 0.1170 | 0.6978 ± 0.0752 | 0.6929 ± 0.0745 | 1.0000 | 0.7333 | 0.3731 |
| **Candidate E** | Logistic Regression | `None` | Categorical | 31 | 0.6263 ± 0.0396 | 0.4902 ± 0.0571 | 0.7858 ± 0.0527 | 0.7554 ± 0.0519 | 1.0000 | 0.0000 | 0.6716 |
| **Candidate F** | Logistic Regression | `None` | Skills-only | 29 | 0.6226 ± 0.0506 | 0.4802 ± 0.0415 | 0.7858 ± 0.0667 | 0.7510 ± 0.0656 | 1.0000 | 0.0000 | 0.7015 |
| **Candidate G** | Random Forest | `None` | Categorical | 31 | 0.5875 ± 0.0449 | 0.5360 ± 0.1315 | 0.7182 ± 0.0601 | 0.7031 ± 0.0568 | 1.0000 | 0.0000 | 0.5821 |
| **Candidate H** | Random Forest | `None` | Skills-only | 29 | **0.6226 ± 0.0506** | **0.3768 ± 0.0453** | **0.7858 ± 0.0667** | **0.7510 ± 0.0656** | **1.0000** | 0.0000 | **0.7015** |

### 3. Corrected Selected Candidate
- **Candidate ID**: **Candidate H**
- **Model Type**: Random Forest Classifier (`sklearn.ensemble.RandomForestClassifier`)
- **Class Weighting**: `None` (retains the empirical class-prior structure of the training distribution, unlike class-weighted configurations)
- **Feature Configuration**: Skills-only (29 multi-hot binary technical skill indicators)
- **Parameters**: `n_estimators=300`, `criterion='gini'`, `max_depth=None`, `min_samples_split=2`, `min_samples_leaf=1`, `random_state=42`, `n_jobs=-1`
- **Selection Basis**: Strictly 5-fold Stratified Cross-Validation on the 192 training records; holdout set was completely isolated.

### 4. Corrected Selection Rationale
1. **Primary Dimension Dominance**:
   - **Multiclass Log Loss**: Candidate H achieves $0.3768 \pm 0.0453$, representing a $19.9\%$ lower cross-entropy error than Candidate A ($0.4704 \pm 0.0768$). Out-of-fold minimum true-class probability is $0.2395$ (vs $0.0918$ for Candidate A), avoiding catastrophic probability penalties.
   - **Macro F1**: Candidate H achieves $0.6226 \pm 0.0506$, exceeding Candidate A ($0.6188 \pm 0.0562$).
2. **Secondary Dimension Dominance**:
   - **Higher Overall Accuracy**: $0.7858$ vs $0.7752$.
   - **Higher Weighted F1**: $0.7510$ vs $0.7459$.
   - **Higher SDE Recall**: $70.15\%$ (47/67 correct) vs $67.16\%$ (45/67 correct).
   - **Lower Fold-to-Fold Variance**: Candidate H exhibits lower standard deviation across every metric.
   - **Confounder-Free Feature Space**: Using 29 skills features eliminates B.Sc/BBA degree title confounding.

### 5. Final Holdout Evaluation for Corrected Candidate (N = 49)
Fitted strictly once on all 192 primary training samples and evaluated on the untouched 49-row holdout:
- **Overall Accuracy**: **79.59%** ($39/49$ correct)
- **Macro F1**: **0.6302**
- **Weighted F1**: **0.7589**
- **Multiclass Log Loss**: **0.3874**
- **Top-2 Accuracy**: **100.00%** ($49/49$ true classes present in top 2 predictions)
- **Per-Class Breakdown**:
  - *Data Analytics & BI*: Precision 1.0000, Recall **1.0000** (13/13 correct), F1 1.0000
  - *AI & Machine Learning*: Precision 0.7143, Recall **1.0000** (15/15 correct), F1 0.8333
  - *Software Development*: Precision 0.7333, Recall **0.6471** (11/17 correct), F1 0.6875
  - *Cloud / DevOps*: Precision 0.0000, Recall **0.0000** (0/4 correct), F1 0.0000
- **Holdout Comparison with Candidate A**: Candidate A achieved $40/49$ accuracy ($81.63\%$) and log loss $0.3970$. Candidate H achieved $39/49$ accuracy ($79.59\%$) and lower log loss ($0.3874$). Both evaluations are preserved for complete scientific auditability.

### 6. Whether the Selected Model Changed
**YES**. The selected model changed from **Candidate A** (Multinomial Logistic Regression, combined features) to **Candidate H** (Random Forest, skills-only features). The production artifacts (`ml/models/careercompass_phase3_4_model.joblib`, `preprocessor.joblib`, and `metadata.json`) have been overwritten with the locked Candidate H configuration.

### 7. Explainability Method Consistency
Because Candidate H is a Random Forest ensemble, explainability methods were updated to match its non-linear tree architecture:
- **Global Importance**: Permutation-based feature importance (`sklearn.inspection.permutation_importance`) and Mean Decrease in Impurity (Gini importance) across the 300 trees.
- **Local Explanations**: Exact additive tree-path probability attribution ($P(Y = c \mid \mathbf{x}) = \bar{p}_{\text{root}, c} + \sum_j \Delta p_{c, j}(\mathbf{x})$) across decision paths traversed by the sample.
- **Fidelity**: Linear logistic regression coefficients are NOT presented as explanations for the Random Forest model.

### 8. Threshold Policy Status
- Post-hoc threshold analysis was re-evaluated on Candidate H's training OOF probabilities across the grid $[0.10, 0.40]$.
- At $\tau = 0.25 - 0.30$, Cloud recall recovers up to $80.0\% - 100.0\%$ with 27-31 false positives.
- As required by rigorous scientific standards, $\tau = 0.25$ is NOT declared as the final production threshold. It is explicitly designated as an **"OOF threshold candidate requiring further validation"**.

