"""Skill gap analysis engine.

Compares a student's current skill levels against the requirements for
a target career from the knowledge base.
"""

from __future__ import annotations

from typing import Any

from ml.dataset.career_knowledge_base import KNOWLEDGE_BASE


# Domain-tiered skill thresholds and importance weights
TIER_CONFIG: dict[str, dict[str, Any]] = {
    "CORE":       {"target": 75.0, "weight": 1.5, "min_priority": "Critical"},
    "IMPORTANT":  {"target": 60.0, "weight": 1.2, "min_priority": "High"},
    "SUPPORTING": {"target": 50.0, "weight": 1.0, "min_priority": "Medium"},
    "OPTIONAL":   {"target": 35.0, "weight": 0.7, "min_priority": "Low"},
}

# Explicit domain taxonomy for all 14 canonical career tracks
CAREER_SKILL_TIERS: dict[str, dict[str, list[str]]] = {
    "Data Analyst": {
        "CORE": ["SQL", "Excel", "Power BI", "Statistics"],
        "IMPORTANT": ["Python", "MySQL"],
        "SUPPORTING": ["Problem Solving", "Communication"],
        "OPTIONAL": ["Git"],
    },
    "Data Scientist": {
        "CORE": ["Python", "Machine Learning", "Statistics"],
        "IMPORTANT": ["SQL", "Deep Learning", "Problem Solving"],
        "SUPPORTING": ["Power BI", "Communication"],
        "OPTIONAL": ["Git", "Docker"],
    },
    "ML Engineer": {
        "CORE": ["Python", "Machine Learning", "Deep Learning"],
        "IMPORTANT": ["Docker", "Linux", "SQL", "Problem Solving"],
        "SUPPORTING": ["AWS", "Git", "GitHub"],
        "OPTIONAL": ["Communication"],
    },
    "Frontend Developer": {
        "CORE": ["HTML", "CSS", "JavaScript", "React"],
        "IMPORTANT": ["Problem Solving", "Git", "GitHub"],
        "SUPPORTING": ["Communication"],
        "OPTIONAL": ["NodeJS", "Docker"],
    },
    "Backend Developer": {
        "CORE": ["Python", "Java", "SQL", "NodeJS"],
        "IMPORTANT": ["MySQL", "MongoDB", "Docker", "Problem Solving"],
        "SUPPORTING": ["Linux", "Git"],
        "OPTIONAL": ["AWS", "Communication"],
    },
    "Full Stack Developer": {
        "CORE": ["JavaScript", "React", "NodeJS", "SQL"],
        "IMPORTANT": ["HTML", "CSS", "MongoDB", "Python", "Problem Solving"],
        "SUPPORTING": ["Git", "Docker", "MySQL"],
        "OPTIONAL": ["AWS", "Communication"],
    },
    "Cybersecurity Analyst": {
        "CORE": ["Linux", "Problem Solving", "Aptitude"],
        "IMPORTANT": ["Python", "Communication"],
        "SUPPORTING": ["Git", "Docker"],
        "OPTIONAL": ["SQL"],
    },
    "Cloud Engineer": {
        "CORE": ["AWS", "Azure", "Linux"],
        "IMPORTANT": ["Docker", "Python", "Problem Solving"],
        "SUPPORTING": ["Git", "SQL"],
        "OPTIONAL": ["Communication"],
    },
    "DevOps Engineer": {
        "CORE": ["Docker", "Linux", "Git"],
        "IMPORTANT": ["AWS", "Python", "Problem Solving"],
        "SUPPORTING": ["GitHub", "MySQL"],
        "OPTIONAL": ["Communication"],
    },
    "QA Engineer": {
        "CORE": ["Problem Solving", "Python", "SQL"],
        "IMPORTANT": ["Git", "MySQL", "Communication"],
        "SUPPORTING": ["Teamwork", "Aptitude"],
        "OPTIONAL": ["Docker"],
    },
    "Software Engineer": {
        "CORE": ["Problem Solving", "Python", "Java", "C++", "SQL"],
        "IMPORTANT": ["Git", "Linux", "Docker", "Aptitude"],
        "SUPPORTING": ["GitHub", "Communication", "Teamwork"],
        "OPTIONAL": ["AWS"],
    },
    "Business Analyst": {
        "CORE": ["Excel", "SQL", "Power BI", "Communication"],
        "IMPORTANT": ["Statistics", "Problem Solving", "Leadership"],
        "SUPPORTING": ["Python", "Teamwork"],
        "OPTIONAL": ["Git"],
    },
    "Mobile App Developer": {
        "CORE": ["JavaScript", "React", "Java"],
        "IMPORTANT": ["Problem Solving", "Git", "GitHub"],
        "SUPPORTING": ["Communication", "NodeJS"],
        "OPTIONAL": ["SQL"],
    },
    "AI Engineer": {
        "CORE": ["Python", "Machine Learning", "Deep Learning", "Statistics"],
        "IMPORTANT": ["AWS", "Problem Solving", "SQL"],
        "SUPPORTING": ["Docker", "Git", "Linux"],
        "OPTIONAL": ["Communication"],
    },
}


