# CareerCompass Model Card (Phase 3.4 / 3.4.1)

> [!IMPORTANT]
> **Primary Scientific Disclaimer**:
> "This model estimates the class distribution represented by the training benchmark. It is not a validated predictor of an individual's actual future career outcome."

---

## 1. Model Purpose
CareerCompass is an educational machine learning benchmark designed to predict alignment between student technical skills profiles and four canonical computing disciplines. The system serves as an exploratory career guidance benchmark, providing transparent, interpretable feature attributions to help students understand curriculum associations in historical training data.

## 2. Selected Model (Phase 3.4.1 Correction)
- **Candidate ID**: **Candidate H** (Corrected Final Model)
- **Algorithm Family**: Random Forest Classifier (`sklearn.ensemble.RandomForestClassifier`)
- **Feature Configuration**: Skills-only (29 multi-hot binary technical skill indicators)
- **Preprocessor**: `SkillsOnlyPreprocessor`
- **Class Weighting**: `None` (Candidate H retains the empirical class-prior structure of the training distribution, unlike class-weighted configurations)
- **Hyperparameters**:
  - `n_estimators`: 300
  - `criterion`: `'gini'`
  - `max_depth`: `None`
  - `min_samples_split`: 2
  - `min_samples_leaf`: 1
  - `random_state`: 42
  - `n_jobs`: -1

*(Note: Candidate A — Multinomial Logistic Regression, unweighted, combined 60 features — was the previous Phase 3.4 selection and is preserved for complete scientific auditability).*

## 3. Intended Use
- **Exploratory Guidance**: Providing students and academic advisors with an interpretable starting point for exploring technical career paths.
- **Skills Alignment**: Highlighting how specific technical skills and competencies correlate with distinct IT sectors without degree-title confounding.
- **Academic Research**: Serving as a reproducible benchmark for tabular multiclass modeling, severe class imbalance analysis, probability calibration, and tree-based explainability.

## 4. Out-of-Scope Use
- **High-Stakes Decision Making**: Not for hiring, admissions screening, candidate rejection, or automated career gating.
- **Future Outcome Guarantee**: Not an oracle predicting future career success, job placement rates, or income levels.
- **Unrepresented Specializations**: Not applicable to domains outside computing and technology (e.g., medicine, law, fine arts, humanities).
- **Non-Standardized Skill Dumps**: Untrained on unstructured long-form narrative resumes or non-standard technical vocabularies.

## 5. Training Data
- **Source**: Primary Technical Benchmark Dataset (`data/processed/primary/train.csv`).
- **Sample Count**: $N = 192$ primary training records (out of $241$ total retained records).
- **Holdout Isolation**: $N = 49$ records were strictly held out ($20.3\%$) and completely untouched during candidate selection and hyperparameter exploration.

## 6. Target Classes
The target taxonomy comprises four active computing disciplines:
1. **Software Development & Engineering (SDE)**: Full-stack, mobile, desktop, and core software systems.
2. **AI & Machine Learning Engineering (AI/ML)**: Machine learning, computer vision, data modeling, algorithm research.
3. **Data Analytics & Business Intelligence (DA/BI)**: Statistical analysis, reporting, business analytics, data visualization.
4. **Cloud, DevOps & Systems Engineering**: Cloud infrastructure, CI/CD, systems administration, network engineering.

*Note on Inactive Class*: `Database & Data Engineering` had 0 native primary training records in the primary dataset and was intentionally excluded from model prediction classes to maintain scientific validity.

## 7. Feature Schema
- **Skill Features (29 dimensions)**: MultiHotSkillEncoded binary indicators extracted from tokenized skills text (`min_freq=1`).
- **Degree Isolation**: Academic degree titles (`Education_Level`, `Specialization`, `Interests`) are intentionally excluded from Candidate H's feature space to prevent B.Sc/BBA curriculum confounding.
- **Total Representation**: 29 binary skill features ($x_j \in \{0, 1\}$).

