# CareerCompass — Phase 5 Final Report
## Career Intelligence Engine: Skill Ontology, Gap Analysis, Progressive Roadmap, Learning Recommendations & State Persistence

**Document Version:** 1.0.0  
**Phase Status:** Complete & Validated  
**Date:** October 2026  
**Target Audience:** Academic Evaluators, ML Engineers, System Architects  
**Primary Artifacts:**
- Locked Model: `ml/models/careercompass_phase3_4_model.joblib` (Unchanged Candidate H)
- Locked Preprocessor: `ml/models/careercompass_phase3_4_preprocessor.joblib` (Unchanged 29-feature vocabulary)
- Ontology Service: `backend/app/services/career_ontology.py`
- Skill Gap Engine: `backend/app/services/skill_gap_service.py`
- Roadmap Engine: `backend/app/services/roadmap_service.py`
- Learning Recommendation Engine: `backend/app/services/learning_recommendation_service.py`
- Orchestrator Service: `backend/app/services/career_intelligence_service.py`
- Backend API Router: `backend/app/api/routes/career_intelligence.py`
- Frontend API Client: `src/services/api/careerIntelligence.ts`
- Upgraded Pages:
  - `/skills/gap`: `src/pages/skills/SkillGapView.tsx`
  - `/roadmap`: `src/pages/roadmap/Roadmap.tsx`
  - `/progress`: `src/pages/progress/LearningProgress.tsx`
  - `/learning`: `src/pages/learning/LearningHub.tsx`
- Integration Tests:
  - Backend: `backend/tests/test_career_intelligence.py`
  - Frontend: `src/tests/careerIntelligenceIntegration.test.ts`

---

## 1. Objective

Phase 5 delivers an end-to-end Career Intelligence Engine for CareerCompass. It transforms raw student competencies into structured, actionable career progression plans by uniting two distinct and complementary pillars:

1. **Statistical ML Inference:** The locked Candidate H Random Forest classifier generates non-calibrated advisory class probabilities across 4 canonical career tracks.
2. **Authoritative Skill Ontology:** A curated, normative competency framework translates candidate skill vectors into deterministic skill gaps, mathematical coverage metrics, prerequisite-aware milestones, and catalog-backed learning recommendations.

The primary objective is to maintain academic defensibility by clearly separating what is learned statistically from training data from what is structured normatively via domain ontology.

---

## 2. System Architecture

The Career Intelligence Engine operates as a pipeline with strict separation of concerns:

```
                      USER SELECTED SKILLS
                               │
                               ▼
                     ┌───────────────────┐
                     │ CareerCompass ML  │
                     │  Candidate H RF   │
                     └─────────┬─────────┘
                               │
                       Predicted Track
                               │
                               ▼
                 ┌───────────────────────────┐
                 │   Career Skill Ontology   │
                 │  Curated Track Framework  │
                 └─────────────┬─────────────┘
                               │
                ┌──────────────┼──────────────┐
                ▼              ▼              ▼
          Present Skills  Missing Skills   Coverage
                               │
                               ▼
                     Priority Gap Analysis
                               │
                               ▼
                       Learning Resources
                               │
                               ▼
                        Career Roadmap
                               │
                               ▼
                       Progress Tracking
```

### Architectural Services:
- `ModelService` (Singleton): Loads and evaluates Candidate H Random Forest.
- `PredictionService`: Handles 29-skill token normalization, unknown token auditing, and probability formatting.
- `CareerOntologyService`: Houses authoritative competency structures, priority tiers, prerequisite graphs, and roadmap stages for the 4 tracks.
- `SkillGapService`: Computes present/missing skill partitions, transparent coverage ratios, and deterministic gap priorities.
- `RoadmapService`: Generates 5-stage progressive milestones with dependency flags and completion states.
- `LearningRecommendationService`: Matches prioritized gaps to curated, catalog-backed educational modules.
- `CareerIntelligenceService`: Master orchestrator coordinating inference and ontology synthesis.

