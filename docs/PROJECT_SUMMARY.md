# CAREERCOMPASS AI
## AI-Powered Career Intelligence: An Intelligent Skill Gap Analysis and Career Recommendation System Using Machine Learning

---

### Executive Project Summary & Defense Briefing
**Project Type**: Capstone Academic Project / Full-Stack Machine Learning System  
**Academic Department**: Computer Science & Engineering  
**Primary Audience**: Academic Supervisor, External Examiners, Review Panel  
**Final Release**: Phase 8 Submission Package (Production Release 1.0)  
**Authoritative ML Classifier**: Candidate H (`RandomForestClassifier`, 300 estimators, skills-only)  
**Status**: Formally Validated, Architecturally Hardened & Academically Defensible  

---

## 1. Project Overview & Motivation

Engineering and computer science students frequently face significant challenges when transitioning from academic coursework to professional technical careers:
- **Directional Ambiguity**: Uncertainty regarding which technical career track best aligns with their existing competencies.
- **Unstructured Competency Gaps**: Difficulty identifying which specific mandatory industry skills they lack and the prerequisite order in which they should be learned.
- **Disconnected Practical Building**: Absence of guidance linking theoretical skill gaps directly to real-world, portfolio-grade project deliverables.
- **Opaque Automated Guidance**: Disillusionment with existing advisory tools that rely on black-box predictions, generative hallucinations, or superficial psychometric quizzes.

**CareerCompass AI** solves these challenges through an end-to-end, deployment-ready academic system. The system bridges empirical statistical learning with deterministic pedagogical planning, taking student technical skills and translating them into an actionable, evidence-building career progression lifecycle:

$$\text{Skills} \xrightarrow{\text{ML}} \text{Prediction} \xrightarrow{\text{SHAP}} \text{Explanation} \xrightarrow{\text{Ontology}} \text{Skill Gap} \xrightarrow{\text{DAG}} \text{Roadmap} \xrightarrow{\text{Curated}} \text{Projects} \xrightarrow{\text{Proof}} \text{Portfolio}$$

---

## 2. Core Architectural Separation of Concerns

To preserve complete academic defensibility and prevent ungrounded generative outputs, CareerCompass enforces a strict architectural boundary between statistical machine learning and deterministic curriculum planning:

| Subsystem Domain | Components | Technical Mechanism | Academic Guarantee |
|---|---|---|---|
| **1. Statistical ML Core** | Career-Track Prediction, Model Probabilities | Locked Candidate H Random Forest (300 estimators, 29 binary skill features) | Empirical benchmark class distribution fit; raw tree voting fractions; zero degree-name confounding. |
| **2. Local Explainability** | Feature Attributions | SHAP `TreeExplainer` with deterministic `TreePathAttribution` fallback | Additive instance-level model-behavior explanations ($\Delta p$); strictly non-causal. |
| **3. Curated Ontology** | 4-Track Competency Graph, Prerequisite DAG | Expert-curated curriculum taxonomy & topological dependency rules | Curated product knowledge; normative pedagogical structure; not learned from data. |
| **4. Deterministic Progress** | Skill Gap %, 5-Stage Roadmap, Project Recommendations | Exact mathematical formulas & DAG graph traversal algorithms | 100% deterministic; rule-based pedagogical planning; auditable mathematical formulas. |
| **5. Evidence & Portfolio** | Deliverable Checklist, State Persistence | Centralized immutable React reducer + LocalStorage hydration | Self-reported deliverable verification; complete refresh persistence. |

---

## 3. Machine Learning Methodology & Benchmark Performance

### 3.1 Dataset & Feature Space Isolation
- **Primary Benchmark**: 241 retained student technical profiles categorized into 4 canonical computing tracks:
  1. *Software Development & Engineering* ($N = 84$)
  2. *AI & Machine Learning Engineering* ($N = 76$)
  3. *Data Analytics & Business Intelligence* ($N = 62$)
  4. *Cloud, DevOps & Systems Engineering* ($N = 19$)
- *Inactive Track*: `Database & Data Engineering` had zero native primary training records and was formally excluded to prevent synthetic fabrication.
- **Feature Space**: Exactly 29 binary multi-hot technical skill indicators ($x_j \in \{0, 1\}$). Academic degree titles (`Education_Level`, `Specialization`, `Interests`) were permanently eliminated from inputs to prevent degree-track confounding.
- **Data Splitting**: 80/20 Stratified Partitioning (`random_state=42`) into Training ($N = 192$) and Holdout ($N = 49$). Preprocessors were fitted strictly inside cross-validation training folds.

