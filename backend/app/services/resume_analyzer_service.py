"""Enhanced resume analysis service.

Parses the plain-text content of an uploaded resume and produces:
  • Extracted skills, projects, certifications, education, achievements
  • Resume score (structure + content quality)
  • ATS score (keyword density vs target career requirements)
  • Strengths, weaknesses, suggestions
  • Missing keywords for the predicted career
"""

from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any

from loguru import logger

from app.database.connection import get_db
from app.utils.helpers import oid_to_str

# All ML-known skills for keyword matching
_ALL_SKILLS = [
    "Python", "Java", "C++", "SQL", "HTML", "CSS", "JavaScript", "React",
    "NodeJS", "MongoDB", "MySQL", "Git", "GitHub", "AWS", "Azure", "Docker",
    "Linux", "Machine Learning", "Deep Learning", "Power BI", "Excel",
    "Statistics", "Communication", "Problem Solving", "Leadership",
    "Teamwork", "Aptitude", "TypeScript", "Kubernetes", "Terraform",
    "Django", "Flask", "FastAPI", "Spring", "TensorFlow", "PyTorch",
    "Pandas", "NumPy", "Scikit-learn", "Tableau", "Spark", "Kafka",
    "Redis", "PostgreSQL", "GraphQL", "REST", "CI/CD", "Agile", "Scrum",
]

_SKILL_SET = {s.lower(): s for s in _ALL_SKILLS}

# Career → required keywords (from knowledge base)
_CAREER_KEYWORDS: dict[str, list[str]] = {
    "Software Engineer":      ["Python", "Java", "Git", "SQL", "Problem Solving"],
    "Frontend Developer":     ["HTML", "CSS", "JavaScript", "React", "Git"],
    "Backend Developer":      ["Python", "NodeJS", "SQL", "MongoDB", "Docker"],
    "Full Stack Developer":   ["React", "NodeJS", "MongoDB", "SQL", "Git"],
    "Data Analyst":           ["Python", "SQL", "Excel", "Power BI", "Statistics"],
    "Data Scientist":         ["Python", "Machine Learning", "Statistics", "SQL"],
    "ML Engineer":            ["Python", "Machine Learning", "Deep Learning", "Docker"],
    "Cloud Engineer":         ["AWS", "Azure", "Docker", "Linux"],
    "DevOps Engineer":        ["Docker", "Linux", "Git", "AWS"],
    "Cybersecurity Analyst":  ["Linux", "Python", "Problem Solving"],
    "QA Engineer":            ["Python", "SQL", "Git"],
    "Business Analyst":       ["Excel", "SQL", "Power BI", "Statistics"],
    "Mobile App Developer":   ["JavaScript", "React", "Java", "Git"],
    "AI Engineer":            ["Python", "Machine Learning", "Deep Learning", "AWS"],
}


def _extract_skills(text: str) -> list[str]:
    found = []
    text_lower = text.lower()
    for kw_lower, canonical in _SKILL_SET.items():
        pattern = r'\b' + re.escape(kw_lower) + r'\b'
        if re.search(pattern, text_lower):
            found.append(canonical)
    return list(dict.fromkeys(found))  # preserve order, deduplicate


def _extract_section(text: str, headers: list[str]) -> list[str]:
    """Pull bullet-style lines from a named section."""
    results = []
    in_section = False
    for line in text.splitlines():
        stripped = line.strip()
        if any(h.lower() in stripped.lower() for h in headers):
            in_section = True
            continue
        if in_section:
            if stripped and stripped[0] in "-•*▪◦":
                results.append(stripped.lstrip("-•*▪◦ ").strip())
            elif any(h.lower() in stripped.lower() for h in [
                "education", "experience", "skills", "certifications",
                "projects", "achievements", "summary", "objective",
            ]):
                break  # hit next section
    return results[:8]


