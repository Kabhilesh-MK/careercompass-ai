# CareerCompass AI — Presentation Script & Slide Content

## Presentation: 20 Slides

---

### SLIDE 1 — Title

**Title**: CareerCompass AI
**Subtitle**: An Intelligent Skill Gap Analysis and Career Recommendation System Using Machine Learning
**Visual**: App hero screenshot or abstract gradient
**Bottom**: [Student Name] | [Department] | [College] | [Year]

---

### SLIDE 2 — The Problem

**Title**: The Challenge Students Face

**Content**:
- 📊 72% of engineering students feel uncertain about which career path to choose
- 🎯 Students lack awareness of industry-specific skill requirements
- 📚 No personalized, actionable roadmap to bridge skill gaps
- 🔄 Traditional counselling is expensive, time-consuming, and one-size-fits-all

**Visual**: Infographic showing student confusion vs. clear career path

---

### SLIDE 3 — Our Solution

**Title**: Introducing CareerCompass AI

**Content**:
- An **AI-powered career intelligence platform** built specifically for engineering students
- Input your skill profile → Get your ideal career, skill gaps, and a personalized roadmap
- Combines **Machine Learning + NLP + Web Technology** in one platform

**Visual**: App dashboard screenshot

---

### SLIDE 4 — Key Features

**Title**: What CareerCompass AI Offers

**Grid (2×4)**:
| 🎯 Career Prediction | 📊 Skill Gap Analysis |
|---|---|
| 🗺️ Learning Roadmap | 🚀 Placement Readiness |
| 📄 Resume Analyzer | 🤖 AI Mentor Chat |
| 🏆 Achievements | 📈 Analytics Dashboard |

---

### SLIDE 5 — Technology Stack

**Title**: Built With Industry-Standard Technologies

**Three columns**:

**Frontend**
- React 18 + TypeScript
- Tailwind CSS + Framer Motion
- Recharts (data viz)
- React Router v7

**Backend**
- FastAPI (Python 3.12)
- Pydantic v2 validation
- Stateless REST API under `/api/v1`
- Sub-50ms latency architecture

**ML Engine & Explainability**
- scikit-learn (Candidate H Random Forest, 300 trees)
- SHAP TreeExplainer local feature attributions
- Deterministic TreePathAttribution fallback
- 29 canonical binary skills, 4 computing tracks

---

### SLIDE 6 — System Architecture

**Title**: Architecture Overview

**Visual**: Architecture diagram
```
React + TS Frontend (Vite)
        ↕ REST API (JSON)
FastAPI Backend (Uvicorn)
        ↕ Lifespan Singleton
Locked ML Artifacts (Candidate H RF + SHAP)
        ↓ Deterministic Progression
Curated Skill Ontology + 5-Stage Roadmap + 16 Projects
```

**Key points**:
- Strict separation between statistical ML and deterministic planning
- Sub-50ms inference and explanation latencies
- Modular, deployment-ready architecture

---

### SLIDE 7 — Machine Learning Pipeline

**Title**: The ML Engine

**Visual**: Pipeline flowchart

**Steps**:
1. **Primary Benchmark**: 241 student profiles mapped to 4 canonical computing tracks
2. **Preprocessing**: MultiHotSkillEncoder over 29 canonical skills (fitted in-fold only)
3. **Training**: 8 pre-declared candidate configurations compared via 5-fold Stratified CV
4. **Selection**: Candidate H Random Forest chosen (lowest Log Loss: 0.3768, Macro F1: 0.6226)
5. **Inference**: Raw ensemble voting fractions + SHAP local feature attributions

---

### SLIDE 8 — ML Model Performance

**Title**: Candidate Model Comparison

**Cross-Validation Metrics (Primary N = 192 Records)**:
| Model Candidate | Algorithm Family | Feature Set | CV Macro F1 | CV Log Loss | CV Accuracy |
|---|---|---|:---:|:---:|:---:|
| **Candidate H ⭐** | **Random Forest (300)** | **Skills-Only (29)** | **0.6226 ± 0.051** | **0.3768 ± 0.045** | **78.58% ± 6.67%** |
| Candidate A | Logistic Regression | Combined (60) | 0.6188 ± 0.056 | 0.4704 ± 0.077 | 77.52% ± 7.71% |
| Candidate B | Logistic (Balanced) | Combined (60) | 0.6883 ± 0.065 | 0.5242 ± 0.070 | 72.38% ± 6.81% |
| Candidate C | Random Forest (300) | Combined (60) | 0.5766 ± 0.041 | 0.7139 ± 0.396 | 70.28% ± 5.52% |

**Holdout Validation (N = 49 Untouched Test Samples)**:
- On the held-out benchmark, Candidate H achieved:
  - Overall Accuracy: **79.59%** (39/49 correct)
  - Macro F1: **0.6302** | Weighted F1: **0.7589**
  - Multiclass Log Loss: **0.3874**
  - Top-2 Accuracy: **100.0%** (49/49 correct)
- Per-Track Recall:
  - AI/ML Recall: **100.0%** (15/15) | Data/BI Recall: **100.0%** (13/13)
  - Software Engineering Recall: **64.71%** (11/17)
  - Cloud/DevOps Recall: **0.0%** (0/4 correct; small-sample minority limitation: 15 train, 4 holdout)

---

### SLIDE 9 — Career Prediction Demo

**Title**: Career Prediction in Action

**Visual**: Screenshot of Career Prediction page

**Highlights**:
- Inputs 29 canonical binary skills → local benchmark latency <200ms
- Ranked 4 canonical computing tracks with predicted ensemble voting probabilities
- Model-predicted class probability display (e.g., 86% — ML Engineer)
- Powered by locked Candidate H RandomForest (300 trees, uncalibrated ensemble probabilities)

