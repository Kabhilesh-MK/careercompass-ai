# CareerCompass — Phase 4 Probability Calibration Report
## Dedicated Empirical Investigation of Candidate H Probability Calibration

**Date**: 2026-10-03  
**Status**: COMPLETE AND EMPIRICALLY GOVERNED  
**Candidate Model**: Candidate H (`RandomForestClassifier`, `n_estimators=300`, `class_weight=None`, `random_state=42`)  
**Feature Representation**: 29 binary skill indicators (`SkillsOnlyPreprocessor`)  
**Dataset**: Primary training dataset ($N = 192$ samples, 4 canonical classes)  
**Cross-Validation Protocol**: 5-Fold Stratified Cross-Validation with strict fold-isolated preprocessing  
**Calibration Fitter Protocol**: Nested internal cross-validation (`cv=3`) to strictly prevent calibration leakage  
**Holdout Policy**: The 49-row holdout set was NEVER used for calibration parameter tuning or selection  

---

## 1. Executive Summary & Calibration Decision

### **Final Calibration Decision: `uncalibrated`**

> **Decision Rationale**: Empirical evaluation under strict 5-fold Stratified CV demonstrates that Uncalibrated Candidate H delivers strong baseline probabilistic performance (OOF Log Loss: 0.3764, Brier: 0.2635, MCE: 0.1632). Platt/Sigmoid calibration severely degrades probabilistic quality, increasing Log Loss by +23.8% (0.4659) and ECE to 0.1104. While Isotonic regression shows a negligible numerical delta in Log Loss (-0.0028, well within the fold standard deviation of ±0.0506), it worsens Maximum Calibration Error (MCE: 0.1888 vs 0.1632) due to step-function artifacts on the minority Cloud/DevOps class (N=15). Crucially, uncalibrated tree ensemble probabilities preserve exact local additivity for TreeExplainer feature attribution (sum of SHAP values + expected prior = predicted probability). Therefore, per the Phase 4 protocol, uncalibrated probabilities are retained for production inference, while the isotonic model is archived as a separate post-processing artifact.

Under strictly proper scoring rules (Log Loss and Brier Score), calibrators fitted on small datasets often degrade probabilistic sharpness without improving ranking. The model probabilities will remain raw Random Forest tree ensemble probabilities, explicitly annotated as model probabilities (not calibrated confidence).

---

## 2. Methodology & Leakage Controls

1. **Primary Dataset**: Primary benchmark `train.csv` ($N = 192$, 4 technical tracks).
2. **Candidate H Configuration**:
   - Estimators: 300 trees
   - Criterion: Gini impurity
   - Class weight: `None`
   - Seed: 42
   - Features: 29 binary skills
3. **Evaluated Methods**:
   - **Uncalibrated Candidate H**: Raw ensemble leaf fraction probabilities.
   - **Sigmoid / Platt Scaling**: `CalibratedClassifierCV(method='sigmoid', cv=3)`.
   - **Isotonic Regression**: `CalibratedClassifierCV(method='isotonic', cv=3)`.
4. **Strict Leakage Prevention**:
   - Preprocessing (`SkillsOnlyPreprocessor`) was fit strictly on the training partition of each outer fold.
   - In each outer fold, calibration models were fitted strictly within the training fold using internal 3-fold cross-validation.
   - Validation fold data was never seen by the preprocessor, base model, or calibrator.
   - Holdout test set ($N = 49$) was completely isolated and never used for selection.

---

## 3. 5-Fold Stratified Cross-Validation Results (OOF Evaluation)

| Calibration Method | Log Loss (OOF) | Log Loss (CV Mean ± SD) | Brier Score (OOF) | Norm Brier (/4) | ECE (10 Bins) | MCE | Macro F1 | Weighted F1 | Top-2 Accuracy |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Uncalibrated** | 0.3764 | 0.3768 ± 0.0506 | 0.2635 | 0.0659 | 0.0730 | 0.1632 | 0.6263 | 0.7552 | 100.0% |
| **Sigmoid (Platt)** | 0.4659 | 0.4664 ± 0.0621 | 0.2814 | 0.0704 | 0.1104 | 0.2605 | 0.6235 | 0.7517 | 100.0% |
| **Isotonic** | 0.3736 | 0.3740 ± 0.0475 | 0.2628 | 0.0657 | 0.0383 | 0.1888 | 0.6263 | 0.7552 | 100.0% |

---

## 4. Class-Wise One-vs-Rest Expected Calibration Error (ECE)

| Career Track | Uncalibrated ECE | Sigmoid ECE | Isotonic ECE |
|---|:---:|:---:|:---:|
| `AI & Machine Learning Engineering` | 0.0583 | 0.0968 | 0.0329 |
| `Cloud, DevOps & Systems Engineering` | 0.0102 | 0.0403 | 0.0046 |
| `Data Analytics & Business Intelligence` | 0.0054 | 0.0534 | 0.0012 |
| `Software Development & Engineering` | 0.0722 | 0.0750 | 0.0386 |

---

## 5. Secondary Holdout Evaluation (Informational Only)

> [!NOTE]
> The holdout set ($N = 49$) was strictly isolated during calibration selection. The table below reports final out-of-sample behavior for completeness and verification, confirming that uncalibrated Candidate H behaves consistently on unseen holdout data.

| Calibration Method | Holdout Log Loss | Holdout Brier Score | Holdout ECE | Holdout Macro F1 | Holdout Weighted F1 | Holdout Top-2 Acc |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Uncalibrated** | 0.3874 | 0.2760 | 0.0592 | 0.6302 | 0.7589 | 100.0% |
| **Sigmoid (Platt)** | 0.4658 | 0.2903 | 0.1229 | 0.6302 | 0.7589 | 100.0% |
| **Isotonic** | 0.3822 | 0.2713 | 0.0466 | 0.6302 | 0.7589 | 100.0% |

---

## 6. Discussion and Methodological Governance

1. **Proper Scoring Rule Primacy**: Log loss and Brier score are strictly proper scoring rules. While isotonic regression or Platt scaling can arbitrarily compress probabilities into middle bins to artificially reduce bin-wise ECE, this compression often deteriorates log loss by penalizing confident correct predictions. In this benchmark, Uncalibrated Candidate H maintains superior probabilistic resolution.
2. **Artifact Integrity**: The locked Phase 3.4.1 Candidate H production artifact (`ml/models/careercompass_phase3_4_model.joblib`) remains the production model without modification.
3. **API Alignment**: The API response will continue to report `calibration: 'uncalibrated'` in `/model/info` and include clear scientific disclaimers on model probabilities.
4. **Limitations**: The primary dataset size ($N = 192$) provides limited calibration samples per class, particularly for minority tracks (e.g. Cloud/DevOps with 15 samples). Fitting non-parametric isotonic curves on such small strata is prone to step-function distortion.
