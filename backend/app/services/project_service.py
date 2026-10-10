"""Project service — canonical project catalogue, matching engine, and recommendations."""

from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any, Optional
from bson import ObjectId

from ml.dataset.career_knowledge_base import KNOWLEDGE_BASE
from app.services.career_discovery_service import (
    CANONICAL_CAREERS,
    CAREER_CATEGORIES,
    to_slug,
    resolve_canonical_career,
    evaluate_skill_gap_for_user,
)
from app.database.connection import get_db

# ---------------------------------------------------------------------------
# Canonical Project Catalogue Builder
# ---------------------------------------------------------------------------

_PROJECT_SKILL_MAP: dict[str, list[str]] = {
    # Software Engineer
    "Build a RESTful API with FastAPI / Spring Boot": ["Python", "Java", "SQL", "Git"],
    "Design a URL shortener with Redis caching": ["Python", "Problem Solving", "Git", "Linux"],
    "Implement a mini compiler / interpreter": ["C++", "Java", "Problem Solving"],
    "Build a task-queue system from scratch": ["Python", "Docker", "Linux", "Git"],

    # Frontend Developer
    "Build a responsive portfolio website": ["HTML", "CSS", "JavaScript", "Git"],
    "Clone a popular SaaS landing page": ["React", "HTML", "CSS", "JavaScript"],
    "Create a real-time chat UI with WebSockets": ["React", "JavaScript", "CSS"],
    "Build a component library with Storybook": ["React", "CSS", "GitHub"],

    # Backend Developer
    "E-commerce backend with microservices": ["Java", "NodeJS", "SQL", "Docker"],
    "OAuth2 authentication provider": ["Python", "NodeJS", "SQL", "Git"],
    "High-throughput streaming pipeline with Kafka": ["Java", "Python", "Linux", "Docker"],
    "Distributed key-value store": ["C++", "Python", "Problem Solving"],

    # Full Stack Developer
    "Full-stack social media platform": ["React", "NodeJS", "MongoDB", "Git"],
    "Project management SaaS (Trello clone)": ["React", "SQL", "NodeJS", "GitHub"],
    "Collaborative whiteboard with WebSockets": ["React", "JavaScript", "NodeJS"],
    "Developer job board with ATS parsing": ["React", "Python", "SQL", "Docker"],

    # Mobile App Developer
    "Cross-platform fitness tracker": ["React", "JavaScript", "Git"],
    "Social messaging mobile app": ["React", "NodeJS", "MongoDB"],
    "Offline-first note-taking app": ["JavaScript", "SQL", "Problem Solving"],
    "Ride-sharing mobile UI clone": ["React", "CSS", "Git"],

    # DevOps Engineer
    "End-to-end CI/CD pipeline on GitHub Actions": ["Git", "GitHub", "Docker", "Linux"],
    "Multi-tier application deployment on Kubernetes": ["Docker", "Linux", "AWS"],
    "Infrastructure as Code with Terraform on AWS": ["AWS", "Linux", "Git"],
    "Centralized observability stack with Prometheus": ["Linux", "Docker", "AWS"],

    # Cloud Engineer
    "Serverless event-driven architecture on AWS": ["AWS", "Python", "SQL"],
    "Multi-region disaster recovery architecture": ["AWS", "Azure", "Linux"],
    "Hybrid-cloud VPN connectivity lab": ["Azure", "AWS", "Linux"],
    "Cloud cost optimization automation bot": ["Python", "AWS", "Azure"],

    # Data Analyst
    "Exploratory analysis of a Kaggle public dataset": ["Python", "SQL", "Statistics", "Excel"],
    "Build a sales KPI dashboard in Power BI": ["Power BI", "SQL", "Excel"],
    "Customer churn analysis with cohort analysis": ["Python", "SQL", "Statistics"],
    "A/B test analysis with statistical significance": ["Statistics", "Python", "Excel"],

    # Data Scientist
    "Customer lifetime value prediction model": ["Python", "Machine Learning", "SQL", "Statistics"],
    "Sentiment analysis on consumer reviews with NLP": ["Python", "Machine Learning", "Deep Learning"],
    "Credit card fraud detection with imbalanced data": ["Python", "Machine Learning", "Statistics"],
    "Recommendation engine for an e-commerce platform": ["Python", "Machine Learning", "SQL"],

    # ML Engineer
    "End-to-end MLOps pipeline with MLflow": ["Python", "Machine Learning", "Docker", "Linux"],
    "Deploy a computer vision model with Triton server": ["Deep Learning", "Python", "Docker"],
    "Real-time fraud detection inference service": ["Machine Learning", "Python", "SQL", "Docker"],
    "Fine-tune an open-source LLM with LoRA": ["Deep Learning", "Python", "Linux"],

    # AI Engineer
    "RAG-based enterprise question-answering assistant": ["Python", "Deep Learning", "SQL"],
    "Autonomous agent workflow with tool calling": ["Python", "Problem Solving", "Git"],
    "Multimodal image and text search engine": ["Deep Learning", "Python", "Docker"],
    "Fine-tune a domain-specific conversational AI": ["Python", "Deep Learning", "Linux"],

    # Cybersecurity Analyst
    "Home lab SIEM setup with Elastic / Splunk": ["Linux", "Git", "Problem Solving"],
    "Automated vulnerability scanner with Python": ["Python", "Linux", "Git"],
    "Threat hunting report on MITRE ATT&CK techniques": ["Linux", "Communication", "Problem Solving"],
    "Phishing campaign simulation and awareness report": ["Communication", "Problem Solving"],

    # QA Engineer
    "Automated API testing framework with PyTest": ["Python", "Git", "SQL"],
    "End-to-end UI automation suite with Playwright": ["JavaScript", "Python", "Git"],
    "Performance benchmarking suite with Locust": ["Python", "Linux", "Problem Solving"],
    "CI-integrated regression test pipeline": ["Git", "GitHub", "Docker"],

    # Business Analyst
    "Enterprise business process model with BPMN": ["Excel", "Communication", "Problem Solving"],
    "Executive business case and ROI analysis": ["Excel", "Power BI", "Communication"],
    "Requirements traceability matrix for SaaS": ["Communication", "Teamwork", "Problem Solving"],
    "Customer journey mapping and gap analysis": ["Communication", "Problem Solving"],
}