---

### SLIDE 10 — Skill Gap Analysis

**Title**: Know Exactly What to Learn

**Visual**: Screenshot of Skill Gap page

**Highlights**:
- Compares your skills against career requirements
- Identifies missing skills with priority levels (Critical → Low)
- Visual gap bar chart for easy understanding
- Match percentage score

---

### SLIDE 11 — Resume Analyzer

**Title**: AI-Powered Resume Analysis

**Visual**: Screenshot of Resume Analyzer page

**Features**:
- Drag-and-drop upload (PDF, DOC, DOCX, TXT)
- **ATS Score**: Keyword density against career requirements
- **Resume Score**: Structure + content quality (0-100)
- Extracted skills, projects, certifications
- Missing keywords highlighted in red
- 6 specific improvement suggestions

---

### SLIDE 12 — Learning Roadmap

**Title**: Your Personalized 6-Week Plan

**Visual**: Screenshot of Roadmap page + timeline component

**Highlights**:
- Generated from skill gap + career requirements
- Week-by-week milestones with tasks
- Progress tracking (complete milestones)
- Curated courses, certifications, and projects per milestone

---

### SLIDE 13 — Placement Readiness

**Title**: Are You Ready for Campus Placement?

**Visual**: Radar chart + score gauges

**Scoring formula**:
```
Score = Programming(30%) + Soft Skills(20%) + Projects(15%)
      + CGPA(15%) + Internship(10%) + Certs(5%) + Comm(5%)
```

**Levels**: Highly Ready → Ready → Moderately Ready → Needs Improvement

---

### SLIDE 14 — Gamification & Engagement

**Title**: Learn More, Earn More

**Visual**: Achievements page screenshot

**Features**:
- **18 achievement badges** (Python Expert, ML Ready, Placement Ready…)
- **XP points** system for motivation
- **Notification center** with unread count
- **Favorites** — bookmark courses, certs, careers
- **Learning Progress** tracker with streak counter

---

### SLIDE 15 — Admin Dashboard

**Title**: Platform Management & Analytics

**Visual**: Admin page screenshot

**Features**:
- User growth and registration trends
- Most predicted careers (pie chart)
- System health monitoring
- User management table
- Platform usage statistics

---

### SLIDE 16 — Database Design

**Title**: 15 MongoDB Collections

**Visual**: ER diagram / collection list

**Key Collections**:
- `users` — Student profiles
- `achievements` — Earned badges (user+key unique index)
- `notifications` — In-app alerts
- `favorites` — Bookmarked items
- `learning_progress` — Completion tracking
- `resume_analyses` — AI analysis results
- `predictions` — ML prediction history

---

### SLIDE 17 — Security & Performance

**Title**: Deployment-Ready Engineering

**Security**:
- JWT access + refresh token pattern
- bcrypt password hashing
- Rate limiting (10 req/60s on auth endpoints)
- Security headers (CSP, X-Frame-Options, XSS Protection)
- Input sanitization

**Performance**:
- Lazy-loaded React routes (code splitting)
- ML inference in `asyncio.to_thread()` (non-blocking)
- In-memory / MongoDB index optimizations
- Vendor chunk splitting (React, Charts, Motion)

---

### SLIDE 18 — Deployment

**Title**: Live on the Cloud

**Architecture**:
```
GitHub Repository
       ↓
Vercel CI/CD ──→ Frontend (https://careercompass.vercel.app)
Render CI/CD ──→ API (https://careercompass-api.onrender.com)
MongoDB Atlas  ──→ Database (cloud managed)
```

**Infrastructure**:
- `vercel.json` — SPA rewrites + cache headers
- `render.yaml` — Backend service definition
- `Dockerfile` + `docker-compose.yml` — Local dev
- Environment variables for all secrets

---

### SLIDE 19 — Limitations & Future Scope

**Title**: Documented Limitations & Future Scope

**Documented Limitations**:
- Minority class sparsity: Cloud/DevOps has 15 train, 4 holdout, 0 holdout recall
- Academic benchmark dataset (241 student profiles; external transfer to Breejesh yielded 0.2721 Macro F1)
- Non-causal explanations: SHAP attributions reflect model behavior relative to training distribution
- Curated ontology: Competencies, prerequisites, and project scores represent expert-curated knowledge
- Evidence metric: Portfolio Evidence Coverage measures completed student proofs, not certified competency
- Rule-based AI mentor: Deterministic advisory rules, avoiding ungrounded generative hallucinations

**Future Scope**:
1. 🤖 Guarded LLM integration with ontology-constrained prompt grounding
2. 📊 Live job market data (LinkedIn, Naukri API)
3. 📱 React Native mobile app
4. 🌐 Multi-language support (Hindi, Tamil)
5. 🤝 Recruiter portal for company-student matching
6. 🎤 AI mock interview simulator

---

### SLIDE 20 — Conclusion

**Title**: Summary & Key Milestones

**Key Milestones**:
- ✅ On the held-out benchmark, Candidate H achieved 79.59% accuracy and 63.02% Macro F1 (100% Top-2 accuracy)
- ✅ 178 Automated Regression Tests passed across backend, ML, and frontend suites
- ✅ Explainable AI via SHAP TreeExplainer & TreePath Attributions (strictly non-causal model-behavior explanations)
- ✅ Curated 4-track competency ontology, 5-stage roadmap & 16 projects
- ✅ Sub-50ms local benchmark endpoint latencies & deployment-ready architecture

**Impact**: Students get instant, personalized, data-driven career guidance that was previously unavailable or expensive.

**Live Demo**: [Your Vercel URL]
**GitHub**: [Your GitHub URL]
**API Docs**: [Your Render URL]/docs

---
*Thank you. Questions?*
