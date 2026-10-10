# CareerCompass AI — Technical Appendix
## Comprehensive Engineering Specifications, Benchmark Results, API Contracts, and Deployment Runbooks

---

**System**: CareerCompass AI — AI-Powered Career Intelligence System  
**Document**: Technical Appendix (Phase 8 Submission Package)  
**Status**: Authoritative and Frozen  
**Model Identifier**: Candidate H (`RandomForestClassifier`, 300 estimators, skills-only 29 features)  

---

## 1. Directory Structure

The complete repository structure of CareerCompass AI is organized as follows:

```
CareerCompass/
│
├── README.md                                # Root comprehensive system README
├── package.json                             # Frontend dependencies and scripts
├── tsconfig.json                            # Root TypeScript configuration
├── tsconfig.app.json                        # Frontend SPA TypeScript configuration
├── vite.config.ts                           # Vite build configuration
├── tailwind.config.js                       # Tailwind CSS styling tokens
├── Dockerfile                               # Production backend container definition
├── Dockerfile.frontend                      # Multi-stage frontend container definition
├── docker-compose.yml                       # Multi-service local orchestration
├── render.yaml                              # Render PaaS deployment blueprint
├── vercel.json                              # Vercel SPA routing and headers configuration
│
├── docs/                                    # Academic and Engineering Documentation
│   ├── FINAL_PROJECT_REPORT.md              # 15-Chapter comprehensive academic thesis report
│   ├── PROJECT_SUMMARY.md                   # Concise 2-3 page executive overview
│   ├── TECHNICAL_APPENDIX.md                # This document (engineering appendix & runbook)
│   ├── ARCHITECTURE.md                      # Detailed system architecture and pipeline diagrams
│   ├── DEPLOYMENT.md                        # Production deployment guide
│   └── API_DOCS.md                          # REST API endpoint reference
│
├── ml/                                      # Machine Learning Engineering Subsystem
│   ├── models/                              # Locked production model artifacts
│   │   ├── careercompass_phase3_4_model.joblib        # Serialized Candidate H classifier
│   │   ├── careercompass_phase3_4_preprocessor.joblib # Serialized MultiHotSkillEncoder
│   │   └── careercompass_phase3_4_metadata.json       # Locked model configuration metadata
│   ├── reports/                             # Milestone experiment reports & evaluation logs
│   │   ├── model_card.md                    # Formal ML model card
│   │   ├── phase_3_3_report.md              # Class weight & feature ablation report
│   │   ├── phase_3_4_report.md              # Initial model candidate evaluation
│   │   ├── phase3_4_selection_correction.md # Rigorous Candidate H selection correction
│   │   ├── phase3_4_final_holdout.md        # Single holdout evaluation report (N=49)
│   │   ├── phase_3_5_report.md              # FastAPI model service integration report
│   │   ├── phase_3_6_report.md              # Frontend ML prediction integration report
│   │   ├── phase_4_report.md                # Explainability & calibration report
│   │   ├── phase_4_calibration_report.md    # Dedicated calibration empirical analysis
│   │   ├── phase_5_report.md                # Skill ontology & career intelligence report
│   │   ├── phase_6_report.md                # Project catalog & portfolio intelligence report
│   │   ├── phase_7_final_report.md          # Final QA, security, & delivery report
│   │   └── dataset_audit/                   # Data cleaning and taxonomy mapping logs
│   └── tests/                               # ML benchmark and validation test suite
│       ├── test_data.py                     # Data integrity and label tests
│       ├── test_features.py                 # Multi-hot encoder and skill tests
│       ├── test_modeling.py                 # Cross-validation and baseline model tests
│       ├── test_preprocessing.py            # Leakage prevention and transform tests
│       ├── test_phase3_3.py                 # Ablation and calibration tests
│       ├── test_phase3_4.py                 # Candidate H integrity and holdout isolation tests
│       └── test_phase4.py                   # TreeExplainer additivity and parameters tests
│
├── backend/                                 # FastAPI Backend Web Application
│   ├── requirements.txt                     # Python 3.12 dependencies
│   ├── app/
│   │   ├── main.py                          # FastAPI lifespan and route registration
│   │   ├── core/
│   │   │   ├── config.py                    # Environment settings and CORS parsing
│   │   │   └── error_handler.py             # Global exception handlers and error envelopes
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── health.py                # Liveness and readiness endpoints
│   │   │       ├── career_prediction.py     # Inference and SHAP explanation endpoints
│   │   │       └── career_intelligence.py   # Ontology, gap, roadmap, and project endpoints
│   │   ├── schemas/                         # Pydantic v2 request/response schemas
│   │   │   ├── career_prediction.py         # Prediction and explanation contracts
│   │   │   ├── career_intelligence.py       # Ontology, gap, and roadmap contracts
│   │   │   └── project_recommendation.py    # Project catalog and recommendation contracts
│   │   └── services/                        # Business logic and domain services
│   │       ├── model_service.py             # Singleton ML loader and SHAP explainer
│   │       ├── career_ontology.py           # 4-track curated curriculum ontology
│   │       ├── skill_gap_service.py         # Deterministic coverage and gap analysis
│   │       ├── roadmap_service.py           # 5-stage prerequisite DAG roadmap engine
│   │       ├── learning_recommendation_service.py # Curated courseware mappings
│   │       ├── project_catalog.py           # 16-project curated catalog
│   │       └── project_recommendation_service.py  # Rule-based project relevance scoring
│   ├── scripts/
│   │   └── measure_performance.py           # 50-iteration local latency benchmark script
│   └── tests/                               # Backend test suite (74 tests)
│       ├── test_health.py                   # Liveness and readiness test cases
│       ├── test_career_prediction.py        # ML prediction route test cases
│       ├── test_career_explanation.py       # SHAP explanation route test cases
│       ├── test_career_intelligence.py      # Skill gap and roadmap route test cases
│       ├── test_project_intelligence.py     # Project recommendation route test cases
│       ├── test_artifact_integrity.py       # Production artifact validation test cases
│       └── test_security.py                 # CORS, boundary, and error envelope test cases
│
└── src/                                     # React Frontend Single-Page Application
    ├── main.tsx                             # Application DOM root
    ├── App.tsx                              # AppRouter and navigation structure
    ├── index.css                            # Global CSS and Tailwind directives
    ├── context/
    │   ├── AppStateContext.tsx              # Single source of truth React context
    │   └── AppStateReducer.ts               # Pure immutable reducer actions
    ├── types/
    │   ├── appState.ts                      # Central client state type interfaces
    │   ├── careerPrediction.ts              # Strongly-typed prediction interfaces
    │   ├── careerIntelligence.ts            # Strongly-typed intelligence interfaces
    │   └── projectIntelligence.ts           # Strongly-typed project & portfolio interfaces
    ├── services/
    │   └── api/
    │       ├── careerPrediction.ts          # Prediction and explanation API client
    │       ├── careerIntelligence.ts        # Gap analysis and roadmap API client
    │       └── projectRecommendations.ts    # Project recommendation API client
    ├── pages/                               # Route view components
    │   ├── dashboard/Dashboard.tsx          # Central synchronized command dashboard
    │   ├── career/
    │   │   ├── CareerPrediction.tsx         # Interactive skill input & ML prediction
    │   │   ├── CareerExplorer.tsx           # Track curriculum browser
    │   │   └── CareerComparisonView.tsx     # Side-by-side career comparison
    │   ├── skills/
    │   │   ├── Skills.tsx                   # User skill inventory
    │   │   ├── SkillAssessment.tsx          # Skill quiz
    │   │   └── SkillGapView.tsx             # Competency coverage gauge & gap priorities
    │   ├── roadmap/Roadmap.tsx              # 5-stage sequential milestone DAG
    │   ├── learning/LearningHub.tsx         # Curated learning resources
    │   └── portfolio/PortfolioDashboard.tsx # Projects, certificates, & achievements
    └── tests/                               # Frontend integration tests (58 tsx tests)
        ├── mlInferenceIntegration.test.ts   # Phase 3.6 API client integration tests
        ├── mlExplanationIntegration.test.ts # Phase 4 decoupled explanation tests
        ├── statePersistence.test.ts         # Reducer immutability and storage tests
        ├── careerIntelligenceIntegration.test.ts # Phase 5 gap and roadmap tests
        └── projectIntelligenceIntegration.test.ts # Phase 6 project and portfolio tests
```

