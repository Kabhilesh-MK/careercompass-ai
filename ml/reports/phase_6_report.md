# CareerCompass — Phase 6 Final Report
## Learning, Project & Portfolio Intelligence: Evidence-Building Guidance, Project Catalog, Portfolio Verification & Career Readiness

**Document Version:** 1.0.0  
**Phase Status:** Complete & Verified  
**Date:** October 2026  
**Target Audience:** Academic Evaluators, ML Engineers, System Architects  
**Primary Artifacts:**
- Locked Model: `ml/models/careercompass_phase3_4_model.joblib` (Unchanged Candidate H Random Forest)
- Locked Preprocessor: `ml/models/careercompass_phase3_4_preprocessor.joblib` (Exact 29-feature vocabulary)
- Curated Project Catalog Service: `backend/app/services/project_catalog.py`
- Project Recommendation Engine: `backend/app/services/project_recommendation_service.py`
- Remediation of Learning URLs: `backend/app/services/learning_recommendation_service.py` & `src/data/learningResources.ts`
- Project Intelligence Router: `backend/app/api/routes/career_intelligence.py` (`POST /api/v1/career/projects/recommendations`, `GET /api/v1/career/projects/catalog`)
- Project Recommendation Schemas: `backend/app/schemas/project_recommendation.py`
- Frontend Project Recommendation API Client: `src/services/api/projectRecommendations.ts`
- Upgraded Pages:
  - `/portfolio`: `src/pages/portfolio/PortfolioDashboard.tsx` (Portfolio Intelligence, Projects & Evidence, User Certificates, Provenance-backed Achievements)
  - `/portfolio/projects`: `src/pages/portfolio/PortfolioDashboard.tsx` (Tab: `projects`)
  - `/portfolio/certificates`: `src/pages/portfolio/PortfolioDashboard.tsx` (Tab: `certificates`)
  - `/portfolio/achievements`: `src/pages/portfolio/PortfolioDashboard.tsx` (Tab: `achievements`)
  - `/dashboard`: `src/pages/dashboard/Dashboard.tsx` (Live ML Prediction, Target Track, Skill Coverage, Missing Skills, Next Learning, Project Spotlight, Roadmap Progress, Portfolio Evidence Coverage)
  - `/learning`: `src/pages/learning/LearningHub.tsx` (Evidence-Building Pipeline: Learn Skill → Build Project → Collect Evidence → Portfolio)
- Automated Test Suites:
  - Backend: `backend/tests/test_project_intelligence.py` (15 tests) & Full Suite (70 tests total)
  - Frontend: `src/tests/projectIntelligenceIntegration.test.ts` (15 tests) & Full Suite (58 tests total)
  - Verification & Audit Script: `backend/scripts/verify_phase_6.py`

---

## 1. Objective

Phase 6 extends CareerCompass from:
$$\text{Career Prediction} \longrightarrow \text{Skill Gap} \longrightarrow \text{Roadmap} \longrightarrow \text{Learning}$$
into a complete evidence-building lifecycle:
$$\text{Career Prediction} \longrightarrow \text{Skill Gap} \longrightarrow \text{Roadmap} \longrightarrow \text{Learning} \longrightarrow \text{Projects} \longrightarrow \text{Portfolio} \longrightarrow \text{Career Readiness}$$

The system answers five fundamental practical questions for the student:
1. **What should I learn?** (Curated, verified courseware targeting priority ontology gaps).
2. **What should I build?** (Heuristically ranked portfolio projects targeting missing competencies).
3. **What should I add to my portfolio?** (Tangible evidence: GitHub repos, READMEs, benchmarks, architecture diagrams, live demos).
4. **What evidence shows that I have completed the roadmap?** (Standardized evidence checklists directly attached to projects).
5. **How complete is my career plan?** (A transparent, deterministic aggregate metric: *Career Plan Completion*).

---

## 2. Architecture & Data Provenance Governance

