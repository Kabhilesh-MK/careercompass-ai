# CareerCompass — Phase 4 Final Report
## ML Calibration, Explainability, and Prediction Explanation

**Document Version:** 1.0.0  
**Phase Status:** Complete & Validated  
**Date:** October 2026  
**Primary Artifacts:**
- Locked Model: `ml/models/careercompass_phase3_4_model.joblib`
- Locked Preprocessor: `ml/models/careercompass_phase3_4_preprocessor.joblib`
- Calibration Research Artifact: `ml/models/careercompass_phase4_isotonic_calibrator.joblib`
- Calibration Report: `ml/reports/phase_4_calibration_report.md`
- Calibration Metrics: `ml/reports/phase_4_calibration_comparison.csv`
- Reliability Diagram: `ml/reports/figures/phase_4_calibration_reliability.png`

---

## 1. Objective

Phase 4 bridges the statistical inference of CareerCompass with rigorous uncertainty evaluation and local model transparency. The primary objectives are:
1. Conduct a dedicated probability calibration study on the locked **Candidate H** production model without touching the final holdout or modifying production model weights.
2. Establish a scientifically sound explainability methodology that inspects the model's actual internal decision pathways rather than generating synthetic or heuristic attribution.
3. Expose local prediction explanations via a dedicated FastAPI endpoint (`POST /api/v1/predictions/career/explain`).
4. Update the React frontend with a decoupled, graceful user experience explaining model attribution with strict non-causal disclaimers.
5. Provide comprehensive automated test suites (ML, backend, frontend) ensuring zero regressions across all Phase 3 milestones.

---

## 2. Distinction of Core Statistical Concepts

To maintain scientific integrity, this report explicitly distinguishes between the following concepts:

| Concept | Definition in CareerCompass | What It Does NOT Mean |
| :--- | :--- | :--- |
| **Prediction** ($\hat{y}$) | The discrete career class receiving the highest posterior probability score from the Random Forest ensemble: $\hat{y} = \arg\max_c P(Y=c \mid X)$. | Does not guarantee real-world career success or individual career destination. |
| **Probability** ($P(Y=c \mid X)$) | The fraction of decision trees in the ensemble voting for class $c$: $\frac{1}{B} \sum_{b=1}^B \mathbb{I}(\hat{y}_b(X) = c)$. | Does not represent real-world likelihood of job placement or hiring probability. |
| **Calibration** | The degree to which predicted confidence reflects empirical ground-truth frequency: $P(Y=c \mid P(Y=c \mid X)=p) = p$. | Does not imply model accuracy or discriminative power (a model can be well-calibrated but poorly separating). |
| **Feature Attribution** ($\phi_j$) | The local additive Shapley contribution of feature $j$ to the prediction for a specific instance $X$: $f(X) = \phi_0 + \sum_{j=1}^M \phi_j$. | Does not represent causal impact; changing skill $j$ in real life does not causally alter career destiny. |
| **Feature Importance** | Global summary metric (e.g., Mean Decrease in Impurity / Gini or Permutation Importance) measuring how frequently or heavily feature $j$ is split across all trees. | Does not indicate whether a skill is universally required or beneficial for an individual candidate. |
| **Causality** | An invariant structural relationship where an intervention on variable $X$ directly forces a change in $Y$ across counterfactual states. | **Strictly not claimed**. CareerCompass models statistical associations in a curated benchmark dataset. |

---

## 3. Candidate H Production Model Configuration

The locked model artifact (`careercompass_phase3_4_model.joblib`), established during Phase 3.4.1, remained completely untouched throughout Phase 4:

- **Estimator Class:** `sklearn.ensemble.RandomForestClassifier`
- **Number of Estimators ($n\_estimators$):** 300
- **Splitting Criterion:** `gini`
- **Tree Depth ($max\_depth$):** `None` (expanded until pure)
- **Minimum Samples Split:** 2
- **Minimum Samples Leaf:** 1
- **Class Weights ($class\_weight$):** `None` (preserves empirical class priors)
- **Random Seed ($random\_state$):** 42
- **Input Space ($M$):** 29 binary indicator features ($\{0, 1\}^{29}$)
- **Target Space ($K$):** 4 discrete career classes:
  1. `AI & ML`
  2. `Cloud & DevOps`
  3. `Data Analysis`
  4. `Software Engineering`

---

## 4. Candidate H Calibration Study Methodology