---

## 2. Locked Model Configuration (Candidate H)

Candidate H is the locked, immutable production model serialized at `ml/models/careercompass_phase3_4_model.joblib`:

### Hyperparameter Attributes
- **Algorithm Class**: `sklearn.ensemble.RandomForestClassifier`
- **Number of Estimators (`n_estimators`)**: `300`
- **Impurity Criterion (`criterion`)**: `'gini'`
- **Maximum Tree Depth (`max_depth`)**: `None` (expanded until all leaves are pure or contain fewer than min_samples_split samples)
- **Minimum Samples to Split (`min_samples_split`)**: `2`
- **Minimum Samples per Leaf (`min_samples_leaf`)**: `1`
- **Class Weighting (`class_weight`)**: `None` (preserves natural empirical class priors)
- **Random State (`random_state`)**: `42`
- **Parallel Jobs (`n_jobs`)**: `-1`
- **Input Dimension (`n_features_in_`)**: `29`
- **Classes Count (`n_classes_`)**: `4`

### Feature Preprocessor
- **Class**: `SkillsOnlyPreprocessor` wrapping `MultiHotSkillEncoder`
- **Artifact Path**: `ml/models/careercompass_phase3_4_preprocessor.joblib`
- **Minimum Frequency**: `1`
- **Transformation**: Deterministic lowercased binary vector mapping over the 29 canonical tokens.