To ensure scientific and academic integrity, CareerCompass enforces strict boundaries between four distinct categories of data:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DATA PROVENANCE MATRIX                          │
├────────────────────────┬───────────────────────────────────────────────┤
│ ML-Derived             │ Candidate H Random Forest class inference;   │
│ (Statistical/Advisory) │ class probabilities; local tree attribution.  │
│                        │ Strictly non-prescriptive, advisory.          │
├────────────────────────┼───────────────────────────────────────────────┤
│ Curated Product        │ 29-skill competency taxonomy; 4-track skill   │
│ Knowledge              │ ontology; project catalog (16 projects);      │
│ (Normative Framework)  │ learning catalog; prerequisite DAG rules.     │
├────────────────────────┼───────────────────────────────────────────────┤
│ User-Generated State   │ Selected skills; roadmap milestone checks;    │
│ (Event/Action State)   │ project status; deliverable links; user-added │
│                        │ certificates with verifiable credential IDs.  │
├────────────────────────┼───────────────────────────────────────────────┤
│ Deterministically      │ Required Skill Coverage Ratio; Roadmap        │
│ Derived Metrics        │ Completion; Project Relevance Score;          │
│ (Mathematical Rules)   │ Portfolio Evidence Coverage; Career Plan      │
│                        │ Completion. Zero black-box magic.             │
└────────────────────────┴───────────────────────────────────────────────┘
```

### End-to-End Pipeline

```
[ User Input Skills ] ─────────────────────────┐
         │                                      │
         ▼                                      ▼
[ Candidate H RF Inference ]           [ Career Ontology ]
(Advisory Prediction Probability)      (4 Tracks, Canonical Skills)
         │                                      │
         └──────────────┬───────────────────────┘
                        ▼
            [ Skill Gap Analysis ]
            (Present vs Missing Skills, Prioritized Gaps)
                        │
       ┌────────────────┼────────────────┐
       ▼                ▼                ▼
[ 5-Stage Roadmap ] [ Curated Learning ] [ Project Catalog Engine ]
 (Milestone DAG)     (Verified/Omitted)   (16 Curated Projects)
       │                │                │
       └────────────────┼────────────────┘
                        ▼
             [ Portfolio Evidence ]
             (Deliverables, Checklist, User Certs)
                        │
                        ▼
          [ Career Plan Completion ]
          (Deterministic Evidence Aggregate)
```

---

## 3. Learning Intelligence Quality Remediation

In Phase 5, several catalog items contained placeholder `https://example.com/catalog/...` URLs. In Phase 6, a comprehensive quality audit was executed:
1. **Zero Placeholder URLs:** All placeholder `example.com` URLs were audited and eliminated.
2. **Strict URL Policy:** Only verified URLs are retained; where external provider verification cannot be independently guaranteed, the `url` field is explicitly set to `null` (omitted) rather than fabricated.
3. **Prerequisite Awareness:** Curated learning recommendations incorporate `prerequisites: List[str]` and `prerequisites_met: bool` to ensure the learner is informed whether prerequisite competencies are satisfied.
4. **Catalog Mapping:** Each learning recommendation contains:
   - `resource_id`, `title`, `provider`, `skill`, `resource_type`, `difficulty`, `estimated_effort`, `roadmap_stage`, `url`, `prerequisites`, `prerequisites_met`.

---

## 4. Project Intelligence

The Project Recommendation Engine (`ProjectRecommendationService`) is a deterministic heuristic system.
- **No LLMs:** Project recommendations are not hallucinated or dynamically prompted.
- **No Pseudo-ML Claims:** The ranking is explicitly documented as a *Project Relevance Score* (a planning heuristic) and never claimed to be an "AI prediction" or "hiring likelihood."
- **Canonical Skill Grounding:** Every project links exclusively to canonical 29-feature skill tokens.

---

## 5. Curated Project Catalog

The backend project catalog (`backend/app/services/project_catalog.py`) defines exactly 16 high-impact projects (4 per ML-supported career track).

### Track Distribution:

