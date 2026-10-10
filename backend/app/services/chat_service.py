"""Chat history service — AI mentor conversation persistence (no ML in Phase 2)."""

from datetime import datetime, timezone

from bson import ObjectId

from app.database.connection import get_db
from app.schemas.misc import ChatMessage
from app.utils.exceptions import NotFoundError
from app.utils.helpers import oid_to_str


async def get_history(user_id: str) -> dict:
    db = get_db()
    doc = await db.chat_history.find_one({"user_id": user_id})
    if not doc:
        return {"user_id": user_id, "messages": []}
    return oid_to_str(doc)


async def add_message(user_id: str, message: ChatMessage) -> dict:
    db = get_db()
    now = datetime.now(timezone.utc)
    existing = await db.chat_history.find_one({"user_id": user_id})
    if not existing:
        doc = {"user_id": user_id, "messages": [message.model_dump()], "created_at": now, "updated_at": now}
        await db.chat_history.insert_one(doc)
    else:
        await db.chat_history.update_one(
            {"user_id": user_id},
            {"$push": {"messages": message.model_dump()}, "$set": {"updated_at": now}},
        )
    return await get_history(user_id)


async def clear_history(user_id: str) -> None:
    await get_db().chat_history.delete_one({"user_id": user_id})


async def generate_mentor_reply(user_text: str, user_id: str | None = None) -> str:
    """Generate explainable, personalized career guidance based on student's actual profile."""
    if not user_id:
        return (
            "Welcome! To receive personalized career guidance, please ensure your profile "
            "and skill assessment are up to date."
        )

    db = get_db()
    pred = await db.predictions.find_one({"user_id": user_id}, sort=[("updated_at", -1)])
    roadmap = await db.roadmaps.find_one({"user_id": user_id})
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})

    if not pred:
        career = (user_doc or {}).get("preferred_domain", "Software Engineering")
        return (
            f"Hello! I see you are targeting {career}. Once you complete your skills assessment "
            f"and profile setup, I will be able to analyze your critical skill gaps and generate "
            f"tailored preparation strategies."
        )

    prediction = pred.get("prediction", {})
    skill_gap = pred.get("skill_gap", {})
    placement = pred.get("placement", {})

    career = prediction.get("predicted_career", "Software Engineer")
    confidence = round(prediction.get("confidence", 0.0), 1)
    match_pct = round(skill_gap.get("match_percentage", 0.0), 1)

    missing = skill_gap.get("missing_skills", [])
    critical_gaps = [s["name"] for s in missing if s.get("priority") == "Critical"]
    high_gaps = [s["name"] for s in missing if s.get("priority") == "High"]
    primary_gaps = critical_gaps or high_gaps or [s["name"] for s in missing[:3]]

    placement_score = round(placement.get("overall_score", 0.0), 1)
    placement_level = placement.get("readiness_level", "On Track")
    weaknesses = placement.get("weaknesses", [])

    milestones = (roadmap or {}).get("milestones", [])
    active_milestone = next((m for m in milestones if m.get("status") != "completed"), None)

    q = user_text.lower()

    # Query Intent 1: Roadmap & Timeline
    if any(k in q for k in ["roadmap", "week", "milestone", "schedule", "timeline"]):
        if active_milestone:
            tasks_str = "; ".join(active_milestone.get("tasks", [])[:2])
            return (
                f"Your active roadmap for **{career}** is currently on **{active_milestone.get('week', 'Current Week')}: "
                f"{active_milestone.get('title', 'Skill Building')}**. "
                f"Your current milestone tasks are: {tasks_str or 'focus on closing priority technical competencies'}. "
                f"Completing this milestone will directly boost your readiness toward your {match_pct}% target competency."
            )
        return (
            f"You have completed all planned milestones for your **{career}** roadmap! "
            f"Consider tackling an advanced capstone project or mock technical interviews to maintain your edge."
        )

    # Query Intent 2: Skills & Gaps
    if any(k in q for k in ["skill", "gap", "missing", "learn", "study"]):
        if primary_gaps:
            gaps_str = ", ".join(primary_gaps[:3])
            tier_info = "CORE" if critical_gaps else "IMPORTANT"
            return (
                f"For your target track as a **{career}**, your highest-priority gaps are **{gaps_str}** ({tier_info} tier). "
                f"Currently, your role competency match is at **{match_pct}%**. "
                f"I recommend focusing 1–2 hours daily on hands-on exercises in {primary_gaps[0]} before advancing to complex tooling."
            )
        return (
            f"Great news! You have closed all major technical skill gaps for **{career}** (Curriculum Match: {match_pct}%). "
            f"Focus on consolidating your portfolio with live deployed projects and sharpening system design."
        )

    # Query Intent 3: Placement, Readiness, Scores
    if any(k in q for k in ["placement", "readiness", "score", "interview", "job", "hire"]):
        weak_str = f" Pay special attention to {', '.join(weaknesses[:2])}." if weaknesses else ""
        return (
            f"Your current Placement Readiness score is **{placement_score}/100** ({placement_level}). "
            f"Your ML-predicted best-fit role is **{career}** (Model Confidence: {confidence}%). "
            f"To increase your placement readiness score into the 80+ tier, maintain consistent project commits "
            f"and close your priority skill gaps.{weak_str}"
        )

    # Query Intent 4: Projects & Certifications
    if any(k in q for k in ["project", "cert", "certification", "portfolio"]):
        recs = pred.get("recommendations", {})
        proj = (recs.get("projects", []) or ["a production-grade capstone project"])[0]
        cert = (recs.get("certifications", []) or ["an industry certification"])[0]
        return (
            f"To strengthen your portfolio for **{career}**, I recommend building: **{proj}**. "
            f"Additionally, targeting the **{cert}** certification will provide external validation of your capabilities."
        )

    # Default Contextual Response
    gap_note = f"Your top priority gap is **{primary_gaps[0]}**." if primary_gaps else "Your skills are well aligned."
    return (
        f"Based on your profile, your primary track is **{career}** with a **{match_pct}%** competency match "
        f"and **{placement_score}/100** placement readiness. {gap_note} "
        f"Would you like guidance on your roadmap, specific skill gaps, or interview preparation?"
    )
