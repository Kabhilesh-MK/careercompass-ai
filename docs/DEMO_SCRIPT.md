# CareerCompass AI — 5-Minute Live Demonstration Script

**Project:** CareerCompass AI — AI-Powered Career Intelligence  
**Target Duration:** Exactly 5 Minutes  
**Demonstration Scope:** End-to-End Walkthrough Across 15 Choreographed Steps  
**Audience:** Academic Examiners, Project Evaluators, Viva Committee  

---

## Pre-Demo Verification Checklist (Do 2 Minutes Before Evaluation)

1. **Backend Server Running**:
   ```bash
   cd backend
   venv\Scripts\activate
   uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```
2. **Frontend Dev Server Running**:
   ```bash
   npm run dev
   ```
3. **Verify Health Endpoints in Browser**:
   - `http://127.0.0.1:8000/api/v1/health` $\to$ `{"status": "healthy"}`
   - `http://127.0.0.1:8000/api/v1/ready` $\to$ `{"status": "ready", "model_loaded": true}`
4. **Open Frontend**:
   - Navigate to `http://localhost:5173` in Google Chrome or Edge.
   - Press `F12` to open DevTools Console to confirm **0 errors**.

---

## Demonstration Sequence (15 Steps)

### Step 1: Launch Application & System Verification
- **ACTION**: Open `http://localhost:5173` in the browser. Highlight the header showing system readiness.
- **WHAT EXAMINER SHOULD OBSERVE**:
  - The CareerCompass dashboard loads cleanly with a responsive hero banner and theme toggle.
  - No broken layout, no missing assets, and clean console logs.
- **WHAT TO SAY**:
  > *"Respected committee, I am launching the CareerCompass AI frontend on port 5173, connected to our FastAPI backend on port 8000. On process startup, our backend lifespan manager loaded our locked Candidate H Random Forest model into memory as a singleton in approximately 409 milliseconds, guaranteeing sub-50ms local endpoint latencies."*
- **BACKUP EXPLANATION IF SOMETHING FAILS**:
  > *"If the backend is not reached, check that port 8000 is active. The frontend automatically surfaces an explicit HTTP 503 service unavailable toast rather than displaying fake placeholder data, adhering to our strict zero-mock architectural policy."*

---

### Step 2: Enter Technical Skill Profile
- **ACTION**: Navigate to **Career Prediction** page. In the skill selector, select three canonical skills:
  - `Python`
  - `Machine Learning`
  - `Data Analysis`
- **WHAT EXAMINER SHOULD OBSERVE**:
  - The skills are highlighted as selected tags.
  - The canonical skill count dynamically increments to 3 selected out of 29.
- **WHAT TO SAY**:
  > *"Here on the Career Prediction page, a student inputs their acquired technical skills. The system normalizes raw text input and maps it against our leak-free 29-dimension canonical technical vocabulary. I have selected Python, Machine Learning, and Data Analysis."*
- **BACKUP EXPLANATION IF SOMETHING FAILS**:
  > *"If skill tags do not appear, click the 'Reset Selection' button to restore initial clean state from the `AppStateContext`."*

---

### Step 3: Generate Machine Learning Career Prediction
- **ACTION**: Click the primary action button: **Predict Career Alignment**.
- **WHAT EXAMINER SHOULD OBSERVE**:
  - A brief, subtle loading spinner appears for <100ms.
  - The prediction results card renders instantaneously.
  - The top recommended career track is prominently displayed as **AI & Machine Learning Engineering**.
- **WHAT TO SAY**:
  > *"When I click 'Predict Career Alignment', the frontend issues a POST request to `/api/v1/predictions/career`. In under 20 milliseconds, our locked 300-tree Random Forest evaluates the 29-dimensional binary vector and predicts 'AI & Machine Learning Engineering' as the primary career track."*
- **BACKUP EXPLANATION IF SOMETHING FAILS**:
  > *"If the network stalls, inspect the browser network tab. The request payload is a simple JSON array `{"skills": ["python", "machine_learning", "data_analysis"]}` validated via Pydantic v2."*

---

### Step 4: Inspect Probability Distribution & Ranking
- **ACTION**: Scroll to the **Model-Predicted Probability Distribution** chart.
- **WHAT EXAMINER SHOULD OBSERVE**:
  - A horizontal bar chart displaying probabilities for all 4 canonical tracks:
    - AI & Machine Learning Engineering: ~**78% to 84%**
    - Software Development & Engineering: ~**10% to 15%**
    - Data Analytics & Business Intelligence: ~**3% to 6%**
    - Cloud, DevOps & Systems Engineering: ~**1% to 2%**
  - Probabilities sum exactly to 100% (1.0000).