1. **AI & Machine Learning Engineering (4 Projects):**
   - `ai-ml-01`: End-to-End Supervised ML Pipeline & Evaluation Suite (Stage 2)
   - `ai-ml-02`: Production Model Inference Microservice & SHAP Explainability API (Stage 3)
   - `ai-ml-03`: Retrieval-Augmented Generation (RAG) Document Intelligence Engine (Stage 4)
   - `ai-ml-04`: Computer Vision Defect Detection & Quality Assurance Pipeline (Stage 4)

2. **Software Development & Engineering (4 Projects):**
   - `sde-01`: Full-Stack Collaborative Issue & Sprint Tracker (Stage 2)
   - `sde-02`: High-Throughput Distributed Task Queue & Worker Service (Stage 3)
   - `sde-03`: Scalable E-Commerce Microservices Platform (Stage 4)
   - `sde-04`: Developer CLI & Continuous Delivery Automation Suite (Stage 3)

3. **Data Analytics & Business Intelligence (4 Projects):**
   - `dabi-01`: Enterprise Relational Data Warehouse & SQL Analytics Engine (Stage 2)
   - `dabi-02`: Executive Financial & Operational Intelligence Dashboard (Stage 3)
   - `dabi-03`: Customer Segmentation & Cohort Retention Analytics Engine (Stage 3)
   - `dabi-04`: Real-Time Streaming Analytics & Anomaly Detection Pipeline (Stage 4)

4. **Cloud, DevOps & Systems Engineering (4 Projects):**
   - `devops-01`: Multi-Tier Containerized Application Infrastructure (Stage 2)
   - `devops-02`: GitOps Continuous Delivery Pipeline & Automated Canary Deployment (Stage 3)
   - `devops-03`: Enterprise Observability & Distributed Tracing Platform (Stage 3)
   - `devops-04`: Zero-Trust Multi-Region Cloud Infrastructure (Stage 4)

---

## 6. Recommendation Methodology: Project Relevance Scoring

The ranking of projects is determined by a transparent mathematical heuristic:

$$\text{Project Relevance Score} = \text{Clamp}\Big(\text{Base} + \Delta_{\text{Targeted Gaps}} + \Delta_{\text{Demonstrated}} + \Delta_{\text{Prerequisites}} + \Delta_{\text{Stage}} + \Delta_{\text{PortfolioValue}}, 0, 100\Big)$$

### Mathematical Weights:
- **Base Score:** $+10.0$
- **Targeted Core Gap:** $+20.0$ per matched missing `core` competency
- **Targeted Supporting Gap:** $+12.0$ per matched missing `supporting` competency
- **Targeted Advanced Gap:** $+8.0$ per matched missing `advanced` competency
- **Demonstrated Skill Fit:** $+5.0$ per demonstrated canonical skill
- **Prerequisites Satisfied:** $+15.0$ if all project prerequisites are met in user profile
- **Prerequisites Missing Penalty:** $-15.0$ if prerequisites remain unsatisfied
- **Roadmap Stage Alignment:** $+10.0$ if project matches current roadmap stage
- **Portfolio Value:** $+5.0$ for `very_high`, $+3.0$ for `high`

The output is bounded in $[0.0, 100.0]$ and labeled strictly as **"Project Relevance Score"**.

---

## 7. Portfolio Intelligence

The upgraded `/portfolio` page connects:
$$\text{Career Target} + \text{Required Skills} + \text{Roadmap Progress} + \text{Projects} + \text{Evidence}$$

It presents:
1. Target track header with user override indicator.
2. Skills covered vs skills still missing (ontology comparison).
3. Projects in progress and completed projects.
4. Tangible portfolio evidence items completed vs pending.
5. Interactive project evidence checklist and repository deliverable linking.

---

## 8. Evidence Model

