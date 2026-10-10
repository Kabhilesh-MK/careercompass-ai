# CareerCompass AI — Academic Presentation & Speaking Script

**Project:** CareerCompass AI — AI-Powered Career Intelligence  
**Duration:** 7–10 Minutes (12 Slides)  
**Format:** Slide Visual Summary + Verbatim Spoken Script + Examiner Q&A  

---

## Slide 1 — Title & Introduction

### 1. Slide Visual Content
- **Main Title**: CareerCompass AI: AI-Powered Career Intelligence
- **Subtitle**: An Academic Decision-Support Platform Integrating Interpretable Machine Learning and Deterministic Curriculum Progression
- **Student Information**: [Student Name] | Department of Computer Science & Engineering | Academic Year 2024–2025
- **Problem Statement in One Sentence**:
  > *Bridging the gap between raw student technical skill profiles and transparent, actionable career pathways using leak-free machine learning classification and deterministic curriculum planning.*

### 2. Spoken Script (Approx. 45 Seconds)
> "Good morning, respected members of the evaluation committee. Today, I am presenting **CareerCompass AI**, an AI-powered career intelligence and decision-support platform designed specifically for undergraduate engineering students.
>
> In engineering education, students frequently face immense cognitive friction when attempting to map their technical skills to viable computing specializations. Prior automated systems either treat students to opaque black-box scores, hallucinate out-of-order curriculum roadmaps through ungrounded generative models, or confound academic degree titles with true technical competence.
>
> CareerCompass AI solves this problem through an intentional, two-tier architecture: we employ a locked, mathematically evaluated Random Forest classifier to provide statistical career guidance, while enforcing deterministic, rule-based algorithms to govern downstream skill-gap analysis, prerequisite roadmapping, and portfolio verification."

### 3. Likely Examiner Question
> *"What makes this project different from existing online career recommendation quizzes or platforms like LinkedIn?"*

### 4. Strong Short Answer
> *"Most existing platforms either offer generic psychometric questionnaires that do not evaluate concrete technical skills, or proprietary black-box algorithms that provide no local feature explanations. Furthermore, they lack an integrated, prerequisite-aware curriculum engine that bridges the gap between identifying a missing skill and producing verifiable portfolio proof-of-work."*

---

## Slide 2 — Problem & Pedagogical Motivation

### 1. Slide Visual Content
- **Three Systemic Structural Dilemmas**:
  1. *Opaque Career Recommendations*: Students receive high-level classifications without knowing which specific skills drove the decision.
  2. *Fragmented Skill-Gap Planning*: Missing competencies are listed as isolated keywords without prerequisite sequencing or topological dependencies.
  3. *Absence of Portfolio Evidence*: Technical hiring evaluates tangible code repositories and deployed deliverables, yet advisory tools stop at theoretical advice.
- **Cognitive Friction in Undergraduate Programs**: High student anxiety, unguided course electives, and wasted preparation time.

### 2. Spoken Script (Approx. 45 Seconds)
> "Let us examine the problem we are solving. When computer science undergraduates prepare for industry careers or campus placements, they encounter three core dilemmas.
>
> First, career advice is notoriously opaque. A student is told they are suitable for data science or software engineering, but never shown the exact probabilistic contributions of their underlying programming, database, or mathematical skills.
>
> Second, even when missing competencies are identified, advice remains fragmented. A student missing distributed systems cannot jump straight to cloud deployment without mastering networking and containerization prerequisites.
>
> Third, high-stakes technical hiring today does not evaluate multiple-choice quiz scores; it evaluates tangible proof-of-work: public Git repositories, live web deployments, and system documentation. CareerCompass addresses all three challenges within an integrated pipeline."

### 3. Likely Examiner Question
> *"Why not just let students use generative AI, such as ChatGPT, for career planning?"*

### 4. Strong Short Answer
> *"While Large Language Models are expressive, they suffer from ungrounded generative hallucinations, often invent non-existent technical dependencies, produce inconsistent outputs for identical inputs, and lack persistent mathematical evidence tracking. CareerCompass enforces strict reproducibility and deterministic pedagogical rules."*