### 3.2 Candidate H Selection Rationale
Eight candidate configurations (Candidates A–H) were evaluated under controlled 5-fold Stratified Cross-Validation on the 192 training records. **Candidate H** was formally locked as the production model based on:
1. **Lowest Multiclass Log Loss**: Achieved **$0.3768 \pm 0.0453$** (lowest cross-entropy error across all 8 candidates).
2. **Comparable/Slightly Better Macro F1**: Achieved **$0.6226 \pm 0.0506$** (outperforming Candidate A's $0.6188$). While class-weighted candidates B and D achieved higher Macro F1 ($0.6883$ and $0.6741$), they severely degraded Software Engineering recall to ~34–37% and increased log loss.
3. **Skills-Only Feature Governance**: Operates exclusively over 29 technical skills, eliminating degree-title confounding.
4. **Probability Quality**: Maintained bounded minimum true-class probabilities ($0.2395$) and low fold-to-fold variance.

### 3.3 Holdout and Benchmark Evaluations
- **Primary Holdout ($N = 49$)**: On the held-out benchmark, Candidate H achieved **$79.59\%$** accuracy (39/49 correct), **$63.02\%$** Macro F1, **$0.7589$** Weighted F1, **$0.3874$** Log Loss, and **$100.0\%$** Top-2 accuracy.
  - *Per-Class*: AI/ML Recall $100.0\%$ (15/15), Data/BI Recall $100.0\%$ (13/13), SDE Recall $64.71\%$ (11/17).
  - *Cloud/DevOps Minority Limitation*: 15 training samples, 4 holdout samples, $0/4$ holdout recall under default argmax.
- **External Transfer Benchmark (Breejesh Dhar, $N = 311$)**: Evaluated under partial-schema zero-shot transfer against first-job titles (Accuracy: $0.6141$, Macro F1: $0.2721$). This reflects domain shift and is explicitly **not** real-world career accuracy.
- **Psychometric Alignment Benchmark (RIASEC, $N = 2,400$)**: Evaluated on psychometric inventories (Config B Macro F1: $0.9570$). This benchmark target is inherently tied to the RIASEC construct and does **not** establish real-world career prediction accuracy.

### 3.4 Calibration Decision
Under strict 5-fold CV evaluation, Platt/Sigmoid calibration degraded Log Loss (+23.8% to $0.4659$). Isotonic regression reduced ECE ($0.0383$) but worsened Maximum Calibration Error on the minority class ($0.1888$). Therefore, **uncalibrated ensemble voting probabilities were retained** for production, ensuring exact local additivity for SHAP feature attribution.

---

## 4. Career, Project, and Portfolio Intelligence

1. **Required-Skill Coverage**: Calculates exact mathematical coverage against track core requirements:
   $$\text{Required-Skill Coverage (\%)} = \frac{|S_{\text{student}} \cap S_{\text{core}}(c^*)|}{|S_{\text{core}}(c^*)|} \times 100$$
2. **Prerequisite DAG Engine**: Traverses directed dependencies to flag missing skills as *Available* (unlocked) or *Blocked* (prerequisites missing).
3. **5-Stage Sequential Roadmap**: Progresses through Prerequisites $\to$ Core Fundamentals $\to$ Applied Frameworks $\to$ Systems & Tooling $\to$ Capstone Synthesis.
4. **Rule-Based Project Relevance**: Ranks a curated catalog of 16 multi-stage technical projects:
   $$\text{Relevance Score} = \min\left(100, \; \frac{2.0 \cdot |S_{\text{proj}} \cap S_{\text{core\_missing}}| + 1.0 \cdot |S_{\text{proj}} \cap S_{\text{sec\_missing}}|}{\max(1, |S_{\text{target}}|)} \times 100\right)$$
5. **Portfolio Evidence Tracking**: Evaluates tangible deliverables (public Git repository, live interactive deployment, architecture documentation) and tracks *Portfolio Evidence Coverage %* (a portfolio coverage/evidence metric, not proof of professional competency).

---

## 5. System Implementation, Testing & Verification

- **Technology Stack**:
  - Backend: FastAPI, Python 3.12, scikit-learn, SHAP, Pydantic v2, Uvicorn.
  - Frontend: React 18, TypeScript 5.5, Vite, Tailwind CSS.
  - Orchestration: Docker, Docker Compose, Nginx.
- **Automated Quality Assurance (178 Passed Tests)**:
  - Backend Pytest Suite: **74 passed** (100% pass)
  - ML Benchmark Suite: **46 passed, 1 skipped** (100% pass)
  - Frontend TSX Suite: **58 passed** (100% pass)
  - Static Typecheck: `npm run typecheck` $\to$ **0 errors**
  - Production Bundle: `npm run build` $\to$ **Clean bundle generated**
- **Local Latency Benchmarks (50 iterations)**:
  - ML Startup Loading: **$409.44\text{ ms}$**
  - Prediction Endpoint: **$32.37\text{ ms}$**
  - Explanation Endpoint: **$41.38\text{ ms}$**
  - Career Intelligence Endpoint: **$31.91\text{ ms}$**
  - Project Recommendation Endpoint: **$33.67\text{ ms}$**

---

## 6. Academic Limitations & Ethical Safeguards

1. **Advisory Decision-Support**: System predictions reflect statistical associations within its collegiate training benchmark. The system must **never** be used for high-stakes hiring gating, candidate rejection, or automated admissions screening.
2. **Student Autonomy**: Students retain full agency via target track overrides, ensuring algorithms guide rather than constrain student choices.
3. **Minority Class Sparsity**: With only 15 training and 4 holdout instances, Cloud/DevOps performance cannot be reliably estimated under default argmax ($0/4$ holdout recall).
4. **Non-Causal Interpretability**: Feature attributions explain model behavior relative to the training distribution; they do not establish real-world causality.
5. **Data Privacy**: All inference executes locally on dedicated application servers with zero external transmission of student profiles to commercial third-party LLMs.

---

## 7. Submission Checklist & Project Status

- [x] Locked Candidate H Random Forest model integrity verified.
- [x] Confounder-free 29-feature canonical vocabulary established.
- [x] Four canonical computing tracks supported; inactive database class excluded.
- [x] SHAP and deterministic TreePath local explainability fully functional.
- [x] Curated competency ontology and DAG prerequisite engine operational.
- [x] 16 curated projects with rule-based relevance scoring integrated.
- [x] 178 automated regression tests passing across backend, ML, and frontend suites.
- [x] Sub-50ms local endpoint latency verified.
- [x] Production Docker containerization and deployment runbooks complete.
- [x] All academic claims, disclaimers, and limitations fully documented and defensible.

**Conclusion**: CareerCompass AI is a robust, mathematically sound, fully integrated, and academically defensible capstone software engineering project ready for final evaluation.