def _score_resume(text: str, skills: list[str]) -> tuple[int, int]:
    """Return (resume_score, ats_score) both 0-100."""
    score = 0
    lines = [l.strip() for l in text.splitlines() if l.strip()]

    # Structure signals
    sections = {"experience", "education", "skills", "projects", "certifications",
                "summary", "objective", "achievements", "profile"}
    found_sections = sum(1 for s in sections if s in text.lower())
    score += min(found_sections * 6, 30)

    # Length signal
    word_count = len(text.split())
    score += min(word_count // 50, 20)  # up to 1000 words = 20pts

    # Contact info
    has_email = bool(re.search(r'\b[\w.]+@[\w.]+\.\w+\b', text))
    has_phone = bool(re.search(r'\+?\d[\d\s\-()]{7,}', text))
    score += 10 if has_email else 0
    score += 5 if has_phone else 0

    # Action verbs
    action_verbs = ["developed", "built", "designed", "implemented", "optimized",
                    "led", "managed", "created", "deployed", "achieved", "improved"]
    verb_hits = sum(1 for v in action_verbs if v in text.lower())
    score += min(verb_hits * 3, 15)

    # Skills breadth
    score += min(len(skills) * 2, 20)

    resume_score = min(score, 100)

    # ATS = skill keyword density (simplified)
    ats = min(len(skills) * 5, 75) + (10 if has_email else 0) + (5 if word_count > 300 else 0)
    ats_score = min(ats, 100)

    return resume_score, ats_score


def analyse_resume_text(text: str, predicted_career: str = "") -> dict[str, Any]:
    """Pure-function analysis given raw text + optional career."""
    skills = _extract_skills(text)
    projects = _extract_section(text, ["projects", "personal projects", "academic projects"])
    certifications = _extract_section(text, ["certifications", "certificates", "courses"])
    education = _extract_section(text, ["education", "academic background", "qualifications"])
    achievements = _extract_section(text, ["achievements", "awards", "honors", "accomplishments"])

    resume_score, ats_score = _score_resume(text, skills)

    # Missing keywords for predicted career
    career_kws = _CAREER_KEYWORDS.get(predicted_career, [])
    skills_lower = [s.lower() for s in skills]
    missing_kws = [kw for kw in career_kws if kw.lower() not in skills_lower]

    strengths, weaknesses, suggestions = [], [], []

    if len(skills) >= 8:
        strengths.append(f"Strong skill coverage ({len(skills)} skills identified)")
    else:
        weaknesses.append("Limited skills section — expand with more technical keywords")
        suggestions.append("Add a dedicated Skills section listing all relevant technologies")

    if projects:
        strengths.append(f"{len(projects)} project(s) detected — demonstrates hands-on experience")
    else:
        weaknesses.append("No projects section found")
        suggestions.append("Add a Projects section with 2–3 relevant projects and technologies used")

    if certifications:
        strengths.append(f"{len(certifications)} certification(s) found")
    else:
        suggestions.append("Add relevant certifications to strengthen your resume")

    if missing_kws:
        weaknesses.append(f"Missing keywords for {predicted_career}: {', '.join(missing_kws[:4])}")
        suggestions.append(f"Incorporate these keywords naturally: {', '.join(missing_kws)}")

    if resume_score >= 70:
        strengths.append("Well-structured resume with clear sections")
    elif resume_score < 50:
        weaknesses.append("Resume structure needs improvement")
        suggestions.append("Use a standard template with Experience, Education, Skills, Projects sections")

    if ats_score < 60:
        suggestions.append("Increase keyword density — many ATS systems filter by skill match")

    suggestions.append("Use strong action verbs: Developed, Implemented, Optimized, Led")
    suggestions.append("Quantify achievements: 'Reduced load time by 40%' > 'Improved performance'")

    return {
        "extracted_skills": skills,
        "extracted_projects": projects,
        "extracted_certifications": certifications,
        "extracted_education": education,
        "extracted_achievements": achievements,
        "resume_score": resume_score,
        "ats_score": ats_score,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "suggestions": suggestions[:6],
        "missing_keywords": missing_kws,
        "predicted_career_match": predicted_career,
        "analyzed_at": datetime.now(timezone.utc).isoformat(),
    }


async def analyze_and_save(resume_id: str, user_id: str, file_path: str, predicted_career: str = "") -> dict:
    """Read file from disk, run analysis, persist to MongoDB, return result."""
    try:
        with open(file_path, "rb") as fh:
            raw = fh.read()
        # Decode bytes → plain text (strip binary noise for PDFs)
        try:
            text = raw.decode("utf-8", errors="ignore")
        except Exception:
            text = raw.decode("latin-1", errors="ignore")
        # Remove PDF binary noise: keep only printable ASCII lines
        lines = [l for l in text.splitlines() if any(c.isalpha() for c in l)]
        text = "\n".join(lines)
    except FileNotFoundError:
        logger.warning(f"Resume file not found: {file_path}")
        text = ""

    result = analyse_resume_text(text, predicted_career)
    result["resume_id"] = resume_id
    result["user_id"] = user_id

    db = get_db()
    await db.resume_analyses.update_one(
        {"resume_id": resume_id, "user_id": user_id},
        {"$set": result},
        upsert=True,
    )
    doc = await db.resume_analyses.find_one({"resume_id": resume_id, "user_id": user_id})
    return oid_to_str(doc)


async def get_analysis(resume_id: str, user_id: str | None = None) -> dict | None:
    db = get_db()
    query: dict = {"resume_id": resume_id}
    if user_id:
        query["user_id"] = user_id
    doc = await db.resume_analyses.find_one(query)
    return oid_to_str(doc) if doc else None