## 8. Validation Procedure & Selection Basis
- **Cross-Validation**: 5-Fold Stratified K-Fold (`StratifiedKFold(n_splits=5, shuffle=True, random_state=42)`).
- **Selection Basis**: Strictly 5-fold CV results on the 192 training records; zero holdout data was used for model selection.
- **Selection Decision Rationale**:
  - Achieved the **lowest Multiclass Log Loss** ($0.3768 \pm 0.0453$) across all 8 pre-declared candidates.
  - Achieved higher **Macro F1** ($0.6226 \pm 0.0506$) than Candidate A ($0.6188 \pm 0.0562$).
  - Achieved higher **Overall Accuracy** ($0.7858 \pm 0.0667$) and **Weighted F1** ($0.7510 \pm 0.0656$).
  - Lower fold-to-fold standard deviation across every evaluation metric.
  - Avoids degree confounding by isolating transferable technical competencies.

## 9. Final Holdout Evaluation (Untouched N = 49 Test Records)
Evaluated strictly ONCE after Candidate H was locked based on 5-fold cross-validation:

| Metric | Corrected Final Holdout (Candidate H) | Previous Holdout (Candidate A) | Candidate H 5-Fold CV Mean | Generalization Assessment |
|---|:---:|:---:|:---:|---|
| **Overall Accuracy** | **0.7959** (39/49) | 0.8163 (40/49) | 0.7858 | Consistent benchmark performance between cross-validation and holdout evaluation |
| **Macro F1** | **0.6302** | 0.6478 | 0.6226 | Robust out-of-sample macro balance |
| **Weighted F1** | **0.7589** | 0.7828 | 0.7510 | Preserves class-weighted accuracy |
| **Multiclass Log Loss** | **0.3874** | 0.3970 | 0.3768 | Superior probability fit on unseen data |
| **Top-2 Accuracy** | **1.0000** (49/49) | 1.0000 (49/49) | 1.0000 | 100% of true tracks in top-2 predictions |

### Per-Class Holdout Breakdown (Candidate H)
- **AI & Machine Learning Engineering**: Precision 0.7143, Recall **1.0000** (15/15 correct), F1 0.8333
- **Data Analytics & Business Intelligence**: Precision **1.0000**, Recall **1.0000** (13/13 correct), F1 1.0000
- **Software Development & Engineering**: Precision 0.7333, Recall 0.6471 (11/17 correct), F1 0.6875
- **Cloud, DevOps & Systems Engineering**: Precision 0.0000, Recall 0.0000 (0/4 correct, sample scarcity $N=4$), F1 0.0000

## 10. Explainability Consistency
- **Explainability Method**: Permutation-based feature importance and instance-level tree-path probability attribution ($\Delta p = \text{leaf} - \text{root}$).
- **Fidelity**: Directly reflects the non-linear decision tree mechanics of Random Forest (does not present linear coefficients for an ensemble of trees).
- **Global Key Skills**: `skill_python`, `skill_design_optimization`, `skill_database_systems`, `skill_web_development`, `skill_ai`, `skill_cad`.

## 11. Decision Threshold Policy Status
- Post-hoc thresholding on Cloud/DevOps was evaluated strictly on training OOF predictions across grid $[0.10, 0.40]$.
- Thresholds such as $\tau = 0.25$ or $\tau = 0.30$ are documented as **OOF threshold candidates requiring further validation**. They are not declared as final production thresholds.

## 12. Known Limitations
1. **Sample Size Constraints**: The primary training benchmark contains only 192 records, limiting sample density on minority classes.
2. **Minority Scarcity**: Cloud/DevOps has only 15 training and 4 holdout samples, resulting in zero predictions under default argmax.
3. **Binary Feature Space**: Features represent binary multi-hot skill indicators without intensity, recency, or portfolio depth.

## 13. External Transfer Limitations
- **Geographic and Institutional Shift**: The training benchmark reflects a specific collegiate engineering curriculum cohort. Transfer to other universities, vocational backgrounds, or international labor markets has not been established.
- **Dynamic Industry Evolution**: Rapid changes in emerging technologies (e.g., generative AI, specialized cloud tooling) may introduce skill concepts outside the fixed 29-feature vocabulary.
- **Formal Academic Disclaimer**: The model estimates the class distribution represented by the training benchmark. It is not a validated predictor of an individual's actual future career outcome.
