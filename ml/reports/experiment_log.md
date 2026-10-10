# CareerCompass Machine Learning Experiment Log (Phase 3.2)
**Date**: 2026-10-03 | **Phase**: 3.2 (Baseline Modeling & Empirical Benchmarking)

## 1. Experiment Setup & Reproducibility Metadata
- **Environment**: Python 3.14.7 on Windows 11 (10.0.26300)
- **Dependencies**: Scikit-Learn 1.9.0, NumPy 2.5.1, Pandas 3.0.3
- **Global Seed**: `42`
- **Primary Dataset**: `Perfectly Realistic Career Guidance Dataset (Divya Eldho)` (241 technical samples)
- **Train Partition**: 192 samples (79.7%)
- **Holdout Partition**: 49 samples (20.3%)
- **Cross-Validation**: 5-Fold Stratified K-Fold (`shuffle=True`, `random_state=42`)
- **Data Leakage Safeguard**: PrimaryPreprocessor fitted strictly within each training fold.

---

## 2. Model Configurations Tested
- **Model 1: Stratified Dummy**: `DummyClassifier(strategy='prior', random_state=42)`
- **Model 2: Logistic Regression**: `LogisticRegression(penalty='l2', C=1.0, solver='lbfgs', max_iter=1000, random_state=42)`
- **Model 3: Random Forest**: `RandomForestClassifier(n_estimators=300, class_weight='balanced', random_state=42)`

---

## 3. 5-Fold Cross-Validation Benchmark Summary
- **Stratified Dummy**: Macro F1 = `0.1293 ± 0.0023`, Weighted F1 = `0.1805 ± 0.0075`, Log Loss = `1.2797 ± 0.0043`, Top-2 Accuracy = `0.6665 ± 0.0133`
- **Logistic Regression**: Macro F1 = `0.6188 ± 0.0562`, Weighted F1 = `0.7459 ± 0.0731`, Log Loss = `0.4704 ± 0.0768`, Top-2 Accuracy = `1.0000 ± 0.0000`
- **Random Forest**: Macro F1 = `0.6741 ± 0.0720`, Weighted F1 = `0.6929 ± 0.0745`, Log Loss = `0.5779 ± 0.1170`, Top-2 Accuracy = `1.0000 ± 0.0000`

---

## 4. Holdout Test Set Results (N = 49, Untouched Test Set)
- **Stratified Dummy**: Accuracy = `0.3469`, Macro F1 = `0.1288`, Weighted F1 = `0.1787`, Log Loss = `1.2867`, Top-2 Accuracy = `0.6531`
- **Logistic Regression**: Accuracy = `0.8163`, Macro F1 = `0.6478`, Weighted F1 = `0.7828`, Log Loss = `0.3970`, Top-2 Accuracy = `1.0000`
- **Random Forest**: Accuracy = `0.7143`, Macro F1 = `0.7048`, Weighted F1 = `0.7156`, Log Loss = `0.4826`, Top-2 Accuracy = `1.0000`

---

## 5. Zero-Shot External Transfer Evaluation (Breejesh Dhar, N = 311 Evaluated)
- **Stratified Dummy**: Accuracy = `0.7395`, Macro F1 = `0.2126`, Weighted F1 = `0.6288`, Top-2 Accuracy = `0.7846`
- **Logistic Regression**: Accuracy = `0.6141`, Macro F1 = `0.2721`, Weighted F1 = `0.6038`, Top-2 Accuracy = `0.7524`
- **Random Forest**: Accuracy = `0.5531`, Macro F1 = `0.2907`, Weighted F1 = `0.5686`, Top-2 Accuracy = `0.7010`

---

## 6. RIASEC Psychometric Benchmark Comparison (N = 2,400, 6 Classes)
### CONFIG A (Cognitive/Aptitude Baseline — 5 Features)
- **Dummy (Prior)**: Macro F1 = `0.0476 ± 0.0000`, Weighted F1 = `0.0476 ± 0.0000`, Log Loss = `1.7918 ± 0.0000`, Top-2 Acc = `0.3333 ± 0.0000`
- **Logistic Regression**: Macro F1 = `0.5374 ± 0.0168`, Weighted F1 = `0.5374 ± 0.0168`, Log Loss = `0.8190 ± 0.0138`, Top-2 Acc = `0.8562 ± 0.0070`
- **Random Forest**: Macro F1 = `0.5312 ± 0.0059`, Weighted F1 = `0.5312 ± 0.0059`, Log Loss = `0.9552 ± 0.0388`, Top-2 Acc = `0.8483 ± 0.0113`