---

## 3. Canonical Vocabulary and Supported Classes

### 3.1 The 29 Canonical Technical Skills
The system processes strictly the following 29 canonical skill tokens (alphabetical order):
```python
CANONICAL_SKILLS = [
    "ai",
    "autocad",
    "cad",
    "cloud",
    "communication",
    "critical_thinking",
    "data_analysis",
    "database_design",
    "database_systems",
    "design",
    "design_optimization",
    "excel",
    "experimentation",
    "lab_work",
    "machine_learning",
    "matlab",
    "negotiation",
    "observation",
    "plc",
    "power_analysis",
    "programming",
    "pscad",
    "python",
    "recording",
    "research",
    "sales",
    "simulation",
    "team_management",
    "web_development"
]
```

### 3.2 The 4 Canonical Career Tracks
```python
CAREER_TRACKS = [
    "AI & Machine Learning Engineering",
    "Cloud, DevOps & Systems Engineering",
    "Data Analytics & Business Intelligence",
    "Software Development & Engineering"
]
```

*Inactive Class Disclosure*: `Database & Data Engineering` contained 0 native primary training records and is explicitly excluded from the model prediction target space.

---

## 4. Benchmark Results Summary

### 4.1 5-Fold Stratified Cross-Validation on Primary Training Data ($N = 192$)
Evaluated strictly using `StratifiedKFold(n_splits=5, shuffle=True, random_state=42)`:

| Metric | Fold 1 | Fold 2 | Fold 3 | Fold 4 | Fold 5 | Mean ± SD |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Overall Accuracy** | 0.8205 | 0.7436 | 0.8684 | 0.7895 | 0.7105 | **0.7858 ± 0.0667** |
| **Macro F1 Score** | 0.6512 | 0.5891 | 0.6874 | 0.6289 | 0.5564 | **0.6226 ± 0.0506** |
| **Weighted F1 Score** | 0.7854 | 0.7102 | 0.8329 | 0.7541 | 0.6724 | **0.7510 ± 0.0656** |
| **Multiclass Log Loss** | 0.3412 | 0.4289 | 0.3245 | 0.3781 | 0.4113 | **0.3768 ± 0.0453** |
| **Top-2 Accuracy** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | **1.0000 ± 0.0000** |

