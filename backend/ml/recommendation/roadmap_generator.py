"""Adaptive, gap-driven learning roadmap generator.

Produces a personalized, variable-length milestone roadmap responsive to:
  • Selected / predicted target career
  • Actual prioritized skill gaps (Critical > Important > Developing)
  • Single source of truth knowledge base (projects, certs, interview topics)
  • Student readiness (3–4 milestones for strong profiles, 5–7 for gap remediation)
"""

from __future__ import annotations

from typing import Any

from ml.dataset.career_knowledge_base import KNOWLEDGE_BASE


def generate(
    predicted_career: str,
    missing_skills: list[dict[str, Any]],
    profile: dict[str, Any],
) -> list[dict[str, Any]]:
    """Generate an adaptive, gap-driven roadmap tailored to actual skill deficits."""
    kb = KNOWLEDGE_BASE.get(predicted_career, {})

    # Categorize missing skills by deterministic priority
    critical_gaps = [s for s in missing_skills if s.get("priority") == "Critical"]
    important_gaps = [s for s in missing_skills if s.get("priority") == "Important"]
    developing_gaps = [s for s in missing_skills if s.get("priority") == "Developing"]

    total_gaps = len(missing_skills)

    # -----------------------------------------------------------------------
    # Case 1: Zero or Minimal Gaps (<= 1 minor gap) -> Advanced Mastery Track
    # -----------------------------------------------------------------------
    if total_gaps <= 1:
        return _build_advanced_mastery_roadmap(predicted_career, missing_skills, kb)

    # -----------------------------------------------------------------------
    # Case 2: Gap-Driven Adaptive Track (3 to 7 milestones)
    # -----------------------------------------------------------------------
    milestones: list[dict[str, Any]] = []

    # Milestone 1: Primary Critical Foundations
    if critical_gaps:
        primary_crit = critical_gaps[:2]
        skill_names = [s["name"] for s in primary_crit]
        milestones.append({
            "id": f"ms-{len(milestones) + 1}",
            "week": f"Milestone {len(milestones) + 1}",
            "title": f"Foundational Mastery: {' & '.join(skill_names)}",
            "description": f"Target your highest-priority core deficits directly required for {predicted_career}.",
            "target_skills": skill_names,
            "priority": "Critical",
            "status": "in-progress",
            "progress": 0,
            "tasks": [
                f"Master fundamental concepts and syntax for {', '.join(skill_names)}",
                f"Complete hands-on problem sets and drills focusing on {skill_names[0]}",
                "Build mini-exercises verifying competency against industry benchmarks",
            ],
            "projects": [],
            "certifications": [],
            "resources": [{"title": c, "type": "course"} for c in kb.get("courses", [])[:2]],
        })

    # Milestone 2: Secondary Critical Skills (if >= 3 critical gaps)
    if len(critical_gaps) >= 3:
        sec_crit = critical_gaps[2:4]
        skill_names = [s["name"] for s in sec_crit]
        milestones.append({
            "id": f"ms-{len(milestones) + 1}",
            "week": f"Milestone {len(milestones) + 1}",
            "title": f"Core Competency Deep Dive: {' & '.join(skill_names)}",
            "description": f"Close remaining core requirements to build a complete foundation for {predicted_career}.",
            "target_skills": skill_names,
            "priority": "Critical",
            "status": "not_started",
            "progress": 0,
            "tasks": [
                f"Deep dive into advanced topics for {', '.join(skill_names)}",
                "Implement structured practice problems to reinforce practical implementation",
                "Review best practices and idiomatic patterns",
            ],
            "projects": [],
            "certifications": [],
            "resources": [{"title": c, "type": "course"} for c in kb.get("courses", [])[1:3]],
        })

    # Milestone 3: Important Domain Skills
    if important_gaps:
        imp_skills = important_gaps[:3]
        skill_names = [s["name"] for s in imp_skills]
        milestones.append({
            "id": f"ms-{len(milestones) + 1}",
            "week": f"Milestone {len(milestones) + 1}",
            "title": f"Domain Skill Building: {' & '.join(skill_names[:2])}",
            "description": f"Strengthen important technical proficiencies that differentiate your profile for {predicted_career}.",
            "target_skills": skill_names,
            "priority": "Important",
            "status": "not_started",
            "progress": 0,
            "tasks": [
                f"Study domain workflows using {', '.join(skill_names)}",
                f"Complete integration exercises linking {skill_names[0]} with your core skills",
                "Benchmark and optimize real-world problem solutions",
            ],
            "projects": [],
            "certifications": [],
            "resources": [],
        })

    # Milestone 4: Applied Capstone Project (Practical Application)
    kb_projects = kb.get("projects", ["Design and build a domain-specific production project"])
    capstone_title = kb_projects[0] if kb_projects else "Domain Capstone Project"
    primary_skills = [s["name"] for s in (critical_gaps + important_gaps)[:3]]
    milestones.append({
        "id": f"ms-{len(milestones) + 1}",
        "week": f"Milestone {len(milestones) + 1}",
        "title": f"Capstone Project: {capstone_title}",
        "description": f"Synthesize your acquired skills by building an end-to-end portfolio project for {predicted_career}.",
        "target_skills": primary_skills or [predicted_career],
        "priority": "Important",
        "status": "not_started",
        "progress": 0,
        "tasks": [
            f"Architect and implement {capstone_title}",
            "Write comprehensive tests, documentation, and a clean README",
            "Deploy to cloud environment and publish repository",
        ],
        "projects": [{"title": capstone_title, "category": predicted_career}],
        "certifications": [],
        "resources": [],
    })

    # Milestone 5: Industry Certification & Supporting Skills
    kb_certs = kb.get("certifications", ["Industry Recognized Professional Credential"])
    cert_title = kb_certs[0] if kb_certs else "Industry Credential"
    dev_skill_names = [s["name"] for s in developing_gaps[:2]]
    milestones.append({
        "id": f"ms-{len(milestones) + 1}",
        "week": f"Milestone {len(milestones) + 1}",
        "title": f"Credentialing & Supporting Competencies",
        "description": f"Earn recognized industry credentials and round out versatile supporting tools.",
        "target_skills": dev_skill_names or ["Cloud & Dev Tools"],
        "priority": "Developing",
        "status": "not_started",
        "progress": 0,
        "tasks": [
            f"Review official study objectives for {cert_title}",
            f"Gain familiarity with supporting developer tools: {', '.join(dev_skill_names) or 'Git/Linux'}",
            "Complete practice certification exam modules",
        ],
        "projects": [],
        "certifications": [{"title": cert_title, "status": "recommended"}],
        "resources": [],
    })

    # Milestone 6: Placement & Interview Readiness
    topics = kb.get("interview_topics", ["System Architecture", "Algorithms", "Domain Best Practices"])
    milestones.append({
        "id": f"ms-{len(milestones) + 1}",
        "week": f"Milestone {len(milestones) + 1}",
        "title": "Technical Interview & Placement Preparation",
        "description": f"Master core technical interview questions and align your portfolio for {predicted_career} hiring.",
        "target_skills": topics[:3],
        "priority": "Developing",
        "status": "not_started",
        "progress": 0,
        "tasks": [
            f"Prepare technical responses for focus areas: {', '.join(topics[:3])}",
            "Complete 3 timed technical mock interview sessions",
            "Refine resume bullets showcasing your completed capstone project",
        ],
        "projects": [],
        "certifications": [],
        "resources": [],
    })

    return milestones


