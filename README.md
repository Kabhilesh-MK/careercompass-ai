# CareerCompass AI — AI-Powered Career Intelligence System

<div align="center">

**An End-to-End Career Intelligence Platform Integrating Machine Learning, Local Feature Attribution, Curated Ontology, Deterministic Roadmapping, Project Intelligence, and Portfolio Evidence Tracking.**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python)](https://www.python.org/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5-F7931E?style=flat-square&logo=scikit-learn)](https://scikit-learn.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

</div>

---

> [!IMPORTANT]
> **Primary Academic & Scientific Disclaimer**:
> This model estimates the class distribution represented by the training benchmark. It is not a validated predictor of an individual's actual future career outcome. Career recommendations, skill gaps, roadmaps, and project mappings provide structured educational guidance and do not constitute professional career guarantees.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Objectives](#3-objectives)
4. [System Architecture](#4-system-architecture)
5. [Dataset Description](#5-dataset-description)
6. [Data Preparation & Leakage Prevention](#6-data-preparation--leakage-prevention)
7. [Model Selection & Candidate H](#7-model-selection--candidate-h)
8. [Model Evaluation & Holdout Validation](#8-model-evaluation--holdout-validation)
9. [Calibration Study & Threshold Policy](#9-calibration-study--threshold-policy)
10. [Explainability Architecture](#10-explainability-architecture)
11. [Skill Ontology](#11-skill-ontology)
12. [Skill-Gap Engine](#12-skill-gap-engine)
13. [Deterministic Roadmap Generation](#13-deterministic-roadmap-generation)
14. [Learning Intelligence](#14-learning-intelligence)
15. [Project Intelligence](#15-project-intelligence)
16. [Portfolio & Evidence Coverage](#16-portfolio--evidence-coverage)
17. [Technology Stack](#17-technology-stack)
18. [API Endpoints & Contracts](#18-api-endpoints--contracts)
19. [Installation & Setup](#19-installation--setup)
20. [Testing & Verification](#20-testing--verification)
21. [Academic Limitations](#21-academic-limitations)
22. [Ethical Considerations](#22-ethical-considerations)

---

## 1. Project Overview

**CareerCompass AI** is a deployment-ready academic full-stack career guidance and skill progression system. It connects machine learning inference with human-in-the-loop agency. Starting from student technical skills, it predicts career alignment using a locked Random Forest classifier (Candidate H), decomposes the prediction into local feature attributions (TreeExplainer/TreePathAttribution), evaluates competency coverage against an authoritative 4-track curriculum ontology, generates a 5-stage sequential roadmap, recommends real-world portfolio projects, and tracks verified proof-of-work in an interactive portfolio.

### Core Architectural Distinctions

To maintain academic defensibility and scientific clarity, the system strictly delineates between four operational domains:

| Domain | Components | Mechanism | Guarantee |
|---|---|---|---|
| **ML-Derived** | Career Track Prediction, Model Probabilities | Candidate H Random Forest (300 estimators, skills-only) | Empirical class distribution matching; raw tree probabilities |
| **Curated** | Skill Ontology, Course Catalog, Project Catalog, Prerequisites | Human-expert curriculum definitions & domain taxonomy | Pedagogically structured, 29-feature canonical vocabulary |
| **Deterministic** | Competency Coverage %, Gap Prioritization, 5-Stage Roadmap, Project Relevance Scoring | Exact mathematical formulas and directed acyclic graph (DAG) traversal | 100% reproducible, explainable, rule-based determinism |
| **User-Generated** | Input Skills, Target Track Overrides, Project Evidence Links, Added Certificates | Client state & verified user milestones | User agency, state persistence in localStorage |

---

## 2. Problem Statement

Computer science and engineering students frequently struggle with career navigation due to three systemic challenges:
1. **Opaque Recommendations**: Many career guidance tools present black-box scores or generative text outputs without explaining why a career path was recommended or which skills drove the decision.
2. **Disconnected Learning Plans**: Traditional assessment tools identify missing skills in isolation without structuring them into a prerequisite-aware learning sequence or translating them into practical portfolio projects.
3. **Lack of Evidence Tracking**: Job placement and technical interviews require tangible proof-of-work, yet students rarely have a unified workflow that ties acquired skills directly to deployable project deliverables and verifiable achievements.

CareerCompass solves this by creating an integrated, transparent pipeline:
$$\text{Skills} \xrightarrow{\text{ML}} \text{Prediction} \xrightarrow{\text{SHAP}} \text{Explanation} \xrightarrow{\text{Ontology}} \text{Skill Gap} \xrightarrow{\text{DAG}} \text{Roadmap} \xrightarrow{\text{Curated}} \text{Projects} \xrightarrow{\text{Proof}} \text{Portfolio}$$

---

## 3. Objectives

- **Rigorous ML Inference**: Deploy a leak-free Random Forest classifier trained on 29 canonical technical skill indicators across 4 computing disciplines.
- **Local Interpretability**: Provide instance-level feature attributions demonstrating which skills positively or negatively contributed to the prediction.
- **Transparent Human Agency**: Allow students to explore model recommendations while supporting manual career target overrides without corrupting the underlying ML inference.
- **Prerequisite-Aware Roadmapping**: Generate a structured 5-stage learning plan (Prerequisites $\rightarrow$ Core Fundamentals $\rightarrow$ Applied Frameworks $\rightarrow$ Systems & Tooling $\rightarrow$ Capstone) ordered by dependency.
- **Evidence-Backed Portfolio**: Connect projects to specific missing skills, evaluate deliverable proofs (repository, deployment, documentation), and calculate deterministic readiness metrics.
- **Zero Mock / Fake Data**: Eliminate all placeholder percentages, fake confidence fallbacks, and unverified synthetic outputs from system inference.

---

## 4. System Architecture

```
                                  CAREERCOMPASS
                                       │
                        ┌──────────────┴──────────────┐
                        │                             │
                     FRONTEND                       BACKEND
                        │                             │
                   React + TS                       FastAPI
                        │                             │
                        └──────────────┬──────────────┘
                                       │
                                ML INFERENCE
                                       │
                                Candidate H RF
                                       │
                              Career Prediction
                                       │
                              ┌────────┴────────┐
                              │                 │
                           SHAP              Ontology
                        Explanation              │
                                                 ▼
                                             Skill Gap
                                                 │
                                             Roadmap
                                                 │
                                             Learning
                                                 │
                                             Projects
                                                 │
                                             Portfolio
                                                 │
                                         Career Readiness
```

### Component Breakdown
1. **Frontend (Vite + React 18 + TypeScript)**:
   - Centralized immutable state store (`AppStateContext` with useReducer).
   - Strict API clients with user-friendly error boundaries and zero fake fallbacks.
   - Comprehensive multi-route single-page application with responsive layouts.
2. **Backend (FastAPI + Pydantic v2 + Uvicorn)**:
   - Lifespan architecture loading ML artifacts strictly once on process startup.
   - REST API endpoints under `/api/v1` with validation, normalization, and safe exception handlers.
   - Environment-aware CORS configuration prohibiting wildcard origins.
3. **Machine Learning Pipeline (scikit-learn + SHAP)**:
   - `ModelService` singleton executing deterministic predictions and local feature attributions.
   - Authoritative 29-dimension canonical skill vocabulary.

### Project Directory Structure

```
project/
├── src/                         # React 18 + TypeScript frontend application
│   ├── components/              # UI components & design system atoms
│   ├── context/                 # Centralized state reducer & providers
│   ├── data/                    # Curriculum ontology & project catalogs
│   ├── pages/                   # Application route views & dashboards
│   ├── services/                # Strict API client & persistence engine
│   └── tests/                   # Integration test suites (58 tests)
├── backend/                     # FastAPI backend service
│   ├── app/                     # API routes, schemas, services, and security
│   ├── ml/                      # Legacy Phase 1/2 knowledge base & models
│   ├── scripts/                 # Performance benchmark scripts
│   └── tests/                   # Pytest API contracts & security (74 tests)
├── ml/                          # Authoritative ML research & production pipeline
│   ├── configs/                 # Pipeline configuration YAML
│   ├── data/                    # Benchmark datasets (1,500 raw, primary split, RIASEC)
│   ├── models/                  # Candidate H locked model & baseline joblib artifacts
│   ├── reports/                 # 41 academic phase reports & evaluation figures
│   ├── src/                     # Feature extraction, preprocessing & training modules
│   └── tests/                   # ML benchmark regression tests (46 passed, 1 skipped)
├── docs/                        # Formal academic reports, specs, and viva defense guides
├── Dockerfile                   # Production backend container definition
├── Dockerfile.frontend          # Production frontend multi-stage Nginx container
├── docker-compose.yml           # Full-stack local orchestration
├── render.yaml                  # Render PaaS deployment blueprint
├── vercel.json                  # Vercel SPA routing and security headers
├── nginx.conf                   # Production Nginx reverse proxy configuration
├── README.md                    # Repository documentation
└── LICENSE                      # MIT License
```

---

## 5. Dataset Description

The primary training benchmark consists of structured student technical profiles categorized into canonical technology disciplines:

- **Total Retained Samples**: $N = 241$
- **Training Partition**: $N = 192$ records ($79.7\%$)
- **Holdout Test Partition**: $N = 49$ records ($20.3\%$) strictly isolated and untouched during all model selection steps
- **Canonical Tracks (4 Classes)**:
  1. `Software Development & Engineering` (SDE)
  2. `AI & Machine Learning Engineering` (AI/ML)
  3. `Data Analytics & Business Intelligence` (DA/BI)
  4. `Cloud, DevOps & Systems Engineering` (Cloud/DevOps)
- *Inactive Track*: `Database & Data Engineering` contained 0 native primary training records and was excluded from active prediction targets to preserve academic validity.

---

## 6. Data Preparation & Leakage Prevention

1. **Vocabulary Isolation**: Skills are extracted and tokenized using `MultiHotSkillEncoder(min_freq=1)` fitted strictly inside training folds during cross-validation.
2. **Degree Title Confounding Removed**: Academic degree titles (`Education_Level`, `Specialization`, `Interests`) were pruned to prevent degree-track confounding (e.g. artificial correlation between degree name and career class).
3. **External Dataset Segregation**: Secondary exploratory datasets (e.g. external benchmarks) were audited and completely isolated; no external data was leaked into model training.
4. **Deterministic Normalization**: Skill tokens are lowercased, stripped of punctuation, and mapped to canonical underscore identifiers (e.g., `"Machine Learning"` $\rightarrow$ `"machine_learning"`).

---

## 7. Model Selection & Candidate H

During Phase 3.4, eight pre-declared model candidates across multiple feature configurations and class-weighting regimes were evaluated using 5-fold Stratified Cross-Validation on the 192 training records:

| Candidate ID | Model Family | Feature Set | Class Weight | CV Macro F1 | CV Log Loss | CV Accuracy |
|---|---|---|:---:|:---:|:---:|:---:|
| **Candidate H (Selected)** | **Random Forest (300 trees)** | **Skills-only (29)** | **None** | **0.6226 ± 0.0506** | **0.3768 ± 0.0453** | **0.7858 ± 0.0667** |
| Candidate A | Logistic Regression | Combined (60) | None | 0.6188 ± 0.0562 | 0.4704 ± 0.0768 | 0.7752 ± 0.0771 |
| Candidate B | Logistic Regression | Combined (60) | Balanced | 0.6883 ± 0.0646 | 0.5242 ± 0.0695 | 0.7238 ± 0.0681 |
| Candidate C | Random Forest (300) | Combined (60) | None | 0.5766 ± 0.0411 | 0.7139 ± 0.3957 | 0.7028 ± 0.0552 |
| Candidate D | Random Forest (300) | Combined (60) | Balanced | 0.6741 ± 0.0720 | 0.5779 ± 0.1170 | 0.6978 ± 0.0752 |

### Selection Rationale
Candidate H was selected as the final locked production model because:
1. It achieved the **lowest Multiclass Log Loss** ($0.3768$) across all 8 candidates and highest **CV Accuracy** ($78.58\%$), with slightly higher Macro F1 ($0.6226$) than Candidate A ($0.6188$). While class-weighted candidates B and D achieved higher Macro F1 ($0.6883$ and $0.6741$), they severely degraded Software Engineering recall to ~34–37% and increased log loss to >0.52.
2. It completely eliminated degree-title confounders by evaluating only transferable technical competencies.
3. It exhibited lower variance across cross-validation folds than linear baselines.

---

## 8. Model Evaluation & Holdout Validation

On the held-out benchmark ($N = 49$, evaluated strictly **once**), Candidate H achieved 79.59% accuracy and 63.02% Macro F1:

| Evaluation Metric | Holdout Test Score | 5-Fold CV Mean | Generalization Delta |
|---|:---:|:---:|:---:|
| **Overall Accuracy** | **0.7959** (39/49) | 0.7858 | +0.0101 |
| **Macro-Averaged F1** | **0.6302** | 0.6226 | +0.0076 |
| **Weighted F1** | **0.7589** | 0.7510 | +0.0079 |
| **Multiclass Log Loss** | **0.3874** | 0.3768 | +0.0106 |
| **Top-2 Accuracy** | **1.0000** (49/49) | 1.0000 | 0.0000 |

### Holdout Per-Class Performance
- **AI & Machine Learning Engineering**: Precision $0.714$, Recall **$1.000$** (15/15 correct), F1 $0.833$
- **Data Analytics & Business Intelligence**: Precision **$1.000$**, Recall **$1.000$** (13/13 correct), F1 $1.000$
- **Software Development & Engineering**: Precision $0.733$, Recall $0.647$ (11/17 correct), F1 $0.688$
- **Cloud, DevOps & Systems Engineering**: Acute minority sample limitation (15 training samples, 4 holdout samples, $0/4$ holdout recall under default argmax)

---

## 9. Calibration Study & Threshold Policy

1. **Uncalibrated Model Probabilities**: Candidate H produces raw class probabilities from tree votes ($\frac{1}{T} \sum_{t=1}^T p_t$).
2. **Calibration Analysis**: Empirical calibration curves showed that while probability rankings are monotonic, extreme probabilities may deviate from true posterior frequencies due to ensemble leaf averaging.
3. **Threshold Policy**: Default inference operates under standard **argmax**. Alternate operating thresholds ($\tau \in [0.25, 0.30]$ for Cloud/DevOps) are documented as out-of-fold exploratory candidates and are not hardcoded into production.

---

## 10. Explainability Architecture

To ensure transparent decision-making, local predictions are interpreted through feature attributions:
- **Primary Method**: SHAP `TreeExplainer` computing exact Shapley values based on tree ensemble structure.
- **Deterministic Fallback**: Instance-level `TreePathAttribution` calculating leaf-to-root probability shifts ($\Delta p = \text{leaf} - \text{root}$) across individual decision paths.
- **Non-Causal Standard**: Feature attributions describe model behavior relative to the training benchmark, not real-world causality.

---

## 11. Skill Ontology

The ontology defines the complete knowledge graph for the 4 ML-supported tracks across 29 canonical skills:
- **Core Skills**: Essential mandatory competencies required for foundational competence in the track.
- **Secondary Skills**: Complementary technologies broadening domain expertise.
- **Prerequisite Graph**: Directed dependencies ensuring foundational topics precede advanced applications.
- **Stage Classification**: Each skill maps to one of 5 pedagogical levels:
  - Stage 1: Prerequisites & Tooling
  - Stage 2: Core Fundamentals
  - Stage 3: Applied Frameworks
  - Stage 4: Systems & Infrastructure
  - Stage 5: Capstone Synthesis

---

## 12. Skill-Gap Engine

Calculates transparent, deterministic skill gap metrics:
$$\text{Competency Coverage (\%)} = \frac{|\text{Acquired Skills} \cap \text{Track Core Skills}|}{|\text{Track Core Skills}|} \times 100$$
- Missing skills are partitioned into **Missing Core** (high priority) and **Missing Secondary** (medium priority).
- Prerequisite status is computed dynamically: a missing skill is flagged as **Blocked** if its dependencies have not yet been acquired.

---

## 13. Deterministic Roadmap Generation

Converts identified skill gaps into a structured 5-stage sequential roadmap:
1. **Topological Ordering**: Milestones are sequenced such that prerequisite competencies are acquired before dependent topics.
2. **Status Progression**:
   - `completed`: Skills the student has already acquired.
   - `in_progress`: The immediate next unlocked milestone.
   - `locked`: Future milestones with unfulfilled prerequisites.
3. **Dynamic Unlocking**: When a student marks a milestone complete, dependent milestones automatically unlock.

---

## 14. Learning Intelligence

Maps each missing competency directly to curated educational resources:
- Structured catalog of verified courses, documentation, and tutorials.
- Difficulty levels (Beginner, Intermediate, Advanced) and estimated completion hours.
- Direct links to learning platforms without dead links or placeholder URLs.

---

## 15. Project Intelligence

Recommends practical portfolio projects targeting the student's specific missing skills:
- **Catalog of 16 Curated Projects** spanning all 4 career tracks.
- **Rule-Based Relevance Scoring** (not an AI confidence metric):
  $$\text{Relevance} = \frac{|\text{Missing Core Skills Target}| \times 2.0 + |\text{Missing Secondary Target}| \times 1.0}{\text{Total Project Target Skills}}$$
- **Prerequisite Validation**: Flags whether the student possesses prerequisite competencies before starting.
- **Milestone Evidence**: Suggests exact deliverables (GitHub repository, live deployment, system architecture document, test suite).

---

## 16. Portfolio & Evidence Coverage

Provides unified proof-of-work tracking:
- **Project Tracking**: Manages active, in-progress, and completed projects.
- **Evidence Checklist**: Verifies submission of repository URLs, live demo links, and documentation.
- **Portfolio Evidence Coverage Formula** (an evidence/coverage metric, not proof of professional competency):
  $$\text{Portfolio Evidence Coverage (\%)} = \frac{|\text{Competencies Verified by Project Deliverables}|}{|\text{Target Career Skills}|} \times 100$$
- **Automatic Provenance**: Completing projects generates state-derived verified achievements.

---

## 17. Technology Stack

### Frontend
- **Framework**: React 18.3 with TypeScript 5.5
- **Build System**: Vite 5.4 (ESM code-splitting, ~94 kB core vendor bundle)
- **Styling**: Tailwind CSS 3.4
- **Motion**: Framer Motion 12.4
- **Visualizations**: Recharts 3.10
- **Icons**: Lucide React 0.344

### Backend
- **Framework**: FastAPI 0.115 with Pydantic v2
- **Runtime**: Python 3.12
- **ML Engine**: scikit-learn 1.5.2, SHAP, NumPy, Pandas, Joblib
- **Logging**: Loguru structured logging
- **Server**: Uvicorn ASGI

---

## 18. API Endpoints & Contracts

### Health & Monitoring
- `GET /api/v1/health` — Liveness probe (HTTP 200).
- `GET /api/v1/ready` — Readiness probe verifying ML model, preprocessor, and metadata loading (HTTP 200 / 503).
- `GET /api/v1/model/info` — Returns model metadata, feature configuration, and taxonomy (HTTP 200).

### ML Predictions & Explanations
- `GET /api/v1/predictions/career/skills` — Returns canonical 29-skill vocabulary.
- `POST /api/v1/predictions/career` — Generates top career prediction, ranked alternatives, and raw model probabilities.
- `POST /api/v1/predictions/career/explain` — Computes local SHAP / tree-path feature attributions.

### Career Intelligence & Ontology
- `GET /api/v1/career/ontology` — Returns full 4-track curriculum ontology.
- `POST /api/v1/career/intelligence` — Generates coverage %, prioritized gaps, 5-stage roadmap, and learning recommendations. Supports optional `target_career_track` override.

### Project Recommendations & Catalog
- `GET /api/v1/career/projects/catalog` — Returns complete curated project catalog.
- `POST /api/v1/career/projects/recommendations` — Returns prioritized, prerequisite-checked project recommendations targeting identified skill gaps.

---

## 19. Installation & Setup

### Prerequisites
- Python 3.12+
- Node.js 20+ and npm 10+

### Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend Setup
```bash
# In the project root:
npm install
cp .env.example .env
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Deployment Quick Start

Comprehensive deployment documentation, environment specifications, and configuration guides are available in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

The project natively supports three deployment approaches:

1. **Docker / Docker Compose**:
   - Full-stack local or server orchestration via `docker-compose up --build`.
   - Production multi-stage frontend container (`Dockerfile.frontend` with Nginx) and backend container (`Dockerfile` with Python 3.12).
2. **Render Web Service**:
   - Automated cloud backend deployment defined via root `render.yaml`.
   - Native Python ASGI worker running Uvicorn with auto-detected health probes (`/api/v1/ready`).
3. **Vercel Frontend Deployment**:
   - Single-click frontend hosting configured via `vercel.json`.
   - Provides SPA route rewrites, immutable static asset caching, and security headers.

---

## 20. Testing & Verification

The system includes a 178-test automated regression suite:

### Backend Pytest Suite (74 tests)
```bash
backend\venv\Scripts\python.exe -m pytest backend/tests/ -v
```
- `test_artifact_integrity.py`: Automated checks for model hyperparameters, 29 dimensions, and metadata.
- `test_health.py`: Liveness, readiness, CORS headers, safe error responses.
- `test_model_loading.py`: Singleton lifecycle, once-only loading, immutable fit guards.
- `test_predictions.py`: 4 classes, probability sum, normalization, security limits.
- `test_explanations.py`: Attribution consistency, local additivity, vocabulary constraints.
- `test_career_intelligence.py`: Coverage formulas, stage roadmaps, target override.
- `test_project_intelligence.py`: Project relevance, prerequisite resolution, catalog integrity.

### Machine Learning Benchmark Suite (46 tests)
```bash
backend\venv\Scripts\python.exe -m pytest ml/tests/ -v
```

### Frontend Integration Suite (58 tests)
```bash
npm run typecheck
npm test
npm run build
```
- `mlInferenceIntegration.test.ts`: 12 tests
- `mlExplanationIntegration.test.ts`: 5 tests
- `statePersistence.test.ts`: 11 tests
- `careerIntelligenceIntegration.test.ts`: 15 tests
- `projectIntelligenceIntegration.test.ts`: 15 tests

---

## 21. Academic Limitations

1. **Benchmark Size**: The primary training benchmark consists of $N = 192$ training profiles. While sufficient for stable 4-class modeling, it does not represent the full diversity of global engineering roles.
2. **Minority Class Sparsity**: The `Cloud, DevOps & Systems Engineering` class contains 15 training and 4 holdout samples, leading to zero predictions under default argmax.
3. **Binary Feature Space**: Competencies are modeled as binary multi-hot presence indicators without encoding recency, project complexity, or skill depth.
4. **Non-Causal Associations**: Feature attributions reflect correlation within the historical benchmark, not causal real-world job placement dynamics.

---

## 22. Ethical Considerations

1. **Advisory Function Only**: The system is designed strictly for exploratory self-assessment and curriculum planning. It must **never** be used for automated hiring, candidate screening, or career gating.
2. **Transparent Agency**: The platform ensures students are never locked into an automated prediction. Users can override recommendations and set arbitrary career targets.
3. **Privacy & Security**: The core inference pipeline does not send student skill data to external third-party LLMs or commercial APIs. All calculations execute locally or on private application servers.
4. **No Synthetic Guarantees**: Model probabilities and readiness scores are explicitly labeled as benchmark alignment indicators, avoiding misleading claims of placement certainty.