- **WHAT TO SAY**:
  > *"Notice that Candidate H outputs an uncalibrated ensemble voting probability distribution across all four canonical computing tracks. AI/ML leads with approximately 82% voting probability, with Software Development appearing as the viable top-2 alternative at 12%. This multi-track ranking reflects our benchmark finding where Candidate H achieved 100% Top-2 accuracy across all 49 holdout test samples."*
- **BACKUP EXPLANATION IF SOMETHING FAILS**:
  > *"The probability display is derived directly from `response.probabilities`. The ordering is strictly backend-governed to prevent client-side ranking discrepancies."*

---

### Step 5: Expand Local SHAP Feature Attribution
- **ACTION**: Click the button **Why This Prediction? (Explain Decision)**.
- **WHAT EXAMINER SHOULD OBSERVE**:
  - The explainability drawer expands, displaying instance-level feature attributions.
  - Green positive bars show `machine_learning` (+0.24) and `python` (+0.18) elevating the AI/ML probability.
  - Red negative bar shows absence of `web_development` (-0.06) pulling away from Software Engineering.
  - A scientific disclaimer badge appears: *"Model-behavior explanation relative to training benchmark; strictly non-causal."*
- **WHAT TO SAY**:
  > *"To ensure complete transparency, we do not stop at black-box predictions. Clicking 'Explain Decision' invokes SHAP TreeExplainer at `/api/v1/predictions/career/explain`. The chart shows exact additive Shapley contributions: Python and Machine Learning strongly elevated the AI/ML probability above the baseline, while the absence of Web Development reduced Software Engineering likelihood. As stated in our scientific disclaimer, this explains model behavior relative to training data, not real-world hiring causality."*
- **BACKUP EXPLANATION IF SOMETHING FAILS**:
  > *"If SHAP encounters background thread contention, the backend automatically triggers our native `TreePathAttribution` fallback, calculating path shifts directly from the tree leaves without breaking user experience."*

---

### Step 6: Navigate to Skill Gap Analysis
- **ACTION**: Click the button **View Skill Gap & Roadmap**, or select **Skill Gap** from the sidebar.
- **WHAT EXAMINER SHOULD OBSERVE**:
  - The Skill Gap page loads.
  - Target Career Track is currently active as **AI & Machine Learning Engineering**.
  - **Required-Skill Coverage** gauge displays an exact mathematical percentage: e.g., **50.0%** (2 out of 4 core skills acquired).
  - Two categorized lists appear:
    - *Missing Core Competencies*: `ai` (High priority)
    - *Missing Secondary Competencies*: `database_systems`, `cloud` (Medium priority)
- **WHAT TO SAY**:
  > *"We now transition from statistical inference to deterministic curriculum planning. The system resolves the predicted career against our curated competency ontology. The Required-Skill Coverage gauge computes an exact mathematical ratio: the student possesses 2 out of 4 mandatory core competencies, yielding exactly 50% coverage. Missing skills are categorized into high-priority core requirements and medium-priority secondary tools."*
- **BACKUP EXPLANATION IF SOMETHING FAILS**:
  > *"The coverage formula is strictly $|S_{\text{student}} \cap S_{\text{core}}| / |S_{\text{core}}| \times 100$, verified by unit tests in `test_career_intelligence.py`."*

---