def analyse(
    profile: dict[str, Any],
    target_career: str,
) -> dict[str, Any]:
    """Return a domain-tiered skill-gap report for ``target_career``."""
    if target_career not in KNOWLEDGE_BASE:
        target_career = _closest_career(target_career)

    tiers = CAREER_SKILL_TIERS.get(target_career)
    if not tiers:
        # Fallback: categorize from KNOWLEDGE_BASE required_skills
        kb_req = KNOWLEDGE_BASE[target_career].get("required_skills", [])
        tiers = {
            "CORE": kb_req[:3],
            "IMPORTANT": kb_req[3:6],
            "SUPPORTING": kb_req[6:8],
            "OPTIONAL": kb_req[8:],
        }

    current_skills: list[dict[str, Any]] = []
    missing_skills: list[dict[str, Any]] = []
    total_weighted_req = 0.0
    total_weighted_met = 0.0

    for tier_name, skills in tiers.items():
        cfg = TIER_CONFIG[tier_name]
        target_val = cfg["target"]
        weight = cfg["weight"]

        for skill in skills:
            level = float(profile.get(skill, 0.0))
            is_met = level >= target_val
            gap = max(0.0, target_val - level)

            total_weighted_req += target_val * weight
            total_weighted_met += min(level, target_val) * weight

            status = "met" if is_met else ("partial" if level >= target_val * 0.5 else "missing")
            current_skills.append({
                "name": skill,
                "level": round(level, 1),
                "required": target_val,
                "gap": round(gap, 1),
                "tier": tier_name,
                "status": status,
            })

            if gap > 0:
                priority_score = round(weight * gap, 1)
                priority = _calculate_priority(priority_score, tier_name, gap, level)
                reason = _generate_gap_reason(skill, tier_name, target_career)
                missing_skills.append({
                    "name": skill,
                    "current": round(level, 1),
                    "required": target_val,
                    "gap": round(gap, 1),
                    "tier": tier_name,
                    "priority": priority,
                    "priority_score": priority_score,
                    "reason": reason,
                })

    # Match percentage = weighted met points / total weighted required points
    match_pct = round((total_weighted_met / max(total_weighted_req, 1.0)) * 100, 1)

    # Sort missing skills: Critical > Important > Developing (by priority_score descending)
    missing_skills.sort(key=lambda s: s.get("priority_score", 0.0), reverse=True)

    # Strengths: top skills from user profile
    all_skills = [
        {"name": k, "level": round(float(v), 1)}
        for k, v in profile.items()
        if isinstance(v, (int, float)) and k not in ("CGPA", "Projects Completed", "Internship", "Certifications")
    ]
    all_skills.sort(key=lambda x: x["level"], reverse=True)
    strengths = [s for s in all_skills if s["level"] >= 60][:5]
    weaknesses = [s for s in all_skills if s["level"] < 50][:5]

    skills_met_count = sum(1 for s in current_skills if s["status"] == "met")
    critical_list = [s for s in missing_skills if s["priority"] == "Critical"]
    important_list = [s for s in missing_skills if s["priority"] == "Important"]
    developing_list = [s for s in missing_skills if s["priority"] == "Developing"]
    met_list = [s for s in current_skills if s["status"] == "met"]

    summary = {
        "total_skills": len(current_skills),
        "skills_met": skills_met_count,
        "critical_gaps": len(critical_list),
        "important_gaps": len(important_list),
        "developing_gaps": len(developing_list),
    }

    return {
        "target_career": target_career,
        "career": target_career,
        "match_percentage": match_pct,
        "summary": summary,
        "critical": critical_list,
        "important": important_list,
        "developing": developing_list,
        "met": met_list,
        "current_skills": current_skills,
        "missing_skills": missing_skills,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "total_required": len(current_skills),
        "skills_met": skills_met_count,
        "tier_summary": {
            t: sum(1 for s in current_skills if s["tier"] == t and s["status"] == "met")
            for t in TIER_CONFIG
        },
    }


def _calculate_priority(score: float, tier: str, gap: float, level: float) -> str:
    """Calculate deterministic priority level (Critical, Important, Developing)."""
    if tier == "CORE":
        if gap >= 25 or score >= 25 or level < 50:
            return "Critical"
        return "Important"
    elif tier == "IMPORTANT":
        if gap >= 30 or score >= 25:
            return "Important"
        return "Developing"
    else:  # SUPPORTING or OPTIONAL
        return "Developing"


def _generate_gap_reason(skill: str, tier: str, career: str) -> str:
    """Generate educational rationale for why closing this skill gap matters."""
    if tier == "CORE":
        return f"{skill} is a core foundational competency directly required for {career}."
    elif tier == "IMPORTANT":
        return f"{skill} is an important technical requirement that significantly strengthens your readiness for {career}."
    else:
        return f"{skill} is a supporting skill providing breadth and versatility in {career}."


def _closest_career(name: str) -> str:
    name_lower = name.lower()
    for key in KNOWLEDGE_BASE:
        if name_lower in key.lower() or key.lower() in name_lower:
            return key
    return "Software Engineer"