---

## 3. Career Taxonomy & Governance Bounds

The project operates under strict ML governance rules:
- **Locked Classifier:** `RandomForestClassifier(n_estimators=300, criterion='gini', class_weight=None, random_state=42)`
- **Input Dimension:** Exactly 29 binary indicator features ($\{0, 1\}^{29}$).
- **Output Classes (4 canonical tracks):**
  1. `AI & Machine Learning Engineering`
  2. `Cloud, DevOps & Systems Engineering`
  3. `Data Analytics & Business Intelligence`
  4. `Software Development & Engineering`
- **Class Non-Inclusion:** `Database & Data Engineering` is excluded because the primary benchmark dataset contains zero native training samples.
- **Model Freezing:** No retraining, parameter modification, or secondary classifiers were introduced.

---

## 4. Ontology Design & Competency Framework

### Methodological Distinction: Curated Knowledge vs Learned Weights
The ontology represents **curated domain engineering standards**, not statistical associations mined by the classifier. The classifier answers: *"Which track best correlates with these co-occurring skills in the training benchmark?"* The ontology answers: *"What competencies, prerequisites, and stages are required to practice professionally in this domain?"*

### Canonical Vocabulary Compliance:
Every skill in every track ontology is strictly drawn from the model's fitted 29-skill vocabulary:
`['ai', 'autocad', 'cad', 'cloud', 'communication', 'critical_thinking', 'data_analysis', 'database_design', 'database_systems', 'design', 'design_optimization', 'excel', 'experimentation', 'lab_work', 'machine_learning', 'matlab', 'negotiation', 'observation', 'plc', 'power_analysis', 'programming', 'pscad', 'python', 'recording', 'research', 'sales', 'simulation', 'team_management', 'web_development']`.

### Track Specifications:

#### 1. Software Development & Engineering
- **Core Skills:** `programming`, `python`, `database_systems`, `database_design`, `web_development`
- **Supporting Skills:** `critical_thinking`, `cloud`, `design`, `team_management`
- **Advanced Skills:** `design_optimization`, `simulation`
- **Prerequisites:**
  - `python` $\leftarrow$ `programming`
  - `database_systems` $\leftarrow$ `programming`
  - `database_design` $\leftarrow$ `database_systems`
  - `web_development` $\leftarrow$ `programming`
  - `cloud` $\leftarrow$ `programming`
  - `design_optimization` $\leftarrow$ `design`
  - `simulation` $\leftarrow$ `programming`

#### 2. AI & Machine Learning Engineering
- **Core Skills:** `programming`, `python`, `data_analysis`, `machine_learning`, `ai`
- **Supporting Skills:** `database_systems`, `cloud`, `critical_thinking`, `research`
- **Advanced Skills:** `experimentation`, `simulation`, `design_optimization`
- **Prerequisites:**
  - `python` $\leftarrow$ `programming`
  - `data_analysis` $\leftarrow$ `python`
  - `database_systems` $\leftarrow$ `programming`
  - `machine_learning` $\leftarrow$ `python`, `data_analysis`
  - `ai` $\leftarrow$ `machine_learning`
  - `experimentation` $\leftarrow$ `data_analysis`
  - `simulation` $\leftarrow$ `machine_learning`
  - `design_optimization` $\leftarrow$ `machine_learning`

#### 3. Data Analytics & Business Intelligence
- **Core Skills:** `excel`, `database_systems`, `data_analysis`, `python`, `communication`
- **Supporting Skills:** `database_design`, `critical_thinking`, `research`, `team_management`
- **Advanced Skills:** `machine_learning`, `negotiation`
- **Prerequisites:**
  - `database_design` $\leftarrow$ `database_systems`
  - `data_analysis` $\leftarrow$ `excel`
  - `python` $\leftarrow$ `data_analysis`
  - `machine_learning` $\leftarrow$ `python`, `data_analysis`
  - `negotiation` $\leftarrow$ `communication`
  - `team_management` $\leftarrow$ `communication`