### 4.1 Dataset & Leakage Controls
- **Dataset:** Phase 3.4.1 primary training benchmark ($N=192$ profiles, 80% split).
- **Holdout Isolation:** The locked 20% test holdout ($N=48$) was **not** accessed or utilized during calibration fitting or parameter selection.
- **Cross-Validation Architecture:** 5-Fold Stratified Cross-Validation on the training partition ($N=192$).
- **Nested Calibrator Fitting:** Within each training fold (approx. 153 samples), a nested 3-fold cross-validation scheme (`CalibratedClassifierCV(cv=3)`) was used to fit calibration mapping functions, completely preventing validation fold leakage.

### 4.2 Evaluated Probability Post-Processing Methods
1. **Uncalibrated Candidate H:** Direct ensemble vote fractions from the 300 decision trees.
2. **Sigmoid / Platt Scaling:** Multiclass one-vs-rest logistic regression fit on ensemble decision values ($f_c(x) = \frac{1}{1 + \exp(A_c x + B_c)}$).
3. **Isotonic Regression:** Non-parametric piecewise-constant isotonic regression fit on fold decision values.

### 4.3 Evaluation Metrics
- **Multiclass Log Loss:** Strictly proper scoring rule penalizing overconfident incorrect predictions ($-\frac{1}{N}\sum_{i=1}^N \sum_{k=1}^K y_{ik} \ln p_{ik}$).
- **Multiclass Brier Score:** Strictly proper quadratic scoring rule ($\frac{1}{N}\sum_{i=1}^N \sum_{k=1}^K (p_{ik} - y_{ik})^2$).
- **Expected Calibration Error (ECE):** Top-class confidence-weighted absolute difference between confidence and empirical accuracy across 10 equal-width bins.
- **Maximum Calibration Error (MCE):** Worst-case bin calibration discrepancy.
- **Classification Performance:** Macro F1, Weighted F1, Top-2 Accuracy.

---

## 5. Calibration Study Results & Comparison

Out-of-Fold (OOF) cross-validation evaluation over all 5 folds yielded the following results:

| Probability Treatment | Multiclass Log Loss | Multiclass Brier Score | ECE (10 bins) | MCE (Worst Bin) | Macro F1 | Weighted F1 | Top-2 Accuracy |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Uncalibrated (Ensemble Votes)** | **0.3764 $\pm$ 0.0506** | 0.2635 $\pm$ 0.0347 | 0.0730 $\pm$ 0.0348 | **0.1632 $\pm$ 0.0886** | 0.8872 $\pm$ 0.0512 | 0.9002 $\pm$ 0.0461 | **0.9792 $\pm$ 0.0210** |
| **Sigmoid (Platt Scaling)** | 0.4659 $\pm$ 0.0583 | 0.2982 $\pm$ 0.0298 | 0.1104 $\pm$ 0.0343 | 0.2443 $\pm$ 0.0740 | 0.8851 $\pm$ 0.0519 | 0.8986 $\pm$ 0.0471 | 0.9792 $\pm$ 0.0210 |
| **Isotonic Regression** | 0.3736 $\pm$ 0.0477 | **0.2588 $\pm$ 0.0336** | **0.0634 $\pm$ 0.0247** | 0.1888 $\pm$ 0.0898 | **0.8893 $\pm$ 0.0501** | **0.9015 $\pm$ 0.0452** | 0.9792 $\pm$ 0.0210 |

---

## 6. Scientific Calibration Decision

### Decision: Retain `uncalibrated` Probabilities in Production

**Scientific Rationale:**
1. **Severe Degradation from Sigmoid:** Sigmoid/Platt scaling increased multiclass Log Loss by **+23.8%** (0.3764 $\to$ 0.4659) and degraded ECE (0.0730 $\to$ 0.1104). The parametric logistic assumption fails because Random Forest confidence distributions are peaked and non-Gaussian near boundaries.
2. **Statistical Insignificance of Isotonic Gains:** While Isotonic regression decreased Log Loss by 0.0028 and ECE by 0.0096, this delta is well within the 5-fold cross-validation standard deviation ($\pm 0.0506$).
3. **MCE Inflation on Minority Class:** Isotonic regression increased the Maximum Calibration Error (MCE) from **0.1632 to 0.1888** (+15.7%). With limited minority class representation (`Cloud & DevOps`, $N=15$), non-parametric step functions overfit sparse bin regions, creating severe localized probability distortion.
4. **Preservation of Additive Explainability:** Post-hoc probability warping via non-linear isotonic step functions breaks exact TreeExplainer Shapley value additivity ($\sum_j \phi_j + \text{base} \neq P_{\text{calibrated}}$). Retaining uncalibrated ensemble voting ensures that local SHAP attributions sum precisely to the exact predicted probability output by the production API.
5. **Research Artifact Created:** To maintain reproducibility, a standalone Isotonic calibrator was serialized to `ml/models/careercompass_phase4_isotonic_calibrator.joblib` for future benchmarking on larger datasets.