---

## Slide 3 — Proposed Solution & System Pipeline

### 1. Slide Visual Content
- **Complete End-to-End Pipeline**:
  $$\text{Observed Skills} \xrightarrow{\text{ML}} \text{Advisory Prediction} \xrightarrow{\text{SHAP}} \text{Explanation} \xrightarrow{\text{Ontology}} \text{Skill Gap} \xrightarrow{\text{DAG}} \text{Roadmap} \xrightarrow{\text{Curated}} \text{Projects} \xrightarrow{\text{Proof}} \text{Portfolio}$$
- **Architectural Demarcation Table**:
  - **Statistical ML Domain**: Candidate H Random Forest (300 trees, 29 binary skills) $\to$ Top Track + Uncalibrated Voting Probabilities + Local SHAP Attributions.
  - **Deterministic Curriculum Domain**: Curated 4-Track Competency Ontology + Topological DAG Prerequisite Traversal + Mathematical Coverage Formulas.
- **Human Agency**: Student target career override operates independently without corrupting underlying ML inference.

### 2. Spoken Script (Approx. 50 Seconds)
> "Here is our proposed solution pipeline. As shown on the slide, CareerCompass enforces a formal architectural boundary between statistical inference and deterministic planning.
>
> The pipeline begins with the student's observed skills. Our locked machine learning model, Candidate H, evaluates these competencies to output predicted class probabilities across four canonical computing disciplines, accompanied by local SHAP feature attributions.
>
> Crucially, the machine learning model does not dictate the learning roadmap. Instead, the selected career target—whether adopted from the ML prediction or chosen via manual student override—is resolved against an expert-curated curriculum ontology. A Directed Acyclic Graph engine then evaluates prerequisite readiness, constructs a five-stage milestone roadmap, prioritizes missing skills, and matches the student to targeted portfolio projects. All deliverable proofs are tracked within an interactive portfolio dashboard."

### 3. Likely Examiner Question
> *"Why did you separate the ML classifier from the roadmap generation rather than training an end-to-end model?"*

### 4. Strong Short Answer
> *"Training an end-to-end model to generate roadmaps would require massive labeled student trajectory data that does not exist, while introducing severe hallucination risks. Prerequisite hierarchies are normative curriculum rules established by computer science educators, making a deterministic DAG mathematically sound, auditable, and 100% reproducible."*

---

## Slide 4 — Dataset & Feature Engineering

### 1. Slide Visual Content
- **Primary Technical Benchmark**:
  - Total Retained Records: **$N = 241$**
  - Partitioning: **$192$ Training Samples** ($79.7\%$) vs. **$49$ Holdout Samples** ($20.3\%$)
  - Splitting Protocol: Stratified 80/20 train/test split (`StratifiedShuffleSplit`, `random_state=42`)
- **Active Canonical Classes ($K = 4$)**:
  - *Software Development & Engineering (SDE)*: 84 records (67 train / 17 holdout)
  - *AI & Machine Learning Engineering (AI/ML)*: 76 records (61 train / 15 holdout)
  - *Data Analytics & Business Intelligence (DA/BI)*: 62 records (49 train / 13 holdout)
  - *Cloud, DevOps & Systems Engineering*: 19 records (15 train / 4 holdout)
  - *(Inactive Class: Database & Data Engineering excluded due to 0 native primary samples)*
- **Feature Space**: 29 canonical binary technical skill indicators ($x_i \in \{0, 1\}$).
- **Leakage Prevention & Confounder Elimination**:
  - Degree titles (`Education_Level`, `Specialization`) pruned to eliminate institutional confounding.
  - `MultiHotSkillEncoder` fitted strictly in-fold during cross-validation.

