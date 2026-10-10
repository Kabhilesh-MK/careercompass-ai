"""Settings service — theme, notifications, privacy per user."""

from typing import Optional

from bson import ObjectId

from app.database.connection import get_db
from app.schemas.misc import SettingsUpdate, SettingsResponse, NotificationSettings, PrivacySettings
from app.utils.helpers import oid_to_str


DEFAULT = SettingsResponse()


async def get_settings(user_id: str) -> dict:
    db = get_db()
    doc = await db.settings.find_one({"user_id": user_id})
    if not doc:
        user_doc = await db.users.find_one(
            {"_id": ObjectId(user_id)},
            {"settings": 1},
        )
        doc = (user_doc or {}).get("settings")
    s = doc or {}
    return {
        "theme": s.get("theme", DEFAULT.theme),
        "accent_color": s.get("accent_color", DEFAULT.accent_color),
        "notifications": s.get("notifications", DEFAULT.notifications.model_dump()),
        "privacy": s.get("privacy", DEFAULT.privacy.model_dump()),
    }


async def update_settings(user_id: str, data: SettingsUpdate) -> dict:
    db = get_db()
    current = await get_settings(user_id)
    if data.theme is not None:
        current["theme"] = data.theme
    if data.accent_color is not None:
        current["accent_color"] = data.accent_color
    if data.notifications is not None:
        current["notifications"] = data.notifications.model_dump()
    if data.privacy is not None:
        current["privacy"] = data.privacy.model_dump()

    current_to_save = dict(current)
    current_to_save["user_id"] = user_id
    await db.settings.update_one(
        {"user_id": user_id},
        {"$set": current_to_save},
        upsert=True,
    )
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"settings": current}},
    )
    return current