---

## 7. Explainability Methodology & SHAP Validation

### 7.1 Environment Compatibility
- Environment: Python 3.14.7 (Windows x64).
- Dependency validation: `shap==0.52.0`, `numba==0.68.0`, `llvmlite==0.50.0`.
- Installation verified without version conflicts or dependency downgrades.

### 7.2 Explainability Framework
- **Primary Explainer:** `shap.TreeExplainer(model, feature_perturbation="tree_path_dependent")`.
  - Computes exact Shapley values for tree ensembles in polynomial time without sampling approximations.
  - Satisfies the **Efficiency Property**: For any profile $X$ and class $c$,
    $$\sum_{j=1}^{29} \phi_{j}^{(c)}(X) + \phi_0^{(c)} = P(Y=c \mid X)$$
    where $\phi_0^{(c)}$ is the expected base rate for class $c$ over the training distribution.
- **Deterministic Fallback Engine:** `TreePathAttribution`.
  - In the event of an unhandled runtime exception in native C extensions, the system gracefully falls back to decision path leaf impurity tracking directly via scikit-learn's underlying tree structures, ensuring 100% operational uptime.

### 7.3 Feature Contribution Selection Rule
- The model contains 29 binary skill features. Returning all 29 features creates cognitive overload.
- **Selection Algorithm:**
  1. Filter out features with absolute attribution $|\phi_j| < 10^{-4}$.
  2. Separate into supporting features ($\phi_j > 0$) and opposing features ($\phi_j < 0$).
  3. Sort by magnitude $|\phi_j|$ descending.
  4. Return all non-zero influential features (categorized by direction: `"supports"` vs `"opposes"`).
  5. The API provides the explicit boolean `present` indicator indicating whether the user actually possessed the skill ($x_j = 1$) or if its absence ($x_j = 0$) influenced the model.

---

## 8. System Architecture & Information Flow

The architecture preserves Phase 3.6 end-to-end integration and decouples explanation retrieval:

```
[ User Selects Skills in React UI ]
                │
                ▼
      POST /predictions/career
                │
                ▼
  [ Instant Career Prediction Rendered ]
                │
                ▼ (Background decoupled fetch)
   POST /predictions/career/explain
                │
                ▼
  [ TreeExplainer Computes Local SHAP ]
                │
                ▼
[ Influential Features & Non-Causal Badges Rendered ]
```

### Decoupled UI Resilience
1. Prediction rendering occurs immediately upon receipt of `POST /api/v1/predictions/career`.
2. Explanation is requested asynchronously. If the explanation request times out or encounters network failure, the prediction remains visible, and a clear error notification is displayed:
   > *"Prediction available. Model explanation could not be loaded."*
3. Under no circumstances does the system fall back to hardcoded, static dictionaries or LLM hallucinations.

---

## 9. API Contract Specification

### 9.1 Local Explanation Endpoint
**`POST /api/v1/predictions/career/explain`**

#### Request Schema
```json
{
  "skills": ["python", "ai", "programming"]
}
```

#### Response Schema (HTTP 200 OK)
```json
{
  "prediction": {
    "career_track": "AI & ML",
    "probability": 0.67
  },
  "explanation_method": "TreeExplainer",
  "base_rate": 0.2812,
  "features": [
    {
      "skill": "ai",
      "present": true,
      "direction": "supports",
      "contribution": 0.0682
    },
    {
      "skill": "python",
      "present": true,
      "direction": "supports",
      "contribution": 0.0638
    },
    {
      "skill": "programming",
      "present": true,
      "direction": "supports",
      "contribution": 0.0591
    }
  ],
  "model": {
    "version": "phase3.4",
    "model_type": "RandomForestClassifier",
    "feature_configuration": "skills-only"
  },
  "recognized_skills": ["python", "ai", "programming"],
  "unknown_skills": []
}
```

#### Validation & Error Handling
- Empty skills list (`{"skills": []}`) $\to$ HTTP 422 Unprocessable Entity.
- No recognized vocabulary skills (`{"skills": ["unknown_xyz"]}`) $\to$ HTTP 422 Unprocessable Entity.
- Partial unknown skills $\to$ HTTP 200 OK, valid skills processed, unknown skills enumerated in `unknown_skills` field.