_PROJECT_DESCRIPTIONS: dict[str, str] = {
    "Build a RESTful API with FastAPI / Spring Boot": "Architect a production-grade REST API with JWT authentication, relational database persistence, and Swagger documentation.",
    "Design a URL shortener with Redis caching": "Develop high-throughput URL shortening service utilizing Redis caching, rate-limiting, and collision-resistant hashing.",
    "Implement a mini compiler / interpreter": "Create an AST-based tokenizer, parser, and tree-walk interpreter demonstrating deep knowledge of computer science theory.",
    "Build a task-queue system from scratch": "Implement an asynchronous background worker pool with message brokers, retry logic, and worker heartbeat checks.",
    "Build a responsive portfolio website": "Design and build an accessible, modern, high-performance web portfolio featuring dark mode and semantic HTML5.",
    "Clone a popular SaaS landing page": "Replicate pixel-perfect layouts, responsive typography, modern CSS animations, and interactive navigation elements.",
    "Create a real-time chat UI with WebSockets": "Develop an interactive chat interface supporting typing indicators, online presence, and message history.",
    "Build a component library with Storybook": "Construct a reusable design system of accessible UI primitives documented in Storybook with unit tests.",
    "E-commerce backend with microservices": "Build modular services for catalog, cart, and payment processing with Dockerized service communication.",
    "OAuth2 authentication provider": "Implement robust user authentication supporting OAuth2 password, refresh tokens, role-based access control, and CSRF protection.",
    "High-throughput streaming pipeline with Kafka": "Construct event-driven streaming consumer and producer pipelines processing telemetry data at scale.",
    "Distributed key-value store": "Implement a distributed storage engine with consensus simulation, in-memory caching, and write-ahead logging.",
    "Full-stack social media platform": "End-to-end web application with rich profiles, post feeds, media uploads, and database relationships.",
    "Project management SaaS (Trello clone)": "Full-stack kanban application with drag-and-drop task boards, member permissions, and activity logs.",
    "Collaborative whiteboard with WebSockets": "Real-time canvas drawing and note collaboration engine with multi-user presence indicators.",
    "Developer job board with ATS parsing": "Build a job board platform featuring candidate applications, resume parsing, and employer dashboard.",
    "Cross-platform fitness tracker": "Mobile application tracking workouts, calories, and visual progress charts with local persistent storage.",
    "Social messaging mobile app": "Mobile chat application with push notifications, contact synchronization, and multimedia sharing.",
    "Offline-first note-taking app": "Develop a lightweight note organizer that syncs seamlessly when network connectivity is restored.",
    "Ride-sharing mobile UI clone": "Modern mobile interface featuring live map routing, vehicle selection, and ride estimation sheets.",
    "End-to-end CI/CD pipeline on GitHub Actions": "Automate linting, unit testing, container build, security scanning, and cloud deployment on git push.",
    "Multi-tier application deployment on Kubernetes": "Deploy containerized frontend, backend, and database pods with ingress routing, ConfigMaps, and Secrets.",
    "Infrastructure as Code with Terraform on AWS": "Provision VPC, subnets, EC2 instances, and managed RDS databases reproducibly using Terraform.",
    "Centralized observability stack with Prometheus": "Deploy Prometheus and Grafana dashboards tracking container resource metrics, latency, and error rates.",
    "Serverless event-driven architecture on AWS": "Build an event processing system using AWS Lambda, S3 triggers, DynamoDB, and API Gateway.",
    "Multi-region disaster recovery architecture": "Architect cross-region replication, Route 53 health check failovers, and backup validation drills.",
    "Hybrid-cloud VPN connectivity lab": "Configure secure IPsec tunnels, virtual network gateways, and route tables linking on-premises and cloud resources.",
    "Cloud cost optimization automation bot": "Implement an automated script identifying unattached EBS volumes, idle instances, and right-sizing suggestions.",
    "Exploratory analysis of a Kaggle public dataset": "Perform data cleansing, statistical profiling, distribution visualization, and actionable business synthesis.",
    "Build a sales KPI dashboard in Power BI": "Transform raw ERP data into an interactive executive dashboard with DAX measures and drill-through filters.",
    "Customer churn analysis with cohort analysis": "Analyze customer retention cohorts, compute survival rates, and identify risk drivers using SQL and Python.",
    "A/B test analysis with statistical significance": "Formulate hypotheses, calculate p-values, verify statistical power, and prepare executive recommendations.",
    "Customer lifetime value prediction model": "Train machine learning regression models estimating future revenue contributions by customer segment.",
    "Sentiment analysis on consumer reviews with NLP": "Process text datasets with TF-IDF and transformer tokenizers to classify customer feedback sentiment.",
    "Credit card fraud detection with imbalanced data": "Develop anomaly detection models utilizing SMOTE, precision-recall curves, and cost-sensitive evaluation.",
    "Recommendation engine for an e-commerce platform": "Build collaborative filtering and content-based recommendation algorithms for product cross-selling.",
    "End-to-end MLOps pipeline with MLflow": "Implement model versioning, experiment tracking, automated validation, and Dockerized model serving.",
    "Deploy a computer vision model with Triton server": "Containerize deep learning vision inference with batching, GPU acceleration, and low-latency gRPC APIs.",
    "Real-time fraud detection inference service": "Build microsecond-latency ML inference service consuming transactions and returning risk scores.",
    "Fine-tune an open-source LLM with LoRA": "Parameter-efficient fine-tuning of open-source language models on domain instruction datasets.",
    "RAG-based enterprise question-answering assistant": "Construct retrieval-augmented generation pipeline with vector databases, embeddings, and citation tracking.",
    "Autonomous agent workflow with tool calling": "Develop LLM agent framework capable of multi-step reasoning, external API queries, and structured data output.",
    "Multimodal image and text search engine": "Embed images and text into shared vector spaces (CLIP) for natural language semantic image retrieval.",
    "Fine-tune a domain-specific conversational AI": "Train domain-aligned chat models with reinforcement from human feedback (RLHF) and evaluation rubrics.",
    "Home lab SIEM setup with Elastic / Splunk": "Ingest system audit logs, configure detection alert rules, and investigate suspicious authentication anomalies.",
    "Automated vulnerability scanner with Python": "Script port scanners and network service probes to flag outdated software and misconfigurations.",
    "Threat hunting report on MITRE ATT&CK techniques": "Analyze endpoint adversary behavior, map attack vectors to MITRE ATT&CK, and document mitigation controls.",
    "Phishing campaign simulation and awareness report": "Design simulated credential-harvesting assessments and author defensive posture recommendations.",
    "Automated API testing framework with PyTest": "Develop automated test suites covering positive, negative, edge cases, and load validation for REST APIs.",
    "End-to-end UI automation suite with Playwright": "Implement page-object models automating user journeys, responsive visual regression, and accessibility checks.",
    "Performance benchmarking suite with Locust": "Simulate concurrent user traffic spikes, pinpoint backend bottlenecks, and chart response time percentiles.",
    "CI-integrated regression test pipeline": "Orchestrate automated test runs in GitHub Actions, generating JUnit reports and blocking broken commits.",
    "Enterprise business process model with BPMN": "Document as-is and to-be organizational workflows identifying operational waste and automation targets.",
    "Executive business case and ROI analysis": "Formulate financial models, net present value (NPV), and strategic justification for technology investments.",
    "Requirements traceability matrix for SaaS": "Structure functional requirements, user stories, acceptance criteria, and verification mappings.",
    "Customer journey mapping and gap analysis": "Map end-to-end customer touchpoints, friction bottlenecks, and digital self-service enhancement opportunities.",
}


