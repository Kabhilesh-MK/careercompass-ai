# CareerCompass AI — REST API Documentation (v1)

> [!IMPORTANT]
> **Production API Specification**:
> All active endpoints operate under the `/api/v1` prefix and are served by FastAPI.
> The authoritative machine learning model is **Candidate H** (`RandomForestClassifier`, 300 estimators, 29 binary skills, 4 canonical computing tracks).
> For full architecture, benchmarks, and runbooks, refer to [`docs/FINAL_PROJECT_REPORT.md`](file:///c:/Users/kabhi/Desktop/Semester%204%20projects/DSA%203.0/project-bolt-sb1-djprtkdr/project/docs/FINAL_PROJECT_REPORT.md) and [`docs/TECHNICAL_APPENDIX.md`](file:///c:/Users/kabhi/Desktop/Semester%204%20projects/DSA%203.0/project-bolt-sb1-djprtkdr/project/docs/TECHNICAL_APPENDIX.md).

---

## Base URLs

| Environment | Base URL |
|---|---|
| Local Development | `http://127.0.0.1:8000` |
| Containerized Docker | `http://localhost:8000` |
| Production Web Service | `https://your-api-name.onrender.com` |

Interactive OpenAPI documentation:
- Swagger UI: `/docs`
- ReDoc: `/redoc`
- OpenAPI JSON schema: `/openapi.json`

---

## 1. System Health & Diagnostics

### GET `/api/v1/health`
Lightweight liveness probe checking process availability.
- **Request**: No body or query parameters.
- **Response 200 OK**:
```json
{
  "status": "healthy",
  "app_env": "development",
  "timestamp": "2026-10-04T15:00:00Z"
}
```

### GET `/api/v1/ready`
Readiness probe verifying that Candidate H ML artifacts (`model.joblib`, `preprocessor.joblib`, and `metadata.json`) are fully loaded into memory.
- **Request**: No body.
- **Response 200 OK**:
```json
{
  "status": "ready",
  "model_loaded": true,
  "preprocessor_loaded": true,
  "metadata_loaded": true
}
```
- **Response 503 Service Unavailable**: Returned if any ML artifact is uninitialized.

### GET `/api/v1/model/info`
Returns public metadata, canonical vocabulary count, and training parameters for the locked production model.
- **Request**: No body.
- **Response 200 OK**:
```json
{
  "model_name": "CareerCompass Phase 3.4 Model (Candidate H)",
  "model_family": "RandomForestClassifier",
  "n_estimators": 300,
  "criterion": "gini",
  "feature_mode": "skills_only",
  "n_features": 29,
  "calibration": "uncalibrated",
  "active_classes": [
    "AI & Machine Learning Engineering",
    "Cloud, DevOps & Systems Engineering",
    "Data Analytics & Business Intelligence",
    "Software Development & Engineering"
  ],
  "disclaimer": "This model estimates the class distribution represented by the training benchmark. It is not a validated predictor of an individual's actual future career outcome."
}
```

---

## 2. Machine Learning Career Classification & Explanation

### GET `/api/v1/predictions/career/skills`
Returns the deterministic list of all 29 canonical technical skill tokens recognized by Candidate H.
- **Response 200 OK**:
```json
{
  "canonical_skills": [
    "ai", "autocad", "cad", "cloud", "communication", "critical_thinking",
    "data_analysis", "database_design", "database_systems", "design",
    "design_optimization", "excel", "experimentation", "lab_work",
    "machine_learning", "matlab", "negotiation", "observation", "plc",
    "power_analysis", "programming", "pscad", "python", "recording",
    "research", "sales", "simulation", "team_management", "web_development"
  ],
  "count": 29
}
```

### POST `/api/v1/predictions/career`
Executes classification over the input skill vector, outputting advisory class probabilities.
- **Request Body**:
```json
{
  "skills": ["python", "ai", "machine_learning", "data_analysis"]
}
```
- **Response 200 OK**:
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
- **Error Codes**:
  - `422 Unprocessable Entity`: Empty skills list, token length > 100 characters, or skills list > 100 items.
  - `503 Service Unavailable`: ML model service uninitialized.

### POST `/api/v1/predictions/career/explain`
Decomposes the model-predicted probability for the top track into local feature attributions using SHAP `TreeExplainer` (with deterministic `TreePathAttribution` fallback).
- **Request Body**:
```json
{
  "skills": ["python", "ai", "programming"]
}
```
- **Response 200 OK**:
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

## 3. Career Intelligence & Skill Gap Engine

### GET `/api/v1/career/ontology`
Returns the complete 4-track curriculum ontology, defining mandatory core competencies, secondary competencies, prerequisite relationships, and stages.
- **Response 200 OK**: Full JSON graph of all tracks and competencies.

### POST `/api/v1/career/intelligence`
Evaluates input skills against the selected track (or top model-predicted track), computing deterministic *Required-Skill Coverage*, prioritized missing skills, prerequisite dependencies, and 5-stage roadmap.
- **Request Body**:
```json
{
  "skills": ["python", "programming"],
  "target_career": "Software Development & Engineering"
}
```
- **Response 200 OK**:
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

## 4. Project Intelligence & Portfolio Recommendations

### GET `/api/v1/career/projects/catalog`
Returns all 16 curated technical projects (4 projects per track) with prerequisites, roadmap stage alignments, and deliverable checklists.
- **Response 200 OK**: Array of 16 project objects.

### POST `/api/v1/career/projects/recommendations`
Ranks catalog projects targeting the student's identified skill gaps via the deterministic *Rule-Based Project Relevance Score*.
- **Request Body**:
```json
{
  "skills": ["python", "programming"],
  "target_career": "Software Development & Engineering"
}
```
- **Response 200 OK**:
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

## 5. Security & Input Limits

1. **Maximum Skill Tokens**: Capped at 100 items per request.
2. **Maximum Token Length**: 100 characters per individual skill token.
3. **CORS Origins**: Must be explicitly configured via `ALLOWED_ORIGINS` / `CORS_ORIGINS`. Wildcards (`*`) are prohibited.
4. **Exception Sanitization**: Internal filepaths and stack traces are suppressed in API error responses.