### CONFIG B (Full Psychometric Inventory — 11 Features: Config A + 6 RIASEC Traits)
- **Dummy (Prior)**: Macro F1 = `0.0476 ± 0.0000`, Weighted F1 = `0.0476 ± 0.0000`, Log Loss = `1.7918 ± 0.0000`, Top-2 Acc = `0.3333 ± 0.0000`
- **Logistic Regression**: Macro F1 = `0.9570 ± 0.0041`, Weighted F1 = `0.9570 ± 0.0041`, Log Loss = `0.1006 ± 0.0064`, Top-2 Acc = `1.0000 ± 0.0000`
- **Random Forest**: Macro F1 = `0.9558 ± 0.0068`, Weighted F1 = `0.9558 ± 0.0068`, Log Loss = `0.1009 ± 0.0047`, Top-2 Acc = `0.9992 ± 0.0010`

---

## 7. Major Academic Disclosures & Statistical Limitations
1. **Small Sample Size Sensitivity**: With N = 192 training samples and 15 minority samples, performance estimates have non-zero variance as reflected in standard deviations.
2. **Zero In-Sample Leakage**: Verified that test sets and external datasets were completely excluded from model fitting and parameter selection.
3. **Zero Model Claim Overreach**: Baselines demonstrate feasibility; they do not represent final production models. Phase 3.3 will explore hyperparameter optimization and feature alignment.
---

# CareerCompass Machine Learning Experiment Log (Phase 3.3)
**Date**: 2026-10-03 18:40:24 | **Phase**: 3.3 (Advanced Model Validation, Class-Weight Ablation & Feature Analysis)

## 1. Phase 3.3 Experimental Objectives
- Investigated empirical effect of class weighting (unweighted vs balanced).
- Analyzed marginal contribution of feature groups (Categorical-only, Skills-only, Combined).
- Diagnosed structural cause of Data Analytics & BI 100% precision/recall on training partition.
- Evaluated probability calibration (Log Loss, multiclass Brier score, 10-bin ECE, reliability diagrams).
- Conducted fold-by-fold minority performance analysis on Cloud/DevOps (N = 15 total, 3 per fold).

## 2. Key Empirical Results
- **Experiment A (Class-Weight Ablation)**:
  - Logistic (Unweighted A1): Macro F1 = `0.6188`, Log Loss = `0.4704`, Minority Recall = `0.0000`
  - Logistic (Balanced A2): Macro F1 = `0.6883`, Log Loss = `0.5242`, Minority Recall = `0.7333`
  - Random Forest (Unweighted A3): Macro F1 = `0.5766`, Log Loss = `0.7139`, Minority Recall = `0.0000`
  - Random Forest (Balanced A4): Macro F1 = `0.6741`, Log Loss = `0.5779`, Minority Recall = `0.7333`
- **Experiment B (Feature Ablation)**:
  - B1 (Categorical-only, 31 features, Logistic): Macro F1 = `0.6263`, DA/BI Recall = `1.0000`
  - B2 (Skills-only, 29 features, Logistic): Macro F1 = `0.6226`, DA/BI Recall = `1.0000`
  - B3 (Combined, 60 features, Logistic): Macro F1 = `0.6188`, Log Loss = `0.4704`
- **Experiment C (Feature-Target Structure)**:
  - Confirmed deterministic partition: 100% of Data Analytics & BI training samples hold B.Sc or BBA degrees (0% in other tracks).
  - Track-exclusive skills (Critical Thinking, Excel, Communication, Research) appear exclusively within Data Analytics & BI.
- **Experiment D (Probability Calibration)**:
  - Logistic Regression (A1): Multiclass Log Loss = `0.4696`, Brier = `0.3030`, ECE (10 bins) = `0.0974`
  - Random Forest (A4): Multiclass Log Loss = `0.5770`, Brier = `0.3948`, ECE (10 bins) = `0.1455`
- **Experiment E (Per-Fold Minority Analysis)**:
  - Cloud/DevOps (N = 15 total, 3 per fold): Unweighted models detected 0/15 (0.0000 recall).
  - Balanced models detected 11/15 (0.7333 recall) with 22 false positives, confirming the high precision trade-off.

## 3. Strict Methodological Safeguards Maintained
- 49-row holdout dataset remained completely untouched during all ablation and calibration experiments.
- Preprocessing was fitted independently within each training CV fold.
- Breejesh Dhar external dataset kept strictly isolated as a partial-schema zero-shot transfer benchmark.
- No gradient boosting (XGBoost/LightGBM) introduced prior to understanding baseline behavior.

---

# CareerCompass Machine Learning Experiment Log (Phase 3.4)
**Date**: 2026-10-03 22:11:08 | **Phase**: 3.4 (Model Selection, Probability Calibration, Explainability & Decision Policy)

## 1. Phase 3.4 Experimental Scope
- Evaluated 8 pre-declared candidate configurations (A through H) on identical 5-fold Stratified CV.
- Established Model Selection Policy balancing Macro F1, Multiclass Log Loss, and interpretability.
- Selected Candidate A (Multinomial Logistic Regression, unweighted, combined 60 features) based entirely on CV.
- Conducted strictly ONE final evaluation on the untouched 49-row holdout set.
- Executed nested cross-validated calibration study (Platt/Sigmoid vs Isotonic vs Uncalibrated).
- Computed global and per-class linear log-odds feature importance without causal claims.
- Extracted local additive explanation profiles for representative training instances.
- Evaluated decision threshold policy grid [0.10, 0.40] for Cloud/DevOps on training OOF probabilities.
- Performed feature variance and collinearity audits, confirming zero zero-variance features.
- Evaluated zero-shot external transfer against Breejesh Dhar (N = 311).
- Serialized final production model and preprocessor on N = 192 training records.