### 4.2 Out-of-Fold (OOF) Per-Class Performance ($N = 192$)
| Career Track | Precision | Recall | F1-Score | Support | Correct Predictions |
|---|:---:|:---:|:---:|:---:|:---:|
| AI & Machine Learning Engineering | 0.7333 | 0.9016 | 0.8088 | 61 | 55 / 61 |
| Cloud, DevOps & Systems Engineering | 0.0000 | 0.0000 | 0.0000 | 15 | 0 / 15 |
| Data Analytics & Business Intelligence | 1.0000 | 1.0000 | 1.0000 | 49 | 49 / 49 |
| Software Development & Engineering | 0.6912 | 0.7015 | 0.6963 | 67 | 47 / 67 |
| **Macro Average** | **0.6061** | **0.6508** | **0.6263** | 192 | 151 / 192 |
| **Weighted Average** | **0.7548** | **0.7865** | **0.7552** | 192 | 151 / 192 |

### 4.3 Final Holdout Benchmark Evaluation ($N = 49$, Evaluated Strictly Once)
| Metric | Holdout Score ($N = 49$) | 5-Fold CV Mean | Benchmark Consistency Assessment |
|---|:---:|:---:|---|
| **Overall Accuracy** | **0.7959** (39/49) | 0.7858 | Consistent benchmark performance between cross-validation and holdout evaluation |
| **Macro F1 Score** | **0.6302** | 0.6226 | Robust out-of-sample macro balance |
| **Weighted F1 Score** | **0.7589** | 0.7510 | Preserves class-weighted accuracy |
| **Multiclass Log Loss** | **0.3874** | 0.3768 | Consistent probabilistic quality; no substantial holdout degradation was observed under this benchmark |
| **Top-2 Accuracy** | **1.0000** (49/49) | 1.0000 | 100% of true labels in top-2 outputs |

---

## 5. Sample API Request and Response Payloads

### 5.1 POST `/api/v1/predictions/career` (Career-Track Classification)

#### Request Payload
```json
{
  "skills": ["python", "ai", "machine_learning", "data_analysis"]
}
```

#### Response Payload (HTTP 200 OK)
```json
{
  "top_career": "AI & Machine Learning Engineering",
  "probabilities": {
    "AI & Machine Learning Engineering": 0.8433,
    "Software Development & Engineering": 0.1100,
    "Data Analytics & Business Intelligence": 0.0333,
    "Cloud, DevOps & Systems Engineering": 0.0134
  },
  "input": {
    "raw_skills": ["python", "ai", "machine_learning", "data_analysis"],
    "recognized_skills": ["python", "ai", "machine_learning", "data_analysis"],
    "unknown_skills": []
  },
  "meta": {
    "model_name": "CareerCompass Phase 3.4 Model (Candidate H)",
    "calibration": "uncalibrated",
    "feature_mode": "skills_only",
    "active_classes_count": 4,
    "disclaimer": "This model estimates the class distribution represented by the training benchmark. It is not a validated predictor of an individual's actual future career outcome."
  }
}
```

---

### 5.2 POST `/api/v1/predictions/career/explain` (Local Feature Attribution)

#### Request Payload
```json
{
  "skills": ["python", "ai", "programming"]
}
```

#### Response Payload (HTTP 200 OK)
```json
{
  "target_career": "AI & Machine Learning Engineering",
  "predicted_probability": 0.6700,
  "base_probability": 0.3177,
  "explanation_method": "TreeExplainer (feature_perturbation=tree_path_dependent)",
  "attributions": [
    {
      "feature": "ai",
      "display_name": "AI",
      "contribution": 0.2145,
      "skill_present": true,
      "direction": "positive"
    },
    {
      "feature": "python",
      "display_name": "Python",
      "contribution": 0.1582,
      "skill_present": true,
      "direction": "positive"
    },
    {
      "feature": "programming",
      "display_name": "Programming",
      "contribution": 0.0411,
      "skill_present": true,
      "direction": "positive"
    },
    {
      "feature": "web_development",
      "display_name": "Web Development",
      "contribution": -0.0615,
      "skill_present": false,
      "direction": "negative"
    }
  ],
  "meta": {
    "is_fallback": false,
    "fallback_reason": null,
    "disclaimer": "Feature attributions reflect local tree ensemble mechanics relative to the training benchmark and do not establish causal relationships."
  }
}
```