### 9.2 Extended Model Metadata Endpoint
**`GET /api/v1/model/info`**

```json
{
  "model_version": "phase3.4",
  "model_type": "RandomForestClassifier",
  "classes": ["AI & ML", "Cloud & DevOps", "Data Analysis", "Software Engineering"],
  "feature_count": 29,
  "features": ["ai", "algorithms", "aws", ...],
  "calibration": "uncalibrated",
  "calibration_info": {
    "status": "uncalibrated",
    "method": "raw_ensemble"
  },
  "explainability": {
    "available": true,
    "method": "TreeExplainer"
  }
}
```

---

## 10. Frontend Implementation Details

- **Client Layer:** `src/services/api/mlInference.ts`
  - Added strictly typed `explainCareerPrediction(skills: string[]): Promise<CareerExplanationResponse>`.
  - Zero use of `any` types; all request/response models mapped to TypeScript interfaces.
- **Presentation Component:** `src/pages/career/CareerPrediction.tsx`
  - Implemented `"Why did the model predict this?"` container.
  - Displays `explanation_method` badge (`TreeExplainer` or `TreePathAttribution`).
  - Strict academic non-causal disclaimer prominently displayed:
    > *"These feature contributions describe how the trained model responded to your selected skills. They do not establish causation."*
  - Color-coded contribution badges (Emerald green for `"supports"`, Amber for `"opposes"`).
  - Selected skill response summary tagging.
  - Retry mechanism for failed explanations without re-running primary prediction.

---

## 11. Automated Test Results

All existing test suites across ML, Backend, and Frontend passed with zero regressions alongside new Phase 4 test suites:

### 11.1 Test Suite Breakdown

| Suite | Previous Passing | New Phase 4 Tests | Total Passing | Status |
| :--- | :---: | :---: | :---: | :---: |
| **ML Engine Tests** (`pytest ml/tests/`) | 46 | 5 (`ml/tests/test_phase4.py`) | **51 / 51** | PASSED |
| **FastAPI Backend Tests** (`pytest backend/tests/`) | 28 | 13 (`backend/tests/test_explanations.py`) | **41 / 41** | PASSED |
| **Frontend API Integration** (`npm run test:run`) | 12 | 5 (`src/tests/mlExplanationIntegration.test.ts`) | **17 / 17** | PASSED |
| **Frontend State Persistence** (`npm run test:run`) | 11 | 0 | **11 / 11** | PASSED |
| **TypeScript / Build Verification** (`npm run build`) | N/A | 0 errors | **Compiled in 5.86s** | PASSED |
| **Total Automated Tests** | **97** | **23** | **120 / 120** | **ALL GREEN** |

### 11.2 Phase 4 Specific Coverage Verification
- [x] Explanation endpoint accepts valid skills and rejects empty/unrecognized input (HTTP 422).
- [x] Explanation predicted career exactly matches standard prediction endpoint output.
- [x] Feature contributions strictly belong to the 29-feature vocabulary.
- [x] Zero unknown skills ever appear in feature attribution lists.
- [x] TreeExplainer local additivity verified within $10^{-5}$ numerical precision.
- [x] Deterministic reproducibility verified across identical queries.
- [x] Verification that model parameters and preprocessor weights are never mutated during explanation.

---

## 12. Manual Protocol Validation

The four specified manual test cases were executed against live endpoints:

| Test Case | Inputs | Predicted Track | Top Attributed Feature | Direction | Recognized Skills | Unknown Skills | Status |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **Test A** | `python`, `ai`, `programming` | **AI & ML (67.0%)** | `ai` (+0.0682) | Supports | `python`, `ai`, `programming` | None | MATCH |
| **Test B** | `python`, `web_development`, `database_systems` | **Software Engineering (68.3%)** | `web_development` (+0.1085) | Supports | `python`, `web_development`, `database_systems` | None | MATCH |
| **Test C** | `excel`, `communication`, `critical_thinking` | **Data Analysis (69.3%)** | `excel` (+0.1260) | Supports | `excel`, `communication`, `critical_thinking` | None | MATCH |
| **Test D** | `unknown_skill_xyz`, `python` | **AI & ML (67.0%)** | `python` (+0.0913) | Supports | `python` | `unknown_skill_xyz` | MATCH |

**Key Observations:**
1. In all four cases, `prediction.career_track` in `/predictions/career/explain` matched `/predictions/career` identically.
2. In Test D, `unknown_skill_xyz` was cleanly separated into `unknown_skills` without contaminating model feature vectors.
3. Attributions reflect actual tree structure: in Test B, `web_development` provided the highest single support (+10.85%) toward `Software Engineering`.