#### 4. Cloud, DevOps & Systems Engineering
- **Core Skills:** `programming`, `python`, `cloud`, `database_systems`
- **Supporting Skills:** `web_development`, `database_design`, `critical_thinking`, `team_management`
- **Advanced Skills:** `simulation`, `design_optimization`
- **Prerequisites:**
  - `python` $\leftarrow$ `programming`
  - `database_systems` $\leftarrow$ `programming`
  - `database_design` $\leftarrow$ `database_systems`
  - `cloud` $\leftarrow$ `programming`
  - `web_development` $\leftarrow$ `programming`
  - `simulation` $\leftarrow$ `cloud`
  - `design_optimization` $\leftarrow$ `cloud`

---

## 5. Skill-Gap Methodology

The gap analysis partitions user input skills against the active target track requirements:
- Let $R$ denote the set of required skills defined in the ontology for track $T$.
- Let $S_{\text{rec}}$ denote the set of user-provided skills recognized by the 29-feature vocabulary.
- **Present Required Skills ($P$):** $P = R \cap S_{\text{rec}}$
- **Missing Required Skills ($M$):** $M = R \setminus S_{\text{rec}}$

### Target Source Handling:
- When `target_career_track` is omitted: The ML model evaluates $S_{\text{rec}}$, and the argmax track becomes target $T$ with `target_source = "model_prediction"`.
- When `target_career_track` is specified by the candidate: $T$ is adopted as planning target with `target_source = "user_selected"`. An advisory ML prediction is generated concurrently and preserved in the response for comparison.

---

## 6. Coverage Metric & Mathematical Formulation

The system avoids misleading terms like "Career Suitability" or "Confidence Score" for gap metrics. Instead, it provides a transparent mathematical ratio:

$$\text{Coverage}_{\text{decimal}} = \frac{|P|}{|R|} = \frac{\sum_{s \in R} \mathbb{I}(s \in S_{\text{rec}})}{|R|}$$

$$\text{Coverage}_{\text{percentage}} = \text{Coverage}_{\text{decimal}} \times 100$$

Where:
- $|P|$ is `present_count` (verified skills in track).
- $|R|$ is `required_count` (total ontology requirements for the track).
- Decimal is rounded to 4 places, percentage to 1 decimal place.

---

## 7. Priority Methodology

Skill gap prioritization is deterministic and rule-derived:
1. **Tier Ordering:** `core` (Priority 1) $>$ `supporting` (Priority 2) $>$ `advanced` (Priority 3).
2. **Prerequisite Resolution:** A skill is marked `prerequisites_met = true` if and only if all prerequisite tokens belong to $S_{\text{rec}}$.
3. **Curricular Sequencing:** Missing skills with satisfied prerequisites appear before skills blocked by unacquired prerequisites, respecting the ontology's `recommended_learning_order`.

---

## 8. 5-Stage Roadmap Methodology

Every roadmap generates discrete milestones across five standardized progression stages:
- **Stage 1 — Foundations:** Core programming, computational scripting, and basic toolchains.
- **Stage 2 — Core Competencies:** Relational databases, web architectures, and exploratory data analysis.
- **Stage 3 — Applied Systems & Engineering:** Cloud compute, applied AI/ML algorithms, and analytical reasoning.
- **Stage 4 — Advanced Methods & Optimization:** High-throughput tuning, controlled experimentation, and simulations.
- **Stage 5 — Career Projects & Capstone Preparation:** Cross-functional leadership, negotiation, and system ownership.

Status transitions:
- Initial status: `completed` if skill is in $S_{\text{rec}}$, otherwise `not_started`.
- User interactive statuses: `not_started`, `in_progress`, `completed`.
- Completion formula:
  $$\text{Roadmap Completion} = \frac{\text{Completed Milestones}}{\text{Total Milestones}}$$

---

## 9. Learning Recommendation Methodology