# ---------------------------------------------------------------------------
# High-Readiness / Zero-Gap Track (3–4 Milestones)
# ---------------------------------------------------------------------------

def _build_advanced_mastery_roadmap(
    career: str,
    missing_skills: list[dict[str, Any]],
    kb: dict[str, Any],
) -> list[dict[str, Any]]:
    """Generate a high-velocity 3–4 milestone specialization track."""
    projects = kb.get("projects", ["Scalable Distributed System Architecture"])
    certs = kb.get("certifications", ["Industry Professional Credential"])
    topics = kb.get("interview_topics", ["System Architecture", "Performance Optimization"])

    target_gap_skill = missing_skills[0]["name"] if missing_skills else "Advanced Architecture"

    return [
        {
            "id": "ms-1",
            "week": "Milestone 1",
            "title": f"Advanced Architecture: {career}",
            "description": f"Your baseline skills meet role requirements. Deep-dive into enterprise system design and fine-tune {target_gap_skill}.",
            "target_skills": [target_gap_skill],
            "priority": "Important",
            "status": "in-progress",
            "progress": 0,
            "tasks": [
                f"Explore high-scale architectural patterns specific to {career}",
                f"Close remaining nuances in {target_gap_skill}",
                "Design enterprise schema and service boundaries for a flagship project",
            ],
            "projects": [],
            "certifications": [],
            "resources": [{"title": c, "type": "course"} for c in kb.get("courses", [])[:2]],
        },
        {
            "id": "ms-2",
            "week": "Milestone 2",
            "title": f"Flagship Production Capstone: {projects[0]}",
            "description": "Engineer a production-ready application demonstrating advanced engineering standards.",
            "target_skills": [career, "System Design"],
            "priority": "Important",
            "status": "not_started",
            "progress": 0,
            "tasks": [
                f"Build core features for {projects[0]} with clean modular code",
                "Implement automated CI/CD workflows, unit testing, and query profiling",
                "Deploy with containerization and cloud monitoring",
            ],
            "projects": [{"title": projects[0], "category": career}],
            "certifications": [],
            "resources": [],
        },
        {
            "id": "ms-3",
            "week": "Milestone 3",
            "title": f"Professional Credentialing: {certs[0] if certs else 'Cloud Credential'}",
            "description": f"Validate your senior capabilities with recognized credentialing in {career}.",
            "target_skills": [career],
            "priority": "Developing",
            "status": "not_started",
            "progress": 0,
            "tasks": [
                f"Master syllabus for {certs[0] if certs else 'Professional Certification'}",
                "Complete official hands-on practice labs and assessments",
            ],
            "projects": [],
            "certifications": [{"title": certs[0] if certs else 'Professional Certification', "status": "recommended"}],
            "resources": [],
        },
        {
            "id": "ms-4",
            "week": "Milestone 4",
            "title": "Senior Technical Interview Mastery",
            "description": f"Prepare for senior technical interviews and system architecture rounds for {career}.",
            "target_skills": topics[:3],
            "priority": "Developing",
            "status": "not_started",
            "progress": 0,
            "tasks": [
                f"Deep dive into system scenarios: {', '.join(topics[:3])}",
                "Conduct full mock architectural interview with industry rubric",
                "Finalize portfolio presentation and target top-tier opportunities",
            ],
            "projects": [],
            "certifications": [],
            "resources": [],
        },
    ]
