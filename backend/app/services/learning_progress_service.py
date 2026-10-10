"""Learning progress service — track projects, certifications, courses, and roadmap."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional
from bson import ObjectId

from app.database.connection import get_db
from app.utils.helpers import oid_to_str
from app.services import achievement_service

# ---------------------------------------------------------------------------
# Learning Progress Queries
# ---------------------------------------------------------------------------

async def get_progress(user_id: str) -> dict[str, Any]:
    """Return comprehensive user learning progress with derived metrics and active skills."""
    db = get_db()
    doc = await db.learning_progress.find_one({"user_id": user_id})
    if not doc:
        doc = _empty(user_id)
    else:
        doc = oid_to_str(doc)

    projects = doc.get("projects", [])
    certs = doc.get("certifications", [])
    courses = doc.get("courses", [])
    roadmap_pct = doc.get("roadmap_completion", 0)

    # Derive counts
    proj_completed = [p for p in projects if p.get("completed")]
    proj_active = [p for p in projects if not p.get("completed") and p.get("progress_pct", 0) > 0]
    certs_completed = [c for c in certs if c.get("completed")]
    certs_active = [c for c in certs if not c.get("completed")]

    # Calculate completion rates
    doc["projects_completed_count"] = len(proj_completed)
    doc["projects_in_progress_count"] = len(proj_active)
    doc["projects_total_tracked"] = len(projects)

    doc["certs_completed_count"] = len(certs_completed)
    doc["certs_in_progress_count"] = len(certs_active)
    doc["certs_total_tracked"] = len(certs)

    doc["courses_completed_count"] = len([c for c in courses if c.get("completed")])
    doc["courses_total_tracked"] = len(courses)

    # Re-verify overall completion percentage
    doc["overall_pct"] = _calc_overall(doc)

    # Active skills being practiced
    skills_being_practiced = set()
    from app.services.project_service import PROJECT_BY_ID
    from app.services.certification_service import CERTIFICATION_BY_ID

    for p in proj_active + proj_completed:
        p_info = PROJECT_BY_ID.get(p.get("project_id"))
        if p_info:
            skills_being_practiced.update(p_info.get("skills", []))

    for c in certs_active + certs_completed:
        c_info = CERTIFICATION_BY_ID.get(c.get("cert_id"))
        if c_info:
            skills_being_practiced.update(c_info.get("skills", []))

    doc["skills_being_practiced"] = sorted(list(skills_being_practiced))

    # Compile recent activity items
    recent_activity = []
    for p in projects:
        if p.get("completed_at"):
            recent_activity.append({
                "type": "project",
                "id": p.get("project_id"),
                "title": p.get("title", "Project"),
                "action": "Completed project",
                "timestamp": p["completed_at"],
            })
        elif p.get("progress_pct", 0) > 0:
            recent_activity.append({
                "type": "project",
                "id": p.get("project_id"),
                "title": p.get("title", "Project"),
                "action": f"Updated progress to {p['progress_pct']}%",
                "timestamp": doc.get("updated_at") or doc.get("last_activity"),
            })

    for c in certs:
        if c.get("completed_at"):
            recent_activity.append({
                "type": "certification",
                "id": c.get("cert_id"),
                "title": c.get("title", "Certification"),
                "action": "Earned certification",
                "timestamp": c["completed_at"],
            })

    recent_activity.sort(key=lambda x: str(x.get("timestamp") or ""), reverse=True)
    doc["recent_activity"] = recent_activity[:10]

    return doc


# ---------------------------------------------------------------------------
# Progress Mutation Functions
# ---------------------------------------------------------------------------

async def update_item(
    user_id: str,
    item_type: str,
    item_id: str,
    completed: bool,
    progress_pct: int,
    title: str = "",
    provider: str = "",
) -> dict[str, Any]:
    """Generic update endpoint supporting course, project, or certification."""
    db = get_db()
    doc = await db.learning_progress.find_one({"user_id": user_id}) or _empty(user_id)
    now = datetime.now(timezone.utc)

    arr_key = _arr_key(item_type)
    if not arr_key:
        return oid_to_str(doc)

    items: list[dict] = doc.get(arr_key, [])
    id_field = "project_id" if arr_key == "projects" else ("cert_id" if arr_key == "certifications" else "course_id")

    existing = next(
        (i for i in items if i.get(id_field) == item_id or i.get("course_id") == item_id or i.get("project_id") == item_id or i.get("cert_id") == item_id),
        None,
    )

    status = "completed" if completed or progress_pct >= 100 else ("in-progress" if progress_pct > 0 else "not_started")
    effective_pct = 100 if completed else min(100, max(0, progress_pct))

    if existing:
        existing["completed"] = completed or (effective_pct == 100)
        existing["progress_pct"] = effective_pct
        existing["status"] = status
        if title:
            existing["title"] = title
        if provider:
            existing["provider"] = provider
        if (completed or effective_pct == 100) and not existing.get("completed_at"):
            existing["completed_at"] = now
        elif not completed and effective_pct < 100:
            existing["completed_at"] = None
    else:
        entry: dict = {
            id_field: item_id,
            "title": title or item_id,
            "completed": completed or (effective_pct == 100),
            "progress_pct": effective_pct,
            "status": status,
        }
        if provider:
            entry["provider"] = provider
        if completed or effective_pct == 100:
            entry["completed_at"] = now
        items.append(entry)

    doc[arr_key] = items
    doc["last_activity"] = now
    doc["updated_at"] = now
    doc["overall_pct"] = _calc_overall(doc)

    await db.learning_progress.update_one(
        {"user_id": user_id},
        {"$set": doc},
        upsert=True,
    )

    # Evaluate achievements automatically
    await _check_achievements(user_id, doc)

    return await get_progress(user_id)


async def update_project_progress(
    user_id: str,
    project_id: str,
    progress_pct: int,
    completed: Optional[bool] = None,
    status: Optional[str] = None,
    title: str = "",
) -> dict[str, Any]:
    """Direct helper for updating project progress."""
    from app.services.project_service import PROJECT_BY_ID

    p_info = PROJECT_BY_ID.get(project_id, {})
    resolved_title = title or p_info.get("title", project_id)

    is_completed = completed if completed is not None else (status == "completed" or progress_pct >= 100)
    if is_completed:
        progress_pct = 100

    return await update_item(
        user_id=user_id,
        item_type="project",
        item_id=project_id,
        completed=is_completed,
        progress_pct=progress_pct,
        title=resolved_title,
    )


async def update_certification_progress(
    user_id: str,
    cert_id: str,
    completed: Optional[bool] = None,
    status: Optional[str] = None,
    title: str = "",
    provider: str = "",
) -> dict[str, Any]:
    """Direct helper for updating certification progress."""
    from app.services.certification_service import CERTIFICATION_BY_ID

    c_info = CERTIFICATION_BY_ID.get(cert_id, {})
    resolved_title = title or c_info.get("title", cert_id)
    resolved_provider = provider or c_info.get("provider", "")

    if completed is not None:
        is_completed = completed
    elif status in ("completed", "earned"):
        is_completed = True
    elif status in ("in_progress", "in-progress", "not_started"):
        is_completed = False
    else:
        is_completed = True

    effective_status = "earned" if is_completed else (status or "in-progress")
    progress_pct = 100 if is_completed else 50

    return await update_item(
        user_id=user_id,
        item_type="certification",
        item_id=cert_id,
        completed=is_completed,
        progress_pct=progress_pct,
        title=resolved_title,
        provider=resolved_provider,
    )


async def update_roadmap_completion(user_id: str, pct: int) -> dict[str, Any]:
    """Update roadmap completion percentage and recalculate overall progress."""
    db = get_db()
    doc = await db.learning_progress.find_one({"user_id": user_id}) or _empty(user_id)
    now = datetime.now(timezone.utc)

    doc["roadmap_completion"] = min(100, max(0, pct))
    doc["updated_at"] = now
    doc["last_activity"] = now
    doc["overall_pct"] = _calc_overall(doc)

    await db.learning_progress.update_one({"user_id": user_id}, {"$set": doc}, upsert=True)
    await _check_achievements(user_id, doc)

    return await get_progress(user_id)


# ---------------------------------------------------------------------------
# Formula & Internal Helpers
# ---------------------------------------------------------------------------

def _calc_overall(doc: dict[str, Any]) -> int:
    """Calculate overall learning progress.

    Documented Formula:
      Overall Progress = 40% Roadmap Completion
                       + 35% Project Completion Average
                       + 25% Certification Completion Average

    If no projects or certifications are tracked yet:
      Overall Progress is based 100% on active Roadmap Completion.
    If only projects are tracked:
      Normalized across Roadmap (55%) and Projects (45%).
    """
    roadmap = float(doc.get("roadmap_completion", 0))
    projects = doc.get("projects", [])
    certs = doc.get("certifications", [])

    has_projects = len(projects) > 0
    has_certs = len(certs) > 0

    proj_avg = (
        sum(float(p.get("progress_pct", 100 if p.get("completed") else 0)) for p in projects) / len(projects)
        if has_projects else 0.0
    )
    cert_avg = (
        sum(100.0 if c.get("completed") else float(c.get("progress_pct", 50)) for c in certs) / len(certs)
        if has_certs else 0.0
    )

    if has_projects and has_certs:
        overall = 0.40 * roadmap + 0.35 * proj_avg + 0.25 * cert_avg
    elif has_projects and not has_certs:
        overall = 0.55 * roadmap + 0.45 * proj_avg
    elif has_certs and not has_projects:
        overall = 0.60 * roadmap + 0.40 * cert_avg
    else:
        overall = roadmap

    return round(min(100.0, max(0.0, overall)))


def _arr_key(item_type: str) -> str:
    cleaned = item_type.strip().lower()
    if "project" in cleaned:
        return "projects"
    if "cert" in cleaned:
        return "certifications"
    if "course" in cleaned:
        return "courses"
    return ""


def _empty(user_id: str) -> dict[str, Any]:
    return {
        "user_id": user_id,
        "courses": [],
        "projects": [],
        "certifications": [],
        "roadmap_completion": 0,
        "overall_pct": 0,
        "total_hours": 0.0,
        "streak_days": 0,
        "last_activity": None,
        "updated_at": None,
    }


async def _check_achievements(user_id: str, progress_doc: dict[str, Any]) -> None:
    """Evaluate and grant qualifying badges based on updated progress."""
    try:
        db = get_db()
        user_doc = await db.users.find_one({"_id": ObjectId(user_id)}) or {}
        pred_doc = await db.predictions.find_one({"user_id": user_id}, sort=[("updated_at", -1)])

        skills_dict: dict[str, float] = {}
        for cat in (user_doc.get("skills") or []):
            for sk in (cat.get("skills") or []):
                skills_dict[sk["name"]] = float(sk.get("level", 0.0))

        proj_completed = len([p for p in progress_doc.get("projects", []) if p.get("completed")])
        certs_completed = len([c for c in progress_doc.get("certifications", []) if c.get("completed")])
        courses_completed = len([c for c in progress_doc.get("courses", []) if c.get("completed")])

        context = {
            "skills": skills_dict,
            "projects_completed": proj_completed,
            "certs_completed": certs_completed,
            "courses_completed": courses_completed,
            "roadmap_pct": progress_doc.get("roadmap_completion", 0),
            "profile_complete": user_doc.get("profile_completed", False),
            "career_confidence": pred_doc.get("prediction", {}).get("confidence", 0.0) if pred_doc else 0.0,
        }
        await achievement_service.evaluate_and_grant(user_id, context)
    except Exception as exc:
        pass  # Non-blocking achievement evaluation