### 2. Spoken Script (Approx. 50 Seconds)
> "Turning to the data foundation: we established our primary benchmark from 241 retained student technical profiles categorized across four canonical computing disciplines: Software Development, AI/ML, Data Analytics, and Cloud/DevOps. A fifth track, Database Engineering, was excluded because it contained zero native primary records.
>
> The 241 records were partitioned using an 80/20 stratified shuffle split into 192 training records and an untouched holdout set of 49 records.
>
> On the feature engineering side, we made a vital academic decision: we completely eliminated degree titles, specializations, and demographic variables. In exploratory testing, degree titles acted as severe confounders—correlating with institutional enrollment rather than transferable skills. We encoded the input strictly as 29 canonical binary technical skills, with the encoder fitted strictly in-fold to prevent data leakage."

### 3. Likely Examiner Question
> *"Why did you use binary indicators rather than continuous skill proficiency ratings like 1 to 10?"*

### 4. Strong Short Answer
> *"Self-reported ratings on a 1-to-10 scale suffer from severe subjective calibration bias: one student's '7' in Python may be another's '4'. Binary indicators capture verifiable skill presence, creating an objective baseline that is resilient to subjective self-assessment variance."*

---

## Slide 5 — Model Exploration & Methodology

### 1. Slide Visual Content
- **Candidate Search Space**: Eight pre-declared configurations evaluated under identical 5-fold Stratified Cross-Validation on the 192 training records:
  - Linear Family: Multinomial Logistic Regression (Candidates A, B, E, F)
  - Tree Ensemble Family: Random Forest with 300 trees (Candidates C, D, G, H)
  - Feature Regimes: Combined (60 features), Categorical-only (31 features), Skills-only (29 features)
  - Weighting Regimes: Unweighted (`None`) vs. Cost-sensitive (`balanced`)