### Step 7: Demonstrate Human-in-the-Loop Career Target Override
- **ACTION**: Locate the **Target Career Track** dropdown selector at the top of the Skill Gap page. Change the target from `AI & Machine Learning Engineering` to **Software Development & Engineering**.
- **WHAT EXAMINER SHOULD OBSERVE**:
  - The page dynamically updates instantly.
  - The badge indicates: *"Active Target: Software Development & Engineering (Student Override)"*.
  - A subtle info tag preserves the original ML prediction: *"Original ML Recommendation: AI & Machine Learning Engineering (82%)"*.
  - Required-Skill Coverage recalculates to **25.0%** (only Python is shared with SDE's core requirements: programming, web development, database systems).
- **WHAT TO SAY**:
  > *"A cornerstone of our philosophy is student agency. What if a student is predicted for AI/ML, but genuinely aspires to become a Software Engineer? As you can see, I can override the target track to Software Development. The system preserves the original ML prediction in state for transparency, but dynamically re-indexes the curriculum ontology to calculate the exact skill gap for their chosen aspiration."*
- **BACKUP EXPLANATION IF SOMETHING FAILS**:
  > *"The override dispatches `SET_CAREER_TARGET_OVERRIDE` to our centralized reducer, leaving `careerPrediction` immutable while updating `selectedCareerTarget`."*

---

### Step 8: Inspect 5-Stage DAG Prerequisite Roadmap
- **ACTION**: Scroll down to the **5-Stage Sequential Roadmap** section (or click **Roadmap** in navigation).
- **WHAT EXAMINER SHOULD OBSERVE**:
  - A vertical timeline showing 5 chronological stages:
    - Stage 1: Prerequisites & Tooling (e.g., Programming Fundamentals) — Status: *Completed* (Green)
    - Stage 2: Core Fundamentals (e.g., Database Systems) — Status: *In Progress / Unlocked* (Blue)
    - Stage 3: Applied Frameworks (e.g., Web Development Frameworks) — Status: *Locked* (Gray with lock icon)
    - Stage 4: Systems & Tooling — Status: *Locked*
    - Stage 5: Capstone Synthesis — Status: *Locked*
  - Dependency tags show that Stage 3 is blocked until Stage 2 database foundations are fulfilled.
- **WHAT TO SAY**:
  > *"Here is our 5-Stage Sequential Roadmap generated by our Directed Acyclic Graph engine. Notice that Stage 3 Applied Frameworks is locked: our DAG topological sorter detects that prerequisite database fundamentals in Stage 2 have not yet been acquired. This eliminates the learning roadmap hallucinations common in generic LLM advice."*
- **BACKUP EXPLANATION IF SOMETHING FAILS**:
  > *"Prerequisites are verified by topological sort rules in `backend/app/services/career_ontology.py`."*

---

### Step 9: Open Curated Learning Resource Recommendations
- **ACTION**: Click on the active milestone **Database Systems** in Stage 2.
- **WHAT EXAMINER SHOULD OBSERVE**:
  - An expandable drawer or modal opens showing recommended educational modules:
    - Course Title: *Relational Database Design & SQL Fundamentals*
    - Platform: *Stanford Online / Coursera*
    - Estimated Time: *15 Hours*
    - Difficulty: *Intermediate*
    - Direct URL link to verified syllabus.
- **WHAT TO SAY**:
  > *"Clicking on any milestone reveals curated learning resources. Each module links directly to verified university or industry courses with realistic completion hours and difficulty ratings, eliminating dead links and commercial fluff."*
- **BACKUP EXPLANATION IF SOMETHING FAILS**:
  > *"Resource mappings are defined in `src/data/learningResources.ts` and loaded synchronously from memory."*

---

### Step 10: View Rule-Based Project Recommendations
- **ACTION**: Navigate to **Project Recommendations** from the top navbar.
- **WHAT EXAMINER SHOULD OBSERVE**:
  - A catalog of technical projects ranked by **Project Relevance Score**:
    - Top Recommendation: *Full-Stack Task Management System* — Relevance Score: **85%**
    - Second Recommendation: *Distributed Cache Engine* — Relevance Score: **65%**
  - Project card lists: Target Track, Prerequisites Met (Yes), and Missing Skills Targeted (`web_development`, `database_systems`).
- **WHAT TO SAY**:
  > *"On the Project Recommendations page, our backend ranks projects from our 16-project catalog using our rule-based Project Relevance Score. This formula double-weights missing core competencies while validating that prerequisite skills are satisfied. It is an auditable mathematical index, not an opaque AI confidence score."*
- **BACKUP EXPLANATION IF SOMETHING FAILS**:
  > *"If projects are filtered out, toggle the 'Show All Tracks' filter at the top of the project catalog."*

---

### Step 11: Start a Capstone Project
- **ACTION**: Click the button **Start Project** on the *Full-Stack Task Management System* card.
- **WHAT EXAMINER SHOULD OBSERVE**:
  - The project status badge changes from *Available* to *In Progress* (Amber badge).
  - The project is dynamically added to the student's active portfolio workspace.
  - A success toast notification confirms: *"Project added to active portfolio workspace."*
- **WHAT TO SAY**:
  > *"When the student clicks 'Start Project', the project transitions to 'In Progress' and is synchronized into their active portfolio workspace. This initiates the tangible proof-of-work tracking sequence."*
- **BACKUP EXPLANATION IF SOMETHING FAILS**:
  > *"The action dispatches `UPDATE_CAREER_PROJECT_STATUS` with status `'in_progress'`."*

---

### Step 12: Add Deliverable Proof-of-Work Links
- **ACTION**: Navigate to **Portfolio Dashboard**. Expand the active project card. In the deliverable inputs, enter:
  - Repository URL: `https://github.com/student/fullstack-task-manager`
  - Live Demo URL: `https://task-manager-demo.vercel.app`
  - Documentation: Check the box *"Architecture Diagram & README Complete"*
- **WHAT EXAMINER SHOULD OBSERVE**:
  - The deliverable URLs are recorded with green verification checkmarks.
  - The evidence checklist updates to 3 of 3 items fulfilled.
- **WHAT TO SAY**:
  > *"In the Portfolio Dashboard, the student attaches verifiable evidence: a public GitHub repository, a live deployment URL on Vercel, and architecture documentation. Our philosophy requires tangible deliverables rather than self-reported quiz claims."*
- **BACKUP EXPLANATION IF SOMETHING FAILS**:
  > *"Deliverable links accept any valid URL string and update `project.deliverableLinks` in state."*

---

### Step 13: Complete Milestone & Observe Portfolio Evidence Metric
- **ACTION**: Click the button **Mark Project Complete**.
- **WHAT EXAMINER SHOULD OBSERVE**:
  - Project status updates to **Completed** (Green badge).
  - **Portfolio Evidence Coverage** increments from 0% to **33.3%**.
  - A state-derived achievement badge unlocks: *"Full-Stack Builder: Completed verified web project"*.
  - A scientific disclaimer appears below the gauge: *"Portfolio evidence coverage measures completed deliverables within the platform; it does not independently certify professional industry competency."*
- **WHAT TO SAY**:
  > *"Marking the project complete validates the acquired competencies. Notice that our Portfolio Evidence Coverage metric dynamically recalculates to 33.3%, and a state-derived achievement is earned. As stated in our ethical disclaimer, this metric quantifies completed deliverables; it does not claim to independently certify professional competency."*
- **BACKUP EXPLANATION IF SOMETHING FAILS**:
  > *"If the badge does not trigger, refresh the view; achievement evaluation runs automatically against completed project counts."*

---

### Step 14: Refresh Browser (Hard Refresh F5)
- **ACTION**: Press `F5` (or `Ctrl + Shift + R`) to completely reload the web page.
- **WHAT EXAMINER SHOULD OBSERVE**:
  - The page reloads from scratch.
  - No blank screens, no loading crashes, no missing state.
- **WHAT TO SAY**:
  > *"To demonstrate full architectural resilience, I will now execute a hard page reload via F5."*
- **BACKUP EXPLANATION IF SOMETHING FAILS**:
  > *"If the page fails to reload, verify that the Vite dev server is still running in the terminal."*

---

### Step 15: Demonstrate Zero-Data-Loss State Persistence
- **ACTION**: Point out the dashboard state immediately after the refresh.
- **WHAT EXAMINER SHOULD OBSERVE**:
  - The active target career remains **Software Development & Engineering** (preserving student override).
  - The original ML prediction (AI/ML Engineering, 82%) is still displayed.
  - The completed project remains **Completed** with its GitHub and Vercel links intact.
  - Portfolio Evidence Coverage remains exactly at **33.3%**.
  - The unlocked achievement badge remains visible in the trophy case.
- **WHAT TO SAY**:
  > *"As the committee can observe, every piece of user state was preserved perfectly. The student override, original ML prediction, completed project, deliverable links, and portfolio coverage percentage were immutably restored from browser `localStorage`.
  >
  > This concludes our live demonstration of CareerCompass AI: a transparent, leak-free, mathematically verified, and deployment-ready academic system."*
- **BACKUP EXPLANATION IF SOMETHING FAILS**:
  > *"State is managed by `AppStateContext` and serialized through `storageService.ts` with schema versioning."*

---

## Post-Demo Wrap-Up & Ready for Viva

After concluding Step 15:
1. Leave the Portfolio Dashboard visible on screen.
2. Open a terminal tab displaying the passing test suite:
   ```bash
   npm test
   pytest backend/tests/ -q
   ```
3. Look directly at the committee and say:
   > *"Thank you. The live system, REST API, and automated test suite are ready for your technical questions."*