---

### 5.3 POST `/api/v1/career/intelligence` (Deterministic Skill Gap & Roadmap)

#### Request Payload
```json
{
  "skills": ["python", "programming"],
  "target_career": "Software Development & Engineering"
}
```

#### Response Payload (HTTP 200 OK)
```json
{
  "target_career": "Software Development & Engineering",
  "is_user_override": true,
  "required_skill_coverage": 40.0,
  "present_skills": ["python", "programming"],
  "missing_core_skills": ["web_development", "database_systems", "data_analysis"],
  "missing_secondary_skills": ["cloud", "database_design"],
  "prioritized_gaps": [
    {
      "skill": "database_systems",
      "priority": "high",
      "tier": "core",
      "is_blocked": false,
      "prerequisites": ["programming"]
    },
    {
      "skill": "web_development",
      "priority": "high",
      "tier": "core",
      "is_blocked": false,
      "prerequisites": ["programming"]
    },
    {
      "skill": "cloud",
      "priority": "medium",
      "tier": "secondary",
      "is_blocked": true,
      "prerequisites": ["web_development"]
    }
  ],
  "roadmap_stages": [
    {
      "stage_id": 1,
      "stage_name": "Stage 1: Prerequisites & Tooling",
      "status": "completed",
      "milestones": [
        {"milestone_id": "m1", "title": "Programming Syntax & Logic", "status": "completed", "skill": "programming"}
      ]
    },
    {
      "stage_id": 2,
      "stage_name": "Stage 2: Core Fundamentals",
      "status": "in_progress",
      "milestones": [
        {"milestone_id": "m2", "title": "Database Systems & SQL", "status": "available", "skill": "database_systems"}
      ]
    }
  ]
}
```

---

### 5.4 POST `/api/v1/career/projects/recommendations` (Project Intelligence)

#### Request Payload
```json
{
  "skills": ["python", "programming"],
  "target_career": "Software Development & Engineering"
}
```

#### Response Payload (HTTP 200 OK)
```json
{
  "target_career": "Software Development & Engineering",
  "recommended_projects": [
    {
      "project_id": "sde-p2",
      "title": "Full-Stack Enterprise Task Management System",
      "difficulty": "Intermediate",
      "estimated_hours": 40,
      "relevance_score": 85.0,
      "targeted_skills": ["web_development", "database_systems", "python"],
      "prerequisites_met": true,
      "deliverables_checklist": [
        "GitHub repository with modular MVC architecture",
        "Interactive deployment on Vercel or Render",
        "Documented REST API schemas and seed scripts"
      ]
    }
  ]
}
```

---

## 6. Automated Test Commands and Execution Guide

### 6.1 Test Suite Commands

```bash
# 1. Run Backend Pytest Suite (74 tests)
python -m pytest backend/tests/ -q

# 2. Run ML Benchmark and Validation Suite (46 passed, 1 skipped)
python -m pytest ml/tests/ -q

# 3. Run Frontend Integration Tests (58 tsx tests)
npm test

# 4. Run TypeScript Static Verification (Zero errors)
npm run typecheck

# 5. Execute Production Vite Build
npm run build
```

### 6.2 Test Suite Verification Counts

| Test Category | Test Runner / Path | Target Scope | Pass Count | Status |
|---|---|---|:---:|:---:|
| **Backend Test Suite** | `pytest backend/tests/` | API contracts, security, artifact integrity, services | **74** | **100% PASS** |
| **ML Test Suite** | `pytest ml/tests/` | Leakage prevention, splits, Candidate H, TreeExplainer | **46** (1 skipped) | **100% PASS** |
| **Frontend Test Suite** | `npx tsx` (`npm test`) | Reducer immutability, API clients, UI flows, state persistence | **58** | **100% PASS** |
| **Total Automated Tests** | Mixed Pytest + TSX | 178 automated regression tests passed | **178** | **ALL PASS** |

