"""Placement readiness score engine.

Calculates an overall placement readiness score (0-100) from:
  • Programming skills average
  • Soft skills average
  • Projects completed
  • CGPA
  • Internships
  • Certifications
  • Communication skill level

Returns overall_score, component scores, strengths, weaknesses, suggestions.
"""

from __future__ import annotations

from typing import Any

from ml.dataset.generate_dataset import TECHNICAL_SKILLS, SOFT_SKILLS


# Weights (must sum to 1.0)
WEIGHTS: dict[str, float] = {
    "programming": 0.30,
    "soft_skills": 0.20,
    "projects": 0.15,
    "cgpa": 0.15,
    "internship": 0.10,
    "certifications": 0.05,
    "communication": 0.05,
}

# Normalisation ranges
MAX_PROJECTS: int = 10
MAX_INTERNSHIPS: int = 3
MAX_CERTIFICATIONS: int = 6
MAX_CGPA: float = 10.0


from ml.dataset.career_knowledge_base import KNOWLEDGE_BASE


def calculate(profile: dict[str, Any], target_career: str | None = None) -> dict[str, Any]:
    """Return placement readiness report for a student profile.

    Parameters
    ----------
    profile:
        Dict with skill names → scores (0-100) plus CGPA, Projects Completed,
        Internship, Certifications keys.
    target_career:
        Optional target or predicted career label. If provided, technical scoring
        is tailored to the specific required technical skills of that career track.
    """
    # --- Career-specific technical skills (or fallback to general core) ---
    if target_career and target_career in KNOWLEDGE_BASE:
        kb_req = KNOWLEDGE_BASE[target_career].get("required_skills", [])
        career_technical = [s for s in kb_req if s in TECHNICAL_SKILLS]
        if not career_technical:
            career_technical = [
                "Python", "Java", "C++", "SQL", "JavaScript",
                "NodeJS", "React", "Docker", "Linux", "Git",
            ]
    else:
        career_technical = [
            "Python", "Java", "C++", "SQL", "JavaScript",
            "NodeJS", "React", "Docker", "Linux", "Git",
        ]

    prog_skills = [float(profile.get(s, 0)) for s in career_technical]
    programming_score = round(sum(prog_skills) / max(len(prog_skills), 1), 1)

    soft_raw = [float(profile.get(s, 0)) for s in SOFT_SKILLS]
    soft_score = round(sum(soft_raw) / len(soft_raw), 1)

    projects_score = min(
        round(int(profile.get("Projects Completed", 0)) / MAX_PROJECTS * 100, 1), 100
    )
    cgpa_score = min(
        round(float(profile.get("CGPA", 0)) / MAX_CGPA * 100, 1), 100
    )
    internship_score = min(
        round(int(profile.get("Internship", 0)) / MAX_INTERNSHIPS * 100, 1), 100
    )
    cert_score = min(
        round(int(profile.get("Certifications", 0)) / MAX_CERTIFICATIONS * 100, 1), 100
    )
    comm_score = round(float(profile.get("Communication", 0)), 1)

    # --- Weighted overall -------------------------------------------------
    overall = (
        programming_score * WEIGHTS["programming"]
        + soft_score * WEIGHTS["soft_skills"]
        + projects_score * WEIGHTS["projects"]
        + cgpa_score * WEIGHTS["cgpa"]
        + internship_score * WEIGHTS["internship"]
        + cert_score * WEIGHTS["certifications"]
        + comm_score * WEIGHTS["communication"]
    )
    overall = round(min(overall, 100), 1)

    # --- Component dict ---------------------------------------------------
    components = {
        "programming": programming_score,
        "soft_skills": soft_score,
        "projects": projects_score,
        "cgpa": cgpa_score,
        "internship": internship_score,
        "certifications": cert_score,
        "communication": comm_score,
    }

    # --- Strengths / weaknesses -------------------------------------------
    sorted_comp = sorted(components.items(), key=lambda x: x[1], reverse=True)
    strengths = [k.replace("_", " ").title() for k, v in sorted_comp if v >= 70][:3]
    weaknesses = [k.replace("_", " ").title() for k, v in sorted_comp if v < 50][:3]

    suggestions = _generate_suggestions(components)

    return {
        "overall_score": overall,
        "components": components,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "suggestions": suggestions,
        "readiness_level": _readiness_level(overall),
    }


def _readiness_level(score: float) -> str:
    if score >= 80:
        return "Highly Ready"
    if score >= 65:
        return "Ready"
    if score >= 50:
        return "Moderately Ready"
    return "Needs Improvement"


def _generate_suggestions(components: dict[str, float]) -> list[str]:
    suggestions: list[str] = []
    if components["programming"] < 60:
        suggestions.append(
            "Strengthen core programming: focus on Python, Java, and DSA."
        )
    if components["projects"] < 50:
        suggestions.append(
            "Build at least 3-5 personal projects to demonstrate hands-on skills."
        )
    if components["cgpa"] < 60:
        suggestions.append(
            "Improve your academic performance — aim for a CGPA above 7.5."
        )
    if components["internship"] < 30:
        suggestions.append(
            "Pursue an internship or co-op to gain industry exposure."
        )
    if components["certifications"] < 30:
        suggestions.append(
            "Earn 2-3 industry certifications (AWS, Google, Microsoft, etc.)."
        )
    if components["communication"] < 60:
        suggestions.append(
            "Join a communication workshop or debate club to sharpen verbal skills."
        )
    if components["soft_skills"] < 60:
        suggestions.append(
            "Develop teamwork and leadership by contributing to open-source projects."
        )
    if not suggestions:
        suggestions.append(
            "You are well-prepared! Focus on mock interviews and system design."
        )
    return suggestions