- **Evaluation Criteria**:
  - Primary Metric: **Macro-averaged F1 score** (enforcing equal penalty across majority and minority classes).
  - Probabilistic Quality: **Multiclass Log Loss** (evaluating cross-entropy probability distributions).
  - Ranking Reliability: **Top-2 Accuracy** (evaluating whether the true career is within the model's top two choices).

### 2. Spoken Script (Approx. 50 Seconds)
> "In our machine learning methodology, we formulated the task as a supervised multiclass classification problem. To ensure rigorous scientific selection, we pre-declared eight candidate configurations across two algorithm families—Multinomial Logistic Regression and Random Forest ensembles—evaluated over three feature subsets and two class-weighting regimes.
>
> All candidates were benchmarked using 5-fold Stratified Cross-Validation on the 192 training records.
>
> Because our dataset exhibits natural class imbalance—ranging from 84 Software Engineering records down to 19 Cloud/DevOps records—standard accuracy is deceptive. A naive majority classifier could achieve 67% accuracy while completely failing smaller classes. Therefore, we enforced Macro-averaged F1 as our primary performance arbiter, combined with Multiclass Log Loss to penalize overconfident misclassifications, and Top-2 Accuracy to assess ranked career discovery."

### 3. Likely Examiner Question
> *"Why didn't you evaluate deep neural networks or Multi-Layer Perceptrons on this dataset?"*

### 4. Strong Short Answer
> *"Deep learning architectures typically require thousands of training records to avoid severe overfitting on tabular data. On a 192-sample benchmark with 29 binary features, tree-based ensembles like Random Forest have proven theoretical superiority, lower variance, and direct compatibility with exact Shapley value computation."*

---

## Slide 6 — Final Model (Candidate H) & Benchmark Results

### 1. Slide Visual Content
- **Locked Architecture (Candidate H)**:
  - `RandomForestClassifier(n_estimators=300, criterion='gini', class_weight=None, random_state=42)`
  - Feature Space: 29 canonical binary technical skills ($x_i \in \{0, 1\}$)
- **Validation Results Summary Table**:
  | Evaluation Metric | 5-Fold CV Mean ($N = 192$) | Final Holdout ($N = 49$) | Benchmark Consistency |
  |---|:---:|:---:|---|
  | **Overall Accuracy** | $0.7858 \pm 0.0667$ | **$0.7959$** (39/49) | Consistent out-of-sample performance |
  | **Macro F1 Score** | $0.6226 \pm 0.0506$ | **$0.6302$** | Preserves macro balance across classes |
  | **Weighted F1 Score** | $0.7510 \pm 0.0656$ | **$0.7589$** | High representation across class support |
  | **Multiclass Log Loss** | $0.3768 \pm 0.0453$ | **$0.3874$** | High probability consistency; no holdout degradation |
  | **Top-2 Accuracy** | $1.0000 \pm 0.0000$ | **$1.0000$** (49/49) | 100% of true tracks in top-2 outputs |
- **Formal Scientific Disclaimer**:
  > *These figures reflect held-out benchmark performance on collegiate student profiles; they do NOT represent real-world career success guarantees.*

### 2. Spoken Script (Approx. 50 Seconds)
> "Here are our final experimental results. Candidate H—a 300-tree Random Forest operating strictly on 29 technical skills—was locked as our final production model.
>
> In cross-validation, Candidate H achieved the lowest Multiclass Log Loss across all eight candidates at 0.3768, representing a 20% probabilistic error reduction over the baseline Logistic Regression model. It achieved a CV Macro F1 of 0.6226 and an accuracy of 78.58%.
>
> When evaluated strictly once on the untouched 49-sample holdout partition, Candidate H achieved 79.59% accuracy, a Macro F1 of 63.02%, and a Log Loss of 0.3874. Note the minimal delta between cross-validation and holdout scores: this confirms that no substantial holdout degradation occurred. Furthermore, Candidate H achieved 100% Top-2 accuracy, proving that every student's true career track was contained within the model's top two recommendations.
>
> I must explicitly state: these are benchmark validation metrics, not real-world employment prediction accuracy."

### 3. Likely Examiner Question
> *"Why did you choose Candidate H when Candidate B achieved a higher CV Macro F1 of 0.6883?"*

### 4. Strong Short Answer
> *"Candidate B achieved a higher Macro F1 solely through artificial balanced class weighting. However, that weighting caused severe false alarms, cutting Software Engineering recall from 70% down to 34% and elevating log loss above 0.52. Candidate H was selected because it preserves superior probabilistic quality, lowest log loss, and unconfounded skills-only governance."*

---

## Slide 7 — Minority Class Sparsity & Documented Limitations

### 1. Slide Visual Content
- **Acute Minority Class: Cloud, DevOps & Systems Engineering**:
  - Sample Support: **15 Training Samples** ($7.8\%$) and **4 Holdout Samples** ($8.2\%$)
  - Empirical Holdout Performance: **$0/4$ Recall ($0.0\%$)** under default argmax decision rule
- **Scientific Root Cause**:
  - Extensive feature overlap: Cloud profiles share core programming and web development skills with Software Engineering.
  - SDE holds 34.8% prior support vs. 7.8% for Cloud. Under standard argmax, SDE's predicted voting probability dominates.
- **Experimental Mitigations Explored**:
  - *Class-Weighting Ablation*: Boosted Cloud recall to $73.3\%$, but catastrophically degraded SDE recall to $34.3\%$.
  - *Decision Threshold Tuning*: Lowering Cloud threshold to $\tau \in [0.25, 0.30]$ recovers recall to $80\%$, but was preserved as an exploratory study rather than hardcoded.
- **Transparent Academic Disclosure**: Limitation is explicitly documented in the system UI and model cards.

### 2. Spoken Script (Approx. 50 Seconds)
> "A core strength of academic research is the transparent disclosure of limitations. On Slide 7, we examine the Cloud, DevOps & Systems Engineering track.
>
> Cloud/DevOps represents an acute minority class: only 15 records in training and 4 in holdout. Under the standard argmax decision rule, Candidate H predicted zero instances of Cloud/DevOps in the holdout set, resulting in 0/4 recall.
>
> Through confusion matrix analysis, we discovered that Cloud profiles share substantial core programming and web development tokens with Software Engineering. Because Software Engineering has four times higher representation in the training data, its model-predicted ensemble voting probabilities consistently edge out Cloud under standard argmax.
>
> While we demonstrated that balanced weighting or threshold tuning can recover Cloud recall, both generate severe false alarms on Software Engineering. We chose to retain the unweighted argmax model to preserve probabilistic consistency, while openly documenting this minority limitation."

### 3. Likely Examiner Question
> *"If the model cannot predict Cloud/DevOps on the holdout set, is it safe to use in practice?"*

### 4. Strong Short Answer
> *"Yes, because CareerCompass is an advisory decision-support system, not a filtering gate. First, Cloud is frequently present as the secondary probability. Second, our human-in-the-loop architecture allows any student targeting Cloud/DevOps to manually select it as an override, immediately unlocking the complete Cloud curriculum ontology, roadmap, and project catalog."*

---

## Slide 8 — Explainability Framework (Non-Causal SHAP)

### 1. Slide Visual Content
- **Two-Tier Explainability Architecture**:
  - Primary Explainer: **SHAP `TreeExplainer`** (`feature_perturbation='tree_path_dependent'`)
  - Deterministic Fallback: **`TreePathAttribution`** ($\Delta p = \text{leaf} - \text{root}$)
- **Additive Local Attribution**:
  $$P(\text{Track} \mid \mathbf{x}) \approx \text{Base Value} + \sum_{j=1}^{29} \phi_j(\mathbf{x})$$
- **Visual Example**:
  - Positive Contributions ($\phi > 0$): `python` (+0.18), `machine_learning` (+0.24) pushing toward AI/ML.
  - Negative Contributions ($\phi < 0$): Missing `web_development` (-0.06) pulling away from SDE.
- **Scientific Standard**:
  > *Attributions explain local model behavior relative to the training distribution. They are strictly NON-CAUSAL and do not guarantee real-world hiring outcomes.*

### 2. Spoken Script (Approx. 45 Seconds)
> "To prevent black-box decision making, CareerCompass implements instance-level explainability. As detailed on Slide 8, we deploy SHAP TreeExplainer with an exact, deterministic TreePathAttribution fallback.
>
> For every prediction, the system decomposes the predicted probability into additive Shapley contributions. For example, if a student is predicted for AI & Machine Learning with 74% probability, the interface demonstrates exactly how positive attributions from 'Python' and 'Machine Learning' elevated the probability above the baseline, while the absence of 'Web Development' reduced the likelihood of Software Engineering.
>
> We enforce a strict scientific disclaimer: these attributions represent model-behavior explanations relative to historical training data. They describe statistical associations, not causal real-world guarantees that acquiring a skill will automatically cause employment."

### 3. Likely Examiner Question
> *"Why did you build a TreePathAttribution fallback if SHAP TreeExplainer is already included?"*

### 4. Strong Short Answer
> *"In production environments, SHAP C-extensions or background thread states can occasionally encounter memory or timeout exceptions. The deterministic TreePathAttribution parses the scikit-learn decision paths directly in native Python, guaranteeing that the system never crashes and never resorts to fake placeholder explanations."*

---

## Slide 9 — Deterministic Career Intelligence & DAG Roadmapping

### 1. Slide Visual Content
- **Curated Competency Ontology (Curated Product Knowledge)**:
  - Human-expert curriculum design defining core and secondary competencies for all 4 tracks.
- **Mathematical Required-Skill Coverage Formula**:
  $$\text{Required-Skill Coverage (\%)} = \frac{|S_{\text{student}} \cap S_{\text{core}}(c^*)|}{|S_{\text{core}}(c^*)|} \times 100$$
- **Directed Acyclic Graph (DAG) Prerequisite Engine**:
  - Topological sorting dynamically tags missing skills as **Available** (unlocked) or **Blocked** (unfulfilled dependencies).
- **5-Stage Sequential Roadmap**:
  $$\text{Stage 1: Prerequisites} \to \text{Stage 2: Core} \to \text{Stage 3: Applied} \to \text{Stage 4: Systems} \to \text{Stage 5: Capstone}$$
- **Human-in-the-Loop Override**: Student can override target career without altering the underlying ML prediction.

### 2. Spoken Script (Approx. 50 Seconds)
> "Once statistical classification concludes, our deterministic Career Intelligence Engine takes over.
>
> On Slide 9, you see how we structure career progression. The system evaluates the target career against our curated competency ontology. It computes Required-Skill Coverage through an exact mathematical formula, distinguishing essential core competencies from complementary secondary skills.
>
> To structure learning, we implemented a Directed Acyclic Graph prerequisite engine. Missing skills are evaluated topologically: if a student lacks SQL, advanced Database Design is flagged as 'Blocked', while Introductory Databases is tagged as 'Available'.
>
> These competencies are synthesized into a 5-stage sequential roadmap: progressing from Prerequisites and Core Fundamentals through to Capstone Synthesis. Furthermore, students maintain full agency: they can accept the ML recommendation or set an override, empowering exploration without losing the underlying statistical prediction."

### 3. Likely Examiner Question
> *"What happens if a student overrides the ML model recommendation to an entirely unsuitable track?"*

### 4. Strong Short Answer
> *"The system transparently displays both: the original ML probability remains visible, but the ontology and DAG dynamically recalculate to show the student their exact skill coverage and prerequisite path for the new target. This educates students on the true distance to their aspirational career without gatekeeping."*

---

## Slide 10 — Project Intelligence & Portfolio Evidence Tracking

### 1. Slide Visual Content
- **Curated Project Catalog (16 Projects)**: Four multi-stage projects per career track.
- **Rule-Based Project Relevance Score**:
  $$\text{Relevance Score} = \min\left(100, \; \frac{2.0 \cdot |S_{\text{proj}} \cap S_{\text{core\_missing}}| + 1.0 \cdot |S_{\text{proj}} \cap S_{\text{sec\_missing}}|}{\max(1, |S_{\text{target}}|)} \times 100\right)$$
  *(Explicit Note: This is an auditable relevance index, NOT an AI confidence score).*
- **Evidence Checklist**: Public GitHub repository, live interactive deployment, architecture diagram, automated test suite.
- **Portfolio Evidence Coverage Formula**:
  $$\text{Portfolio Evidence Coverage (\%)} = \frac{|S_{\text{verified}}|}{|S_{\text{target\_required}}|} \times 100$$
  *(Educational proof metric, not proof of professional competence).*
- **Client State Persistence**: Zero-mock storage immutably serialized to `localStorage`.

### 2. Spoken Script (Approx. 50 Seconds)
> "On Slide 10, we translate roadmap milestones into tangible deliverables through Project and Portfolio Intelligence.
>
> We curated a catalog of 16 multi-stage technical projects across the four career disciplines. To guide students, our backend calculates a rule-based Project Relevance Score. This formula specifically weights projects that address a student's missing core competencies while validating prerequisite readiness. I want to emphasize: this is an auditable mathematical index, not an artificial AI confidence score.
>
> When a student undertakes a project, they must satisfy a strict evidence checklist: submitting a public Git repository, live deployment URL, architecture diagram, and test suite. We quantify portfolio progress through the Portfolio Evidence Coverage metric.
>
> All project milestones, deliverable links, and earned badges are serialized immutably to client `localStorage`, allowing students to refresh or return without data loss."

### 3. Likely Examiner Question
> *"Does a 100% Portfolio Evidence Coverage score guarantee that a student is ready for an industry job?"*

### 4. Strong Short Answer
> *"No, and we include an explicit ethical disclaimer regarding this. Portfolio Evidence Coverage measures educational completion of structured project deliverables within the platform; it does not independently verify professional coding standards or guarantee hiring outcomes."*

---

## Slide 11 — Architecture, Verification & Deployment Readiness

### 1. Slide Visual Content
- **Full-Stack Technology Stack**:
  - Frontend: React 18, TypeScript 5.5, Vite, Tailwind CSS.
  - Backend: FastAPI, Python 3.12, Uvicorn, Pydantic v2.
  - ML & Explainability: scikit-learn 1.5, SHAP, Joblib.
  - Architecture: Modular REST API under `/api/v1` with Lifespan Singleton loader.
- **Quality Assurance & Verification**:
  - **178 Automated Regression Tests Passed**:
    - Backend Pytest Suite: **74 passed** (Contracts, security, CORS, services)
    - ML Benchmark Suite: **46 passed, 1 skipped** (Splits, leakage, Candidate H, SHAP)
    - Frontend TSX Suite: **58 passed** (Reducers, API integration, persistence)
  - Static Typecheck: **0 TypeScript errors** (`tsc --noEmit`)
  - Production Bundle: **Clean Vite build generated**
- **Deployment Status**:
  - Docker containerization verified; deployment-ready academic system (not maintained as active commercial cloud subscription).

### 2. Spoken Script (Approx. 45 Seconds)
> "Slide 11 highlights our software engineering rigor. CareerCompass AI is built with modern, industry-standard technologies: React 18 and TypeScript on the frontend, and a high-performance FastAPI backend in Python 3.12.
>
> On application startup, a Lifespan context manager loads our locked Candidate H model and preprocessors as memory singletons in approximately 409 milliseconds, enabling subsequent inference latencies under 20 milliseconds in local benchmarks.
>
> Our codebase is thoroughly verified by 178 automated regression tests across backend REST contracts, ML leakage prevention, and frontend reducer immutability. The TypeScript codebase passes with zero compiler errors, and the Vite production build compiles cleanly. The system is containerized with Docker and is fully deployment-ready."

### 3. Likely Examiner Question
> *"How do you ensure the ML model artifacts cannot be tampered with while the web server is running?"*

### 4. Strong Short Answer
> *"The ModelService loads the model in read-only mode during the FastAPI lifespan startup. There are no training or write endpoints exposed in the API, and our backend regression tests verify that model parameters remain immutable across requests."*

---

## Slide 12 — Conclusion, Academic Limitations & Future Scope

### 1. Slide Visual Content
- **Summary of Project Contributions**:
  - Established a leak-free 4-track ML classification benchmark (79.59% accuracy, 63.02% Macro F1, 100% Top-2).
  - Deployed non-causal SHAP local explainability.
  - Created a deterministic 5-stage roadmap and 16-project portfolio intelligence workflow.
  - Implemented 178 automated regression tests with zero compiler errors.
- **Documented Academic Limitations**:
  - Benchmark sample size ($N = 241$; 192 train, 49 holdout).
  - Acute minority class sparsity in Cloud/DevOps (0/4 holdout recall).
  - Binary skill representation ($x_i \in \{0, 1\}$) without proficiency depth.
  - Uncalibrated tree voting fractions.
  - External domain shift (Breejesh dataset transfer Macro F1 = $0.2721$).
  - Curated, human-expert ontology and self-reported project deliverables.
- **Future Research Directions**:
  - Multi-institutional student dataset collection.
  - Continuous skill fluency modeling.
  - Automated GitHub API commit and test coverage verification.
  - Longitudinal career outcome studies over 3–5 years.

### 2. Spoken Script (Approx. 50 Seconds)
> "In conclusion, CareerCompass AI demonstrates how machine learning and deterministic curriculum planning can combine to deliver transparent, actionable educational guidance. We achieved 79.59% accuracy and 100% Top-2 accuracy on our held-out benchmark, coupled with transparent SHAP explanations and a 178-test verified full-stack implementation.
>
> At the same time, we openly document our limitations: a small benchmark of 241 records, zero holdout recall on the minority Cloud track under standard argmax, binary skill modeling, and domain shift when tested on external college data where Macro F1 dropped to 27.21%.
>
> In future work, we plan to expand dataset partnerships across institutions, integrate continuous skill proficiency grading, and connect automated GitHub webhooks to verify student code submissions.
>
> Thank you, professors. I am now ready for your questions."

### 3. Likely Examiner Question
> *"What is the single most valuable lesson you learned from conducting this research?"*

### 4. Strong Short Answer
> *"The critical importance of architectural honesty: realizing that machine learning should be applied where statistical pattern recognition excels—such as skill-to-career alignment—while deterministic, rule-based algorithms should govern high-stakes educational prerequisites, roadmaps, and evidence verification to prevent hallucinations."*