Recommendations connect directly to a curated catalog of verified courses, specializations, and simulations.
- Matches are keyed to missing canonical skills.
- Catalog items specify provider (Coursera, DataCamp, Pluralsight, Forage, edX), estimated effort, difficulty level, and associated roadmap stage.
- Zero synthetic web scraping or LLM-generated URLs are used.

---

## 10. Progress Tracking Methodology

Progress analytics track task completion, not statistical proficiency:
- Metric 1: **Roadmap Milestone Completion** (ratio of completed roadmap items to total items).
- Metric 2: **Required Skill Coverage** (ratio of present required skills to track requirements).
- Metric 3: **Catalog Course Engagement** (enrolled and finished modules).
- Explicit terminology: "Completed roadmap skills" and "Verified competency count", strictly avoiding claims like "85% proficient".

---

## 11. Backend API Specification

### Endpoint: `POST /api/v1/career/intelligence`
- **Request Body:**
  ```json
  {
    "skills": ["python", "programming", "ai"],
    "target_career_track": null
  }
  ```
- **Response Structure (HTTP 200):**
  ```json
  {
    "target_career_track": "AI & Machine Learning Engineering",
    "target_source": "model_prediction",
    "prediction": {
      "career_track": "AI & Machine Learning Engineering",
      "probability": 0.67,
      "alternatives": [...],
      "probabilities": [...]
    },
    "recognized_skills": ["python", "ai", "programming"],
    "unknown_skills": [],
    "required_skills": ["programming", "python", "data_analysis", "database_systems", "machine_learning", "ai", ...],
    "present_required_skills": ["programming", "python", "ai"],
    "missing_required_skills": ["data_analysis", "database_systems", "machine_learning", ...],
    "required_skill_coverage": {
      "decimal": 0.25,
      "percentage": 25.0,
      "present_count": 3,
      "required_count": 12
    },
    "prioritized_gaps": [
      {
        "skill": "data_analysis",
        "priority": "core",
        "category": "core",
        "reason": "Feature engineering and dataset preprocessing foundation.",
        "prerequisites": ["python"],
        "prerequisites_met": true,
        "recommended_order": 1
      }
    ],
    "roadmap": [...],
    "learning_recommendations": [...],
    "model": {
      "version": "phase3.4",
      "model_type": "RandomForestClassifier",
      "feature_configuration": "skills-only"
    }
  }
  ```
- **Error Codes:**
  - 422: Empty skills list, invalid track override, or zero recognized skills with omitted target.
  - 503: Model service unavailable.
  - 500: Internal server error.

### Endpoint: `GET /api/v1/career/ontology`
Returns complete competency frameworks, metadata, stages, and prerequisites for all four ML-supported tracks.

---

## 12. Frontend Integration & State Persistence

- **Typed Client:** `src/services/api/careerIntelligence.ts` exposes `evaluateCareerIntelligence` and `getCareerOntology` with robust error mapping.
- **Centralized Reducer:** `src/context/AppStateReducer.ts` handles:
  - `SET_CAREER_INTELLIGENCE`: Saves evaluated intelligence and initializes milestone progress.
  - `SET_CAREER_TARGET_OVERRIDE`: Allows switching target track without overwriting ML prediction.
  - `UPDATE_INTELLIGENCE_ROADMAP_STATUS`: Toggles milestone progress (`not_started`, `in_progress`, `completed`).
- **Persistence:** Saved automatically to `localStorage` under `careercompass_student_state` envelope with version validation.

---

## 13. Test Results & Quality Assurance

### Backend Test Suite (`pytest backend/tests`):
- **Total Tests:** 55 passed in 1.65 seconds
  - `backend/tests/test_career_intelligence.py`: 14 passed (Phase 5)
  - `backend/tests/test_predictions.py`: 14 passed (Phase 3.5)
  - `backend/tests/test_explanations.py`: 13 passed (Phase 4)
  - `backend/tests/test_model_loading.py`: 9 passed (Phase 3.4)
  - `backend/tests/test_health.py`: 5 passed (System)

