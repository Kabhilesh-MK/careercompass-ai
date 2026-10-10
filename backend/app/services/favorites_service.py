"""Favorites service."""

from __future__ import annotations

from datetime import datetime, timezone

from bson import ObjectId
from loguru import logger

from app.database.connection import get_db
from app.utils.helpers import oid_to_str


async def get_favorites(user_id: str, item_type: str | None = None) -> list[dict]:
    db = get_db()
    query: dict = {"user_id": user_id}
    if item_type:
        query["item_type"] = item_type
    cursor = db.favorites.find(query).sort("created_at", -1)
    docs = await cursor.to_list(length=200)
    return [oid_to_str(d) for d in docs]


async def add_favorite(user_id: str, item_type: str, item_id: str, item_title: str, item_meta: dict) -> dict:
    db = get_db()
    # Idempotent — return existing if already saved
    existing = await db.favorites.find_one({"user_id": user_id, "item_type": item_type, "item_id": item_id})
    if existing:
        return oid_to_str(existing)
    doc = {
        "user_id": user_id,
        "item_type": item_type,
        "item_id": item_id,
        "item_title": item_title,
        "item_meta": item_meta,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.favorites.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc


async def remove_favorite(user_id: str, item_type: str, item_id: str) -> bool:
    db = get_db()
    result = await db.favorites.delete_one({"user_id": user_id, "item_type": item_type, "item_id": item_id})
    return result.deleted_count > 0


async def is_favorite(user_id: str, item_type: str, item_id: str) -> bool:
    db = get_db()
    doc = await db.favorites.find_one({"user_id": user_id, "item_type": item_type, "item_id": item_id})
    return doc is not None