def _build_canonical_catalogue() -> list[dict[str, Any]]:
    """Build the master catalog of all 56 canonical projects across 14 careers."""
    catalogue = []
    for career in sorted(CANONICAL_CAREERS):
        kb_item = KNOWLEDGE_BASE.get(career, {})
        category = CAREER_CATEGORIES.get(career, "Technology")
        slug = to_slug(career)
        kb_projects = kb_item.get("projects", [])

        for idx, title in enumerate(kb_projects):
            p_id = f"proj-{slug}-{idx + 1}"
            skills = _PROJECT_SKILL_MAP.get(title, kb_item.get("required_skills", [])[:3])
            description = _PROJECT_DESCRIPTIONS.get(
                title,
                f"A practical hands-on capstone project practicing core {career} competencies and portfolio readiness.",
            )
            difficulty = "Beginner" if idx == 0 else ("Advanced" if idx == len(kb_projects) - 1 else "Intermediate")
            duration = "2-3 weeks" if difficulty == "Beginner" else ("3-4 weeks" if difficulty == "Intermediate" else "4-6 weeks")

            catalogue.append({
                "id": p_id,
                "_id": p_id,
                "title": title,
                "description": description,
                "career": career,
                "career_slug": slug,
                "category": category,
                "skills": skills,
                "difficulty": difficulty,
                "duration": duration,
                "learning_outcomes": [
                    f"Practical mastery of {', '.join(skills[:2])}",
                    f"Portfolio evidence tailored for {career} roles",
                    "Production-grade problem solving and clean implementation",
                ],
                "prerequisites": skills[:2] if difficulty != "Beginner" else [],
            })
    return catalogue