### Frontend Test Suite (`npm test`):
- **Total Integration Tests:** 43 passed
  - Phase 3.6 ML Inference Client Suite: 12 tests passed
  - Phase 4 ML Explanation Suite: 5 tests passed
  - UI State Management & Persistence Suite: 11 tests passed
  - Phase 5 Career Intelligence Suite: 15 tests passed

### Compilation & Build:
- `npm run typecheck`: **0 errors** (Clean TypeScript compilation)
- `npm run build`: **0 errors** (Production bundle generated in 5.87s)

---

## 14. Manual Verification Matrix

| Case | Submitted Skills | Target Track Override | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Case A** | `python`, `ai`, `programming` | None (Omitted) | ML Prediction $\rightarrow$ `AI & Machine Learning Engineering`; Target Source $\rightarrow$ `model_prediction`; Coverage $\rightarrow$ 25.0% | ML Prediction: AI/ML (p=0.67), Target: AI/ML, Source: `model_prediction`, Coverage: 25.0% | **PASS** |
| **Case B** | `python`, `web_development`, `database_systems` | None (Omitted) | ML Prediction $\rightarrow$ `Software Development & Engineering`; Target Source $\rightarrow$ `model_prediction`; Coverage $\rightarrow$ 27.3% | ML Prediction: SDE (p=0.679), Target: SDE, Source: `model_prediction`, Coverage: 27.3% | **PASS** |
| **Case C** | `excel`, `communication`, `critical_thinking` | None (Omitted) | ML Prediction $\rightarrow$ `Data Analytics & Business Intelligence`; Target Source $\rightarrow$ `model_prediction`; Coverage $\rightarrow$ 27.3% | ML Prediction: Data/BI (p=1.0), Target: Data/BI, Source: `model_prediction`, Coverage: 27.3% | **PASS** |
| **Case D** | `unknown_skill_xyz`, `python` | None (Omitted) | `python` recognized; `unknown_skill_xyz` partitioned to unknown skills; inference executes cleanly | Recognized: `['python']`, Unknown: `['unknown_skill_xyz']`, Prediction executed | **PASS** |
| **Case E** | `[]` (Empty) | None | HTTP 422 Unprocessable Entity | HTTP 422: `skills list cannot be empty` | **PASS** |
| **Case F** | `python`, `ai`, `programming` | `Software Development & Engineering` | Planning Target becomes SDE; Target Source $\rightarrow$ `user_selected`; ML prediction preserved separately as AI/ML | Target: SDE, Source: `user_selected`, ML Prediction: AI/ML (p=0.67), Coverage: 18.2% | **PASS** |

---

## 15. Limitations & Boundary Conditions

1. **Binary Skill Abstraction:** The model and ontology operate strictly on skill presence/absence ($x_i \in \{0, 1\}$). Individual depth of expertise or years of practice are not modeled by binary features.
2. **Deterministic Prerequisite Modeling:** Prerequisite relationships reflect standard computer science curricula. They are normative recommendations, not physical prerequisites.
3. **Uncalibrated Model Probabilities:** Model probability scores are raw Random Forest ensemble voting frequencies and should not be interpreted as absolute likelihoods of hiring.
4. **Scope of Canonical Vocabulary:** Skills outside the 29-feature set (e.g., specific libraries like PyTorch or Tailwind) are cleanly partitioned into unknown skills and excluded from the inference matrix.

---

## 16. Governance & Ethics Statements

- **Advisory Role:** CareerCompass provides formative educational guidance. Prediction is an advisory suggestion, not an algorithmic directive.
- **No Profiteering Course Links:** Catalog learning resources are curated benchmarks; no commercial affiliate links or sponsored placements exist.
- **Strict Anti-Fabrication Guarantee:** The system never synthesizes fake skills, never overrides user track selections silently, and never falls back to mock probabilities on backend failure.
