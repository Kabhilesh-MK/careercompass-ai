"""Initialize MongoDB indexes for all collections on application startup."""

from __future__ import annotations

from loguru import logger

from app.database.connection import get_db


async def ensure_indexes() -> None:
    """Create all required indexes. Safe to call on every startup (no-ops if already exist)."""
    db = get_db()
    try:
        # ---- Users ----
        await db.users.create_index("email", unique=True)
        await db.users.create_index("role")
        await db.users.create_index("created_at")

        # ---- Admins ----
        await db.admins.create_index("email", unique=True)

        # ---- Skills / Learning ----
        await db.skills.create_index("user_id")
        await db.roadmaps.create_index("user_id")
        await db.placement_scores.create_index("user_id")
        await db.resumes.create_index("user_id")
        await db.resume_analyses.create_index("resume_id", unique=True)
        await db.resume_analyses.create_index("user_id")

        # ---- Chat / Predictions ----
        await db.chat_history.create_index("user_id")
        await db.predictions.create_index("user_id")
        await db.predictions.create_index("created_at")

        # ---- Content ----
        await db.projects.create_index([("category", 1), ("difficulty", 1)])
        await db.certifications.create_index("provider")

        # ---- Phase 4 collections ----
        await db.achievements.create_index([("user_id", 1), ("key", 1)], unique=True)
        await db.notifications.create_index("user_id")
        await db.notifications.create_index([("user_id", 1), ("read", 1)])
        await db.notifications.create_index("created_at")
        await db.favorites.create_index([("user_id", 1), ("item_type", 1), ("item_id", 1)], unique=True)
        await db.learning_progress.create_index("user_id", unique=True)
        await db.reports.create_index("user_id")
        await db.reports.create_index("created_at")

        # ---- Settings ----
        await db.settings.create_index("user_id", unique=True)

        logger.info("MongoDB indexes verified / created.")
    except Exception as exc:  # noqa: BLE001
        logger.error(f"Index creation warning: {exc}")