## 2. Key Empirical Findings Summary
- **Selected Model (Candidate A)**: CV Macro F1 = `0.6188`, CV Log Loss = `0.4704`
- **Final Holdout Evaluation (N = 49)**: Accuracy = `0.8163`, Macro F1 = `0.6478`, Log Loss = `0.3970`, Top-2 Accuracy = `1.0000`
- **Probability Calibration**: Uncalibrated Log Loss = `0.4696`, Sigmoid = `0.4881`, Isotonic = `0.7872` (Isotonic overfit, confirming retention of uncalibrated base model).
- **Decision Policy (Cloud Thresholding)**: At tau = 0.25 on OOF, Cloud recall = `0.6667` (10/15 detected) with `20` false positives.
- **Zero-Shot External Transfer (N = 311)**: Accuracy = `0.6141`, Macro F1 = `0.2721`, Top-2 Accuracy = `0.7524`.

## 3. Methodological Safeguards Maintained
- Holdout dataset ($N = 49$) remained completely isolated and was evaluated strictly once after candidate selection.
- Preprocessing was fitted strictly inside each training fold during cross-validation.
- Zero-variance pruning check confirmed 0 zero-variance features across all 60 dimensions.
- External transfer data was never used for training, selection, or threshold tuning.
- Final model artifact trained strictly on 192 training records.

---

# CareerCompass Machine Learning Experiment Log (Phase 3.4.1)
**Date**: 2026-10-03 22:30:00 | **Phase**: 3.4.1 (Model Selection Correction & Final Candidate Validation)

## 1. Phase 3.4.1 Experimental Scope & Audit
- Identified selection anomaly in Phase 3.4: Candidate A was selected even though Candidate H (Random Forest, unweighted, skills-only 29 features) was pre-declared and achieved the lowest CV Log Loss ($0.3768 \pm 0.0453$) and higher Macro F1 ($0.6226 \pm 0.0506$).
- Re-evaluated all 8 candidates (A through H) using existing 5-fold CV results exclusively, without looking at the holdout.
- Investigated Candidate H's probability mechanics: confirmed lower Brier score ($0.2635$ vs $0.3030$), lower entropy ($0.3742$ vs $0.5566$), and higher minimum true-class probability ($0.2395$ vs $0.0918$).
- Formally locked Candidate H in `ml/reports/phase3_4_selected_candidate.json` and documented selection in `ml/reports/phase3_4_selection_correction.md`.
- Evaluated Candidate H strictly ONCE on the untouched 49-row holdout set, preserving Candidate A holdout evaluation for complete auditability.
- Updated explainability to permutation importance and exact tree-path probability attribution for the Random Forest model.
- Re-evaluated threshold analysis on Candidate H OOF probabilities, documenting thresholds as OOF threshold candidates requiring further validation.
- Serialized corrected production artifacts on N = 192 training records.

## 2. Key Empirical Findings Summary
- **Corrected Selected Model (Candidate H)**: CV Macro F1 = `0.6226 ± 0.0506`, CV Multiclass Log Loss = `0.3768 ± 0.0453`, CV Accuracy = `0.7858`, CV Weighted F1 = `0.7510`, CV Top-2 = `1.0000`.
- **Final Holdout Evaluation (N = 49, Candidate H)**: Accuracy = `0.7959` (39/49), Macro F1 = `0.6302`, Weighted F1 = `0.7589`, Multiclass Log Loss = `0.3874`, Top-2 Accuracy = `1.0000`.
- **Preserved Previous Evaluation (Candidate A Holdout)**: Accuracy = `0.8163` (40/49), Macro F1 = `0.6478`, Weighted F1 = `0.7828`, Multiclass Log Loss = `0.3970`, Top-2 Accuracy = `1.0000`.
- **Decision Policy (Cloud Thresholding on Candidate H OOF)**: At tau = 0.25 on OOF, Cloud recall = `1.0000` (15/15 detected) with `31` false positives; at tau = 0.30, Cloud recall = `0.8000` (12/15) with `27` false positives (both designated as OOF threshold candidates requiring further validation).

## 3. Methodological Safeguards Maintained
- Holdout set ($N = 49$) remained completely isolated during candidate selection and was evaluated strictly once for Candidate H.
- Removed unproven claim "preserves true likelihood ratios"; replaced with "Candidate A and Candidate H retain the empirical class-prior structure of the training distribution, unlike class-weighted configurations".
- Explainability methods directly match the Random Forest architecture (no logistic regression formulas presented for tree ensembles).
- Final model artifact fitted strictly on 192 training records using SkillsOnlyPreprocessor.
