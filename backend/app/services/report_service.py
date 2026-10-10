"""Reports service — assembles a JSON report from user data."""

from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId

from app.database.connection import get_db
from app.utils.helpers import oid_to_str


async def generate_report(user_id: str) -> dict:
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})

    # Aggregate skill progress (last 6 months mock from skills)
    skill_progress = []
    for cat in (user or {}).get("skills", []):
        avg = sum(s["level"] for s in cat.get("skills", [])) / max(len(cat.get("skills", [])), 1)
        skill_progress.append({"name": cat["name"], "level": round(avg)})

    learning_hours = [
        {"month": "Jan", "hours": 24}, {"month": "Feb", "hours": 32},
        {"month": "Mar", "hours": 28}, {"month": "Apr", "hours": 40},
        {"month": "May", "hours": 36}, {"month": "Jun", "hours": 48},
    ]
    assessment_scores = [
        {"subject": "Aptitude", "score": 82},
        {"subject": "Technical", "score": 76},
        {"subject": "Communication", "score": 88},
        {"subject": "System Design", "score": 61},
        {"subject": "DSA", "score": 72},
    ]
    milestones = [
        {"label": "Courses", "value": 8},
        {"label": "Projects", "value": 6},
        {"label": "Certs", "value": 3},
        {"label": "Skills", "value": 42},
    ]
    insights = [
        "Your programming and web skills grew fastest this quarter.",
        "AI/ML is your fastest-growing category — keep the momentum.",
        "Cloud remains your weakest area. Dedicating 4 hours/week would close the gap.",
        "You are on track to exceed your placement readiness target.",
    ]

    return {
        "user_id": user_id,
        "generated_at": datetime.now(timezone.utc),
        "skill_progress": skill_progress,
        "learning_hours": learning_hours,
        "assessment_scores": assessment_scores,
        "milestones": milestones,
        "insights": insights,
    }