CANONICAL_PROJECTS: list[dict[str, Any]] = _build_canonical_catalogue()
PROJECT_BY_ID: dict[str, dict[str, Any]] = {p["id"]: p for p in CANONICAL_PROJECTS}


# ---------------------------------------------------------------------------
# Project Matching & Scoring Logic
# ---------------------------------------------------------------------------

def calculate_project_score(
    project: dict[str, Any],
    target_career: Optional[str],
    skill_gaps: list[dict[str, Any]],
    user_skills: dict[str, float],
    roadmap_skills: set[str],
    is_completed: bool,
) -> tuple[int, list[str], str]:
    """Calculate deterministic project relevance score (0 - 100).

    Formula:
      Relevance = Career Alignment (35)
                + Skill Gap Coverage (35)
                + Roadmap Alignment (20)
                + Difficulty Suitability (10)
                - Completed Penalty (50)
    """
    score = 0
    reasons = []

    # 1. Career Alignment (max 35)
    if target_career:
        canonical_target = resolve_canonical_career(target_career) or target_career
        if project["career"].lower() == canonical_target.lower():
            score += 35
            reasons.append(f"Directly aligned with your {project['career']} career goal")
        elif project["category"] == CAREER_CATEGORIES.get(canonical_target, ""):
            score += 15
            reasons.append(f"Covers relevant {project['category']} domain concepts")

    # 2. Skill Gap Coverage (max 35)
    gap_by_name = {g["name"].lower(): g for g in skill_gaps}
    matched_gaps = []
    gap_score = 0

    for sk in project["skills"]:
        sk_lower = sk.lower()
        if sk_lower in gap_by_name:
            gap_item = gap_by_name[sk_lower]
            priority = gap_item.get("priority", "Important")
            matched_gaps.append(sk)
            if priority == "Critical":
                gap_score += 15
            elif priority in ("Important", "High"):
                gap_score += 10
            else:
                gap_score += 5

    gap_score = min(35, gap_score)
    score += gap_score
    if matched_gaps:
        reasons.append(f"Practices your prioritized skill gaps in {', '.join(matched_gaps)}")

    # 3. Roadmap Alignment (max 20)
    matched_roadmap = [sk for sk in project["skills"] if sk.lower() in {s.lower() for s in roadmap_skills}]
    if matched_roadmap:
        score += 20
        reasons.append(f"Aligns with active roadmap target skills ({', '.join(matched_roadmap)})")

    # 4. Difficulty Suitability (max 10)
    avg_skill = 50.0
    if user_skills:
        avg_skill = sum(user_skills.values()) / max(1, len(user_skills))

    diff = project["difficulty"]
    if diff == "Beginner" and avg_skill <= 50:
        score += 10
    elif diff == "Intermediate" and 40 <= avg_skill <= 75:
        score += 10
    elif diff == "Advanced" and avg_skill >= 65:
        score += 10
    else:
        score += 5

    # 5. Completed Penalty (-50)
    if is_completed:
        score = max(10, score - 50)
        reasons.append("Already completed")

    final_score = min(100, max(15, score))
    primary_reason = ". ".join(reasons) + "." if reasons else f"Develops hands-on experience in {', '.join(project['skills'])}."

    return final_score, matched_gaps, primary_reason