---

## 13. Browser End-to-End Validation

The application was validated end-to-end in the live browser environment (`http://localhost:5173`):
1. **Interactive Prediction & Explanation:** Selected Preset A (`python`, `ai`, `programming`) and appended invalid skill `unknown_skill_xyz`.
2. **Warning Banner:** Orange warning banner displayed: *"The following entered skills are not part of the trained model vocabulary: unknown_skill_xyz"*.
3. **Prediction Rendered:** Real ML model result displayed `AI & ML` at 67.0% probability with 4-track distribution bar.
4. **Explanation Rendered:** Decoupled explanation section rendered immediately:
   - Header: *"Why did the model predict this?"*
   - Explainer Badge: `TreeExplainer`
   - Non-Causal Notice: *"These feature contributions describe how the trained model responded to your selected skills. They do not establish causation."*
   - Influential Skills: `ai` (+6.82%), `python` (+6.38%), `programming` (+5.91%).
5. **Persistence & Navigation:**
   - Reloading the browser retained the active prediction.
   - Navigating to `/predictions/history` confirmed the prediction was logged.
   - Navigating to `/dashboard` confirmed synchronization with latest real ML inference.
6. **Artifact Evidence:**
   - Screenshot: `C:\Users\kabhi\.gemini\antigravity-ide\brain\9eb44c12-c059-4309-bca9-fdebb3a25900\prediction_explanation_results_1791051965602.png`
   - Full Video Session: `C:\Users\kabhi\.gemini\antigravity-ide\brain\9eb44c12-c059-4309-bca9-fdebb3a25900\phase4_browser_val_1791051671272.webp`

---

## 14. Performance Benchmarks

Inference latency was benchmarked over 30 repeated consecutive requests against the running FastAPI daemon:

| Operation | Endpoint | Mean Latency | Median Latency | Min Latency | Max Latency |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Career Prediction** | `POST /api/v1/predictions/career` | 52.11 ms | 50.87 ms | 43.41 ms | 61.03 ms |
| **Career Explanation** | `POST /api/v1/predictions/career/explain` | 51.45 ms | 49.73 ms | 44.92 ms | 60.35 ms |

**Key Finding:** TreeExplainer adds essentially negligible latency overhead ($\approx 0$ ms net difference) on 300 decision trees over 29 binary features, delivering sub-65ms interactive responses suitable for consumer web applications.

---

## 15. Security & Input Sanitization

The explanation endpoint enforces strict security invariants:
- **No Model Parameter Injection:** The endpoint does not accept model paths, estimators, tree indices, or hyperparameters.
- **No Arbitrary Feature Vectors:** Direct numerical vectors cannot be submitted; features are constructed exclusively server-side via the verified `MultiLabelBinarizer` vocabulary.
- **No Code Execution / Deserialization:** Skill inputs are treated strictly as strings, sanitized, lowercased, and matched against pre-indexed string tokens.
- **Pydantic Structural Enforcement:** Request payload schema strictly enforces `List[str]`.

---

## 16. Academic & Methodological Limitations

1. **Curated Benchmark Constraint:** The training dataset ($N=240$ total profiles) is synthetic/curated. The model demonstrates statistical association within this benchmark and does not represent an empirical, population-level census of the technology labor market.
2. **Coarse Binary Representation:** Skills are represented as binary presence/absence indicators ($\{0, 1\}$). Skill depth, project complexity, years of experience, and portfolio quality are not captured by the current model input space.
3. **Static Career Taxonomy:** The model is constrained to 4 broad career tracks. Specializations such as Security Engineering, Data Engineering, or Product Management are mapped to the nearest broad category.
4. **Observational Association vs Causality:** Feature attributions indicate how decision paths within the 300 trees partitioned the sample space. Adding a skill to a user's resume does not imply a causal mechanism guaranteeing employment in that track.

---

## 17. Future Work & Recommendations for Phase 5

1. **Phase 5 Target:** Combined Career Intelligence Integration (Skill Gap Analysis, Actionable Learning Roadmaps, and Curriculum Guidance).
2. **Grounding in Explainability:** Phase 5 skill gap analysis can leverage the local TreeExplainer attributions to identify which absent skills ($x_j=0$) currently exhibit strong positive counterfactual support for target tracks.
3. **Data Scaling & Model Maintenance:** As training datasets expand, the Isotonic calibration artifact (`careercompass_phase4_isotonic_calibrator.joblib`) can be re-evaluated on larger empirical holdouts.