Every curated project requires specific, verifiable portfolio artifacts:
- **Source Code Repository:** Clean git history, semantic commits.
- **Technical Documentation / README:** Architecture diagrams, setup steps, performance metrics.
- **Executable Deliverables:** Interactive demo notebooks, container images, benchmark reports, or deployed APIs.
- **Verification Criteria:** Do not claim that checking a box "proves employment readiness." The interface labels items as *"Portfolio Evidence"* and *"Demonstrated Project Work"*.

---

## 9. Certificate Handling

In `/portfolio/certificates`, no mock or synthetic certificates are fabricated.
- Users record authentic certificates: title, provider, issue date, credential ID, credential URL, related skill, and optional verification URL.
- Certificates contribute to portfolio evidence only when explicitly entered by the user.

---

## 10. Achievement Handling

All achievements in `/portfolio/achievements` are strictly **state-event derived** based on actual application actions:
- `ach-roadmap-<id>`: Triggered when a roadmap milestone is marked complete.
- `ach-proj-<id>`: Triggered when a career project status transitions to `completed`.
- `ach-cert-<id>`: Triggered when a verified certificate is added.
- No synthetic badges are displayed without verifiable user action provenance.

---

## 11. Career Plan Completion Formula

The aggregate dashboard metric is named **Career Plan Completion** (explicitly disclaiming employment or salary prediction):

$$\text{Career Plan Completion} = 0.30 \cdot S + 0.25 \cdot R + 0.15 \cdot L + 0.15 \cdot P + 0.15 \cdot E$$

Where:
- $S$: Required Skill Coverage Percentage ($\frac{\text{present required skills}}{\text{total required skills}} \times 100$)
- $R$: Roadmap Milestone Completion Percentage ($\frac{\text{completed milestones}}{\text{total milestones}} \times 100$)
- $L$: Learning Completion Percentage ($\frac{\text{completed/enrolled modules}}{\text{total recommended modules}} \times 100$)
- $P$: Project Completion Percentage ($\frac{\text{completed projects}}{\text{total tracked projects}} \times 100$)
- $E$: Portfolio Evidence Coverage Percentage ($\frac{\text{completed evidence items}}{\text{total recommended evidence items}} \times 100$)

---

## 12. API Design

### POST `/api/v1/career/projects/recommendations`
- **Request Body:**
  ```json
  {
    "skills": ["python", "machine_learning"],
    "target_career_track": "AI & Machine Learning Engineering"
  }
  ```
- **Response Body:**
  ```json
  {
    "target_career_track": "AI & Machine Learning Engineering",
    "target_source": "user_selected",
    "projects": [
      {
        "project_id": "ai-ml-02",
        "title": "Production Model Inference Microservice & SHAP Explainability API",
        "career_track": "AI & Machine Learning Engineering",
        "description": "...",
        "difficulty": "Intermediate",
        "estimated_effort": "20-25 hours",
        "skills_demonstrated": ["python", "machine_learning", "cloud", "critical_thinking"],
        "skills_targeted": ["cloud"],
        "prerequisites": ["python", "machine_learning"],
        "prerequisites_met": true,
        "recommended_stage": 3,
        "portfolio_value": "very_high",
        "relevance_score": 88.0,
        "matched_missing_skills": ["cloud"],
        "suggested_deliverables": ["FastAPI microservice codebase", "Docker container image"],
        "suggested_evidence": ["Public GitHub repository", "Locust load test report"]
      }
    ]
  }
  ```

### GET `/api/v1/career/projects/catalog`
- Query param: `career_track` (optional filter).
- Returns the complete curated catalog.

---

## 13. State Management

- Implemented strictly within existing `AppState` and versioned `localStorage`.
- Added state property: `careerProjects: Record<string, CareerProjectRecord>`.
- Actions:
  - `UPDATE_CAREER_PROJECT_STATUS`: updates status (`planned`, `in_progress`, `completed`).
  - `TOGGLE_PROJECT_EVIDENCE`: toggles specific evidence item checklist boolean.
  - `UPDATE_PROJECT_DELIVERABLE_LINK`: persists repository or live demo URL.
- Zero Redux, zero external database engines (no MongoDB).

---

