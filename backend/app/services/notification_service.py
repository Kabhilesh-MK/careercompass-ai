"""Notifications service."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from loguru import logger

from app.database.connection import get_db
from app.utils.helpers import oid_to_str


async def get_notifications(user_id: str, unread_only: bool = False) -> list[dict]:
    db = get_db()
    query: dict = {"user_id": user_id}
    if unread_only:
        query["read"] = False
    cursor = db.notifications.find(query).sort("created_at", -1).limit(50)
    docs = await cursor.to_list(length=50)
    return [oid_to_str(d) for d in docs]


async def get_unread_count(user_id: str) -> int:
    db = get_db()
    return await db.notifications.count_documents({"user_id": user_id, "read": False})


async def create_notification(
    user_id: str,
    title: str,
    message: str,
    notif_type: str = "info",
    icon: str = "Bell",
    action_url: Optional[str] = None,
) -> dict:
    db = get_db()
    doc = {
        "user_id": user_id,
        "type": notif_type,
        "title": title,
        "message": message,
        "icon": icon,
        "read": False,
        "action_url": action_url,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.notifications.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc


async def mark_read(user_id: str, ids: list[str]) -> int:
    """Mark given notification IDs as read. If ids is empty, mark all."""
    db = get_db()
    if ids:
        query = {"user_id": user_id, "_id": {"$in": [ObjectId(i) for i in ids]}}
    else:
        query = {"user_id": user_id}
    result = await db.notifications.update_many(query, {"$set": {"read": True}})
    return result.modified_count


async def delete_notification(user_id: str, notif_id: str) -> bool:
    db = get_db()
    result = await db.notifications.delete_one(
        {"_id": ObjectId(notif_id), "user_id": user_id}
    )
    return result.deleted_count > 0


async def seed_welcome_notifications(user_id: str) -> None:
    """Create onboarding notifications for a new user."""
    items = [
        ("Welcome to CareerCompass AI!", "Complete your profile to get personalised career predictions.", "success", "Sparkles", "/profile"),
        ("Upload your Resume",           "Get an AI-powered resume score and ATS analysis.",             "info",    "FileText", "/resume"),
        ("Run Career Prediction",        "Let the ML engine predict your ideal career path.",             "info",    "Target",   "/career"),
    ]
    for title, msg, t, icon, url in items:
        await create_notification(user_id, title, msg, t, icon, url)
