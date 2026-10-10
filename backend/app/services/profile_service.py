"""Profile service — get/update profile, update skills, education, photo."""

from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId

from app.database.connection import get_db
from app.schemas.user import UserUpdate, SkillsUpdate
from app.utils.exceptions import NotFoundError
from app.utils.helpers import oid_to_str


async def get_profile(user_id: str) -> dict:
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise NotFoundError("User not found.")
    user.pop("password", None)
    user.pop("reset_token", None)
    return oid_to_str(user)


async def update_profile(user_id: str, data: UserUpdate) -> dict:
    db = get_db()
    update_data = data.model_dump(exclude_unset=True, exclude_none=True)
    if not update_data:
        return await get_profile(user_id)
    update_data["updated_at"] = datetime.now(timezone.utc)
    result = await db.users.find_one_and_update(
        {"_id": ObjectId(user_id)},
        {"$set": update_data},
        return_document=True,
    )
    if not result:
        raise NotFoundError("User not found.")
    result.pop("password", None)
    return oid_to_str(result)


async def update_skills(user_id: str, data: SkillsUpdate) -> dict:
    db = get_db()
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"skills": [c.model_dump() for c in data.skills], "updated_at": datetime.now(timezone.utc)}},
    )
    return await get_profile(user_id)


async def update_education(user_id: str, education: list[dict]) -> dict:
    db = get_db()
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"education": education, "updated_at": datetime.now(timezone.utc)}},
    )
    return await get_profile(user_id)


async def upload_photo(user_id: str, photo_url: str) -> dict:
    db = get_db()
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"avatar": photo_url, "updated_at": datetime.now(timezone.utc)}},
    )
    return await get_profile(user_id)