## 14. Data Quality Audit Results

A full programmatic audit of all backend and frontend assets was executed (`verify_phase_6.py`):

| Check Item | Threshold | Audit Finding | Status |
| :--- | :--- | :--- | :--- |
| Duplicate Project IDs | 0 | 0 duplicates found | **PASS** |
| Invalid Skill IDs | 0 | 0 unknown tokens in catalog | **PASS** |
| Missing Project Metadata | 0 | 0 incomplete projects | **PASS** |
| Placeholder URLs (`example.com`) | 0 | 0 placeholder URLs | **PASS** |
| Career Track Label Mismatches | 0 | 0 mismatches across 4 classes | **PASS** |
| Orphaned Catalog Resources | 0 | All mapped to canonical skills | **PASS** |

---

## 15. Test Results

### Backend Automated Test Suite (`pytest`):
- **70 passed in 1.88s** (55 Phase 3.5-5 tests + 15 Phase 6 Project Intelligence tests).
- 0 failures, 0 regressions.

### Frontend Automated Test Suite (`npm test`):
- **58 passed in 5 suites** (Phase 3.6: 12 tests, Phase 4: 5 tests, UI-V2.2: 11 tests, Phase 5: 15 tests, Phase 6: 15 tests).
- 0 failures.

### Static Analysis & Build:
- `npm run typecheck`: **0 errors**.
- `npm run build`: **Success** in 5.99s.

---

## 16. Manual Verification Cases

| Case | Input Skills | Expected ML Prediction | Verified Behaviors |
| :--- | :--- | :--- | :--- |
| **Case A** | `python`, `ai`, `programming` | AI & Machine Learning Engineering | Skill gap calculated; 4 AI/ML projects recommended; top score 78.0; evidence checklist loaded. |
| **Case B** | `python`, `web_development`, `database_systems` | Software Development & Engineering | SDE projects recommended (Full-Stack Issue Tracker); project recommendations distinct from Case A. |
| **Case C** | `excel`, `communication`, `critical_thinking` | Data Analytics & Business Intelligence | Enterprise Relational Data Warehouse recommended; analytics/BI deliverables loaded. |
| **Case D** | `unknown_skill_xyz`, `python` | Evaluates `python` | `unknown_skill_xyz` isolated in `unknown_skills`; `python` recognized; no fake project mapping. |
| **Case E** | `python`, `ai`, `programming` with SDE override | AI & ML (0.67) | ML prediction intact; active target track is SDE; project recommendations switch to SDE track. |
| **Case F** | Complete roadmap item | N/A | Status updates to `completed`; next unlocked; progress persists in `localStorage`. |
| **Case G** | Mark project `completed` | N/A | Status persists; `ach-proj-<id>` achievement created; evidence checklist remains editable. |

---

## 17. Limitations

1. **Advisory Nature of ML:** The Candidate H Random Forest model is trained on survey and benchmark distributions. Class probabilities are not calibrated employment probabilities.
2. **Fixed Vocabulary:** Only the locked 29-feature vocabulary is recognized by the ML model. New tools (e.g. "Kubernetes") are mapped to canonical tokens (`cloud`, `devops`).
3. **Client-Side Persistence:** User progress is stored in browser `localStorage`. Multi-device synchronization requires future cloud persistence.
4. **Self-Reported Evidence:** Evidence checklists are student self-assessments; third-party verification is currently limited to user-provided verification URLs.

---

## 18. Governance & Compliance Sign-Off

- **Candidate H Random Forest Model:** Unaltered, locked, no retraining.
- **29-Feature Canonical Vocabulary:** Intact and preserved across all endpoints.
- **4 ML-Supported Tracks:** Fully preserved.
- **Language Policy:** Strictly prohibited phrases ("employability guarantee", "hiring probability", "salary prediction", "AI confidence for projects") are completely absent.
- **Ethical Safeguards:** All guidance is transparent, deterministic, and educational.

**Phase 6 is formally complete, validated, and signed off.**