# ---------------------------------------------------------------------------
# Project Service API Functions
# ---------------------------------------------------------------------------

async def list_projects(
    career: Optional[str] = None,
    skill: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    user_id: Optional[str] = None,
) -> list[dict[str, Any]]:
    """List projects with optional filtering and user progress overlay."""
    results = [dict(p) for p in CANONICAL_PROJECTS]

    # Filter by career
    if career:
        canonical_career = resolve_canonical_career(career)
        if canonical_career:
            results = [p for p in results if p["career"].lower() == canonical_career.lower()]
        else:
            slug = to_slug(career)
            results = [p for p in results if p["career_slug"] == slug]

    # Filter by skill
    if skill:
        sk_lower = skill.strip().lower()
        results = [p for p in results if any(s.lower() == sk_lower for s in p["skills"])]

    # Filter by difficulty
    if difficulty and difficulty.lower() != "all":
        diff_lower = difficulty.strip().lower()
        results = [p for p in results if p["difficulty"].lower() == diff_lower]

    # Filter by search
    if search:
        q = search.strip().lower()
        results = [
            p for p in results
            if q in p["title"].lower()
            or q in p["description"].lower()
            or any(q in s.lower() for s in p["skills"])
            or q in p["career"].lower()
        ]

    # Overlay user progress & favorites if authenticated
    if user_id:
        db = get_db()
        progress_doc = await db.learning_progress.find_one({"user_id": user_id}) or {}
        user_projects = {p.get("project_id"): p for p in progress_doc.get("projects", [])}

        favorites_docs = await db.favorites.find({"user_id": user_id, "item_type": "project"}).to_list(100)
        fav_ids = {d["item_id"] for d in favorites_docs}

        for p in results:
            p_prog = user_projects.get(p["id"])
            if p_prog:
                p["status"] = "completed" if p_prog.get("completed") else ("in-progress" if p_prog.get("progress_pct", 0) > 0 else "not_started")
                p["progress_pct"] = p_prog.get("progress_pct", 100 if p_prog.get("completed") else 0)
                p["completed"] = p_prog.get("completed", False)
                p["completed_at"] = p_prog.get("completed_at")
            else:
                p["status"] = "not_started"
                p["progress_pct"] = 0
                p["completed"] = False
                p["completed_at"] = None

            p["is_favorite"] = p["id"] in fav_ids
    else:
        for p in results:
            p["status"] = "not_started"
            p["progress_pct"] = 0
            p["completed"] = False
            p["is_favorite"] = False

    return results


async def get_project_by_id(project_id: str, user_id: Optional[str] = None) -> Optional[dict[str, Any]]:
    """Retrieve a single project by ID with user activity state."""
    p = PROJECT_BY_ID.get(project_id)
    if not p:
        # Check if project exists in db.projects legacy
        db = get_db()
        try:
            doc = await db.projects.find_one({"_id": ObjectId(project_id)})
        except Exception:
            doc = await db.projects.find_one({"_id": project_id})
        if doc:
            doc["id"] = str(doc.get("_id"))
            p = doc

    if not p:
        return None

    item = dict(p)
    if user_id:
        db = get_db()
        progress_doc = await db.learning_progress.find_one({"user_id": user_id}) or {}
        user_projects = {x.get("project_id"): x for x in progress_doc.get("projects", [])}
        p_prog = user_projects.get(project_id)

        if p_prog:
            item["status"] = "completed" if p_prog.get("completed") else ("in-progress" if p_prog.get("progress_pct", 0) > 0 else "not_started")
            item["progress_pct"] = p_prog.get("progress_pct", 100 if p_prog.get("completed") else 0)
            item["completed"] = p_prog.get("completed", False)
        else:
            item["status"] = "not_started"
            item["progress_pct"] = 0
            item["completed"] = False

        fav = await db.favorites.find_one({"user_id": user_id, "item_type": "project", "item_id": project_id})
        item["is_favorite"] = fav is not None
    else:
        item["status"] = "not_started"
        item["progress_pct"] = 0
        item["completed"] = False
        item["is_favorite"] = False

    return item


