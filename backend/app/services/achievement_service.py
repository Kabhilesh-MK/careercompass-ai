"""Achievements service — grant, list, and evaluate badges."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from loguru import logger

from app.database.connection import get_db
from app.utils.helpers import oid_to_str

# ---------------------------------------------------------------------------
# Badge catalogue
# ---------------------------------------------------------------------------

BADGE_CATALOGUE: list[dict[str, Any]] = [
    # Skills
    {"key": "python_beginner",   "title": "Python Beginner",      "description": "Python skill ≥ 40",         "icon": "Code",       "color": "primary",   "category": "skills",   "points": 10},
    {"key": "python_expert",     "title": "Python Expert",         "description": "Python skill ≥ 80",         "icon": "Code2",      "color": "secondary", "category": "skills",   "points": 50},
    {"key": "sql_expert",        "title": "SQL Expert",            "description": "SQL skill ≥ 80",            "icon": "Database",   "color": "success",   "category": "skills",   "points": 50},
    {"key": "ml_ready",          "title": "ML Ready",              "description": "ML skill ≥ 70",             "icon": "Brain",      "color": "warning",   "category": "skills",   "points": 40},
    {"key": "cloud_certified",   "title": "Cloud Ready",           "description": "AWS or Azure ≥ 60",         "icon": "Cloud",      "color": "primary",   "category": "skills",   "points": 40},
    {"key": "full_stack",        "title": "Full Stack Ready",      "description": "Frontend + Backend ≥ 60",   "icon": "Layers",     "color": "secondary", "category": "skills",   "points": 60},
    # Career
    {"key": "career_predicted",  "title": "Career Predicted",      "description": "Run ML career prediction",  "icon": "Target",     "color": "primary",   "category": "career",   "points": 20},
    {"key": "top_match",         "title": "Top Career Match",      "description": "Career confidence ≥ 80%",   "icon": "Trophy",     "color": "warning",   "category": "career",   "points": 70},
    # Learning
    {"key": "first_course",      "title": "First Course",          "description": "Complete first course",     "icon": "BookOpen",   "color": "success",   "category": "learning", "points": 15},
    {"key": "five_courses",      "title": "Course Champion",       "description": "Complete 5 courses",        "icon": "GraduationCap","color":"primary",  "category": "learning", "points": 60},
    {"key": "first_project_started","title": "Project Kickoff",    "description": "Start your first project",   "icon": "Hammer",     "color": "primary",   "category": "learning", "points": 10},
    {"key": "first_project",     "title": "Builder",               "description": "Complete first project",    "icon": "Hammer",     "color": "warning",   "category": "learning", "points": 15},
    {"key": "three_projects",    "title": "Triple Threat",         "description": "Complete 3 projects",       "icon": "Award",      "color": "warning",   "category": "learning", "points": 35},
    {"key": "five_projects",     "title": "Project Master",        "description": "Complete 5 projects",       "icon": "Star",       "color": "secondary", "category": "learning", "points": 60},
    {"key": "first_cert",        "title": "Certified",             "description": "Earn first certification",  "icon": "Award",      "color": "success",   "category": "learning", "points": 25},
    {"key": "roadmap_started",   "title": "Roadmap Explorer",      "description": "Start your career roadmap", "icon": "Target",     "color": "primary",   "category": "learning", "points": 10},
    {"key": "first_milestone",   "title": "Milestone Achiever",    "description": "Complete first milestone",  "icon": "Map",        "color": "success",   "category": "learning", "points": 20},
    {"key": "roadmap_complete",  "title": "Roadmap Completed",     "description": "Finish adaptive roadmap",   "icon": "Map",        "color": "primary",   "category": "learning", "points": 100},
    # Profile
    {"key": "resume_uploaded",   "title": "Resume Uploaded",       "description": "Upload your resume",        "icon": "FileText",   "color": "success",   "category": "profile",  "points": 10},
    {"key": "profile_complete",  "title": "Profile Complete",      "description": "Fill out full profile",     "icon": "UserCheck",  "color": "primary",   "category": "profile",  "points": 20},
    {"key": "placement_ready",   "title": "Placement Ready",       "description": "Placement score ≥ 75",      "icon": "Briefcase",  "color": "success",   "category": "career",   "points": 100},
    {"key": "streak_7",          "title": "Week Streak",           "description": "7-day activity streak",     "icon": "Zap",        "color": "warning",   "category": "learning", "points": 30},
]

BADGE_MAP: dict[str, dict[str, Any]] = {b["key"]: b for b in BADGE_CATALOGUE}


async def get_user_achievements(user_id: str) -> list[dict]:
    """Return all badges (earned + unearned) for user."""
    db = get_db()
    earned_docs = await db.achievements.find({"user_id": user_id}).to_list(length=200)
    earned_keys = {d["key"] for d in earned_docs}

    result = []
    for badge in BADGE_CATALOGUE:
        item = dict(badge)
        if badge["key"] in earned_keys:
            earned_doc = next(d for d in earned_docs if d["key"] == badge["key"])
            item["earned"] = True
            item["earned_at"] = earned_doc.get("earned_at")
            item["_id"] = str(earned_doc["_id"])
        else:
            item["earned"] = False
            item["earned_at"] = None
        item["user_id"] = user_id
        result.append(item)
    return result


async def grant_achievement(user_id: str, key: str) -> dict | None:
    """Grant a badge to a user if not already earned. Returns the badge or None."""
    if key not in BADGE_MAP:
        return None
    db = get_db()
    existing = await db.achievements.find_one({"user_id": user_id, "key": key})
    if existing:
        return None  # already earned
    badge = dict(BADGE_MAP[key])
    badge["user_id"] = user_id
    badge["earned"] = True
    badge["earned_at"] = datetime.now(timezone.utc)
    result = await db.achievements.insert_one(badge)
    badge["_id"] = str(result.inserted_id)
    logger.info(f"Achievement granted: user={user_id} badge={key}")
    return badge


async def evaluate_and_grant(user_id: str, context: dict) -> list[dict]:
    """Auto-evaluate which badges a user qualifies for and grant new ones.

    ``context`` keys (all optional):
        skills: dict[str, float]
        placement_score: float
        career_confidence: float
        resume_uploaded: bool
        profile_complete: bool
        courses_completed: int
        projects_completed: int
        certs_completed: int
        roadmap_pct: int
        streak_days: int
    """
    newly_earned = []
    skills = context.get("skills", {})

    checks: list[tuple[str, bool]] = [
        ("python_beginner",  float(skills.get("Python", 0)) >= 40),
        ("python_expert",    float(skills.get("Python", 0)) >= 80),
        ("sql_expert",       float(skills.get("SQL", 0)) >= 80),
        ("ml_ready",         float(skills.get("Machine Learning", 0)) >= 70),
        ("cloud_certified",  max(float(skills.get("AWS", 0)), float(skills.get("Azure", 0))) >= 60),
        ("full_stack",       min(float(skills.get("React", 0)), float(skills.get("NodeJS", 0))) >= 60),
        ("career_predicted", True),                                        # always grant on prediction
        ("top_match",        float(context.get("career_confidence", 0)) >= 80),
        ("placement_ready",  float(context.get("placement_score", 0)) >= 75),
        ("resume_uploaded",  bool(context.get("resume_uploaded", False))),
        ("profile_complete", bool(context.get("profile_complete", False))),
        ("first_course",     int(context.get("courses_completed", 0)) >= 1),
        ("five_courses",     int(context.get("courses_completed", 0)) >= 5),
        ("first_project_started", int(context.get("projects_started", 0)) >= 1 or int(context.get("projects_completed", 0)) >= 1),
        ("first_project",    int(context.get("projects_completed", 0)) >= 1),
        ("three_projects",   int(context.get("projects_completed", 0)) >= 3),
        ("five_projects",    int(context.get("projects_completed", 0)) >= 5),
        ("first_cert",       int(context.get("certs_completed", 0)) >= 1),
        ("roadmap_started",  int(context.get("roadmap_pct", 0)) > 0 or bool(context.get("roadmap_started", False))),
        ("first_milestone",  int(context.get("milestones_completed", 0)) >= 1 or int(context.get("roadmap_pct", 0)) >= 10),
        ("roadmap_complete", int(context.get("roadmap_pct", 0)) >= 100),
        ("streak_7",         int(context.get("streak_days", 0)) >= 7),
    ]
    for key, qualifies in checks:
        if qualifies:
            badge = await grant_achievement(user_id, key)
            if badge:
                newly_earned.append(badge)
    return newly_earned
