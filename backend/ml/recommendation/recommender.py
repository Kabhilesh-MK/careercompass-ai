"""Recommendation engine.

Given a predicted career and missing skills, returns:
  • Courses
  • Certifications
  • Projects
  • Books
  • Practice websites
  • Interview question topics

Recommendations are filtered and ranked by relevance to the missing skills.
"""

from __future__ import annotations

from typing import Any

from ml.dataset.career_knowledge_base import KNOWLEDGE_BASE


def recommend(
    predicted_career: str,
    missing_skills: list[str],
    current_skill_levels: dict[str, float] | None = None,
) -> dict[str, list[Any]]:
    """Build recommendations for ``predicted_career`` weighted by ``missing_skills``.

    Parameters
    ----------
    predicted_career:
        A career label matching a KNOWLEDGE_BASE key.
    missing_skills:
        List of skill names the student needs to improve.
    current_skill_levels:
        Optional dict skill_name → 0-100 level for additional filtering.

    Returns
    -------
    Dict with keys: courses, certifications, projects, books,
                    practice_sites, interview_topics
    """
    if predicted_career not in KNOWLEDGE_BASE:
        predicted_career = _closest_career(predicted_career)

    kb = KNOWLEDGE_BASE[predicted_career]

    courses = kb.get("courses", [])
    certifications = kb.get("certifications", [])
    projects = kb.get("projects", [])
    books = kb.get("books", [])
    practice_sites = kb.get("practice_sites", [])
    interview_topics = kb.get("interview_topics", [])

    # Skill-gap enrichment: add generic items for missing skills not already covered
    skill_courses = _skill_courses_for(missing_skills)
    for item in skill_courses:
        if item not in courses:
            courses.append(item)

    # Prioritise courses / projects mentioning missing skills
    if missing_skills:
        courses = _prioritise(courses, missing_skills)
        projects = _prioritise(projects, missing_skills)

    return {
        "courses": courses[:6],
        "certifications": certifications[:4],
        "projects": projects[:4],
        "books": books[:4],
        "practice_sites": practice_sites[:5],
        "interview_topics": interview_topics[:6],
    }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_SKILL_COURSE_MAP: dict[str, list[str]] = {
    "Python": ["Python Bootcamp (Udemy — Angela Yu)", "Automate the Boring Stuff with Python (Free)"],
    "Java": ["Java Masterclass (Udemy — Tim Buchalka)"],
    "C++": ["C++ For Programmers (Udacity)"],
    "SQL": ["SQL Fundamentals (Mode Analytics)", "MySQL for Beginners (Udemy)"],
    "HTML": ["Responsive Web Design (freeCodeCamp)"],
    "CSS": ["CSS — The Complete Guide (Udemy)"],
    "JavaScript": ["JavaScript30 (Wes Bos — Free)", "The Complete JavaScript Course (Udemy)"],
    "React": ["React — The Complete Guide (Udemy)"],
    "NodeJS": ["Node.js Developer Course (Udemy — Andrew Mead)"],
    "MongoDB": ["MongoDB University (Free)"],
    "MySQL": ["MySQL Bootcamp (Udemy)"],
    "Git": ["Git & GitHub Crash Course (YouTube)"],
    "GitHub": ["GitHub Actions CI/CD (GitHub Learning)"],
    "AWS": ["AWS Cloud Practitioner Essentials (AWS Skill Builder)"],
    "Azure": ["Azure Fundamentals AZ-900 (Microsoft Learn)"],
    "Docker": ["Docker & Kubernetes: The Practical Guide (Udemy)"],
    "Linux": ["Linux Command Line Basics (Coursera)"],
    "Machine Learning": ["Machine Learning Specialization (Coursera — Andrew Ng)"],
    "Deep Learning": ["Deep Learning Specialization (deeplearning.ai)"],
    "Power BI": ["Power BI Desktop for Business Intelligence (Udemy)"],
    "Excel": ["Excel Skills for Business (Coursera — Macquarie)"],
    "Statistics": ["Statistics with Python (Coursera — UMich)"],
    "Communication": ["Business English Communication Skills (Coursera)"],
    "Problem Solving": ["Algorithms and Data Structures (LeetCode Study Plan)"],
    "Leadership": ["Leadership and Emotional Intelligence (Coursera)"],
    "Teamwork": ["Agile Development (edX)"],
    "Aptitude": ["Quantitative Aptitude (IndiaBIX)"],
}


def _skill_courses_for(skills: list[str]) -> list[str]:
    courses: list[str] = []
    for skill in skills:
        courses.extend(_SKILL_COURSE_MAP.get(skill, []))
    return courses


def _prioritise(items: list[str], keywords: list[str]) -> list[str]:
    kw_lower = [k.lower() for k in keywords]
    high: list[str] = []
    low: list[str] = []
    for item in items:
        if any(kw in item.lower() for kw in kw_lower):
            high.append(item)
        else:
            low.append(item)
    return high + low


def _closest_career(name: str) -> str:
    name_lower = name.lower()
    for key in KNOWLEDGE_BASE:
        if name_lower in key.lower() or key.lower() in name_lower:
            return key
    return "Software Engineer"