async def get_recommended_projects(
    user_id: str,
    career: Optional[str] = None,
) -> dict[str, Any]:
    """Generate categorized project recommendations tailored to student gaps and active roadmap."""
    db = get_db()

    # 1. Resolve target career and fetch skill gap evaluation
    gap_data = await evaluate_skill_gap_for_user(user_id, career)
    target_role = gap_data.get("target_role") or "Software Engineer"
    missing_skills = gap_data.get("missing_skills", [])
    user_skills = {s["name"]: s["level"] for s in gap_data.get("current_skills", [])}

    # 2. Fetch active roadmap to identify target skills
    roadmap_doc = await db.roadmaps.find_one({"user_id": user_id, "target_role": target_role})
    roadmap_skills: set[str] = set()
    if roadmap_doc:
        for m in roadmap_doc.get("milestones", []):
            if m.get("status") != "completed":
                roadmap_skills.update(m.get("target_skills", []))

    # 3. Fetch user's project progress
    progress_doc = await db.learning_progress.find_one({"user_id": user_id}) or {}
    completed_ids = {
        p.get("project_id") for p in progress_doc.get("projects", []) if p.get("completed")
    }
    in_progress_ids = {
        p.get("project_id") for p in progress_doc.get("projects", []) if not p.get("completed") and p.get("progress_pct", 0) > 0
    }
    user_projects = {p.get("project_id"): p for p in progress_doc.get("projects", [])}

    # 4. Fetch favorites
    fav_docs = await db.favorites.find({"user_id": user_id, "item_type": "project"}).to_list(100)
    fav_ids = {d["item_id"] for d in fav_docs}

    # 5. Score all projects
    scored_projects = []
    for p in CANONICAL_PROJECTS:
        p_copy = dict(p)
        p_id = p_copy["id"]
        is_completed = p_id in completed_ids
        score, matched_gaps, reason = calculate_project_score(
            p_copy, target_role, missing_skills, user_skills, roadmap_skills, is_completed
        )

        p_copy["relevance_score"] = score
        p_copy["matched_gaps"] = matched_gaps
        p_copy["recommendation_reason"] = reason
        p_copy["completed"] = is_completed
        p_copy["is_favorite"] = p_id in fav_ids

        p_prog = user_projects.get(p_id)
        if p_prog:
            p_copy["status"] = "completed" if p_prog.get("completed") else ("in-progress" if p_prog.get("progress_pct", 0) > 0 else "not_started")
            p_copy["progress_pct"] = p_prog.get("progress_pct", 100 if p_prog.get("completed") else 0)
        else:
            p_copy["status"] = "not_started"
            p_copy["progress_pct"] = 0

        scored_projects.append(p_copy)

    # Sort projects by relevance score descending
    scored_projects.sort(key=lambda x: x["relevance_score"], reverse=True)

    # Categorize projects
    incomplete_projects = [p for p in scored_projects if not p["completed"]]
    completed_list = [p for p in scored_projects if p["completed"]]

    recommended_for_career = [
        p for p in incomplete_projects if p["career"].lower() == target_role.lower()
    ]
    gap_builders = [
        p for p in incomplete_projects if len(p.get("matched_gaps", [])) > 0
    ]
    roadmap_projects = [
        p for p in incomplete_projects
        if any(s.lower() in {rs.lower() for rs in roadmap_skills} for s in p["skills"])
    ]

    return {
        "target_role": target_role,
        "career_slug": to_slug(target_role),
        "total_projects": len(CANONICAL_PROJECTS),
        "total_completed": len(completed_list),
        "total_in_progress": len(in_progress_ids),
        "recommended": incomplete_projects[:6],
        "recommended_for_career": recommended_for_career[:4],
        "gap_builders": gap_builders[:4],
        "roadmap_projects": roadmap_projects[:4],
        "completed": completed_list,
    }