---

## 7. Environment Variables Configuration

The following environment variables govern backend and frontend execution:

### Backend Configuration (`backend/.env`)

```ini
# Environment Mode ('development' | 'production')
APP_ENV=development
APP_DEBUG=false

# Server Bind Settings
APP_HOST=0.0.0.0
APP_PORT=8000

# Strict CORS Origins (Comma-separated; wildcard '*' is strictly prohibited)
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000

# Secret Key Configuration (Required for token hashing if authentication enabled)
JWT_SECRET_KEY=change_this_to_a_secure_64_character_random_string_in_production
JWT_ALGORITHM=HS256
JWT_ACCESS_EXPIRE_MINUTES=60
JWT_REFRESH_EXPIRE_DAYS=7

# Optional Cloud Database URI (Falls back to LocalStorage demo mode if unconfigured)
MONGODB_URL=
MONGODB_DB_NAME=career_compass_ai
```

### Frontend Configuration (`.env`)

```ini
# Base API URL targeting the FastAPI backend
VITE_API_URL=http://localhost:8000
```

---

## 8. Deployment Runbooks and Docker Commands

### 8.1 Local Docker Orchestration

To build and run both the backend and frontend containers locally using `docker-compose`:

```bash
# 1. Build and launch all services in detached mode
docker-compose up --build -d

# 2. Verify container statuses
docker-compose ps

# 3. Inspect backend service logs
docker-compose logs -f backend

# 4. Verify backend health endpoint
curl http://localhost:8000/api/v1/ready

# 5. Access frontend in browser
# http://localhost:80
```

### 8.2 Standalone Backend Container Runbook

```bash
# 1. Build backend Docker image
docker build -t careercompass-backend:latest -f Dockerfile .

# 2. Run backend container with environment variable injection
docker run -d \
  --name careercompass-backend \
  -p 8000:8000 \
  -e ALLOWED_ORIGINS="http://localhost:5173" \
  -e APP_ENV="production" \
  careercompass-backend:latest

# 3. Test readiness probe
curl http://localhost:8000/api/v1/ready
```

### 8.3 Standalone Frontend Container Runbook

```bash
# 1. Build frontend multi-stage Docker image
docker build -t careercompass-frontend:latest -f Dockerfile.frontend .

# 2. Run frontend Nginx container
docker run -d \
  --name careercompass-frontend \
  -p 80:80 \
  careercompass-frontend:latest
```

---

## 9. Performance Benchmark Summary (Local Execution)

Benchmarked on local workstation via `backend/scripts/measure_performance.py` across 50 iterations:

| Target Endpoint / Operation | Sample Iterations | Mean Latency | Median Latency | Min Latency | Max Latency | Performance Benchmark Assessment |
|---|:---:|:---:|:---:|:---:|:---:|---|
| **Model Artifact Loading** | 1 (Startup) | **409.44 ms** | 409.44 ms | 409.44 ms | 409.44 ms | Singleton initialized once at lifespan boot |
| **POST /predictions/career** | 50 | **32.37 ms** | 31.27 ms | 30.09 ms | 79.33 ms | Sub-50ms inference throughput |
| **POST /predictions/career/explain** | 50 | **41.38 ms** | 40.63 ms | 39.11 ms | 57.63 ms | Rapid local tree-path attribution |
| **POST /career/intelligence** | 50 | **31.91 ms** | 31.82 ms | 30.56 ms | 33.54 ms | Instantaneous DAG prerequisite resolution |
| **POST /career/projects/recommendations** | 50 | **33.67 ms** | 32.16 ms | 31.09 ms | 88.99 ms | Real-time heuristic relevance ranking |

*Note*: All measurements reflect single-client local benchmark runs and do not constitute high-concurrency production load-testing.
