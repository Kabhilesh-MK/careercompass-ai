"""Generic CRUD service used for projects, certifications, roadmaps."""

from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId

from app.database.connection import get_db
from app.utils.exceptions import NotFoundError
from app.utils.helpers import oid_to_str


class CRUDService:
    """Reusable async CRUD over a named collection."""

    def __init__(self, collection_name: str, user_scoped: bool = False):
        self.collection_name = collection_name
        self.user_scoped = user_scoped

    @property
    def collection(self):
        return get_db()[self.collection_name]

    async def list(self, user_id: Optional[str] = None, limit: int = 50) -> list[dict]:
        query = {}
        if self.user_scoped and user_id:
            query["user_id"] = user_id
        cursor = self.collection.find(query).limit(limit)
        docs = await cursor.to_list(length=limit)
        return [oid_to_str(d) for d in docs]

    async def get(self, item_id: str) -> dict:
        doc = await self.collection.find_one({"_id": ObjectId(item_id)})
        if not doc:
            raise NotFoundError(f"{self.collection_name} item not found.")
        return oid_to_str(doc)

    async def create(self, data: dict) -> dict:
        now = datetime.now(timezone.utc)
        data["created_at"] = now
        data["updated_at"] = now
        result = await self.collection.insert_one(data)
        data["_id"] = str(result.inserted_id)
        return data

    async def update(self, item_id: str, data: dict) -> dict:
        data.pop("_id", None)
        data["updated_at"] = datetime.now(timezone.utc)
        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(item_id)},
            {"$set": data},
            return_document=True,
        )
        if not result:
            raise NotFoundError(f"{self.collection_name} item not found.")
        return oid_to_str(result)

    async def delete(self, item_id: str) -> None:
        result = await self.collection.delete_one({"_id": ObjectId(item_id)})
        if result.deleted_count == 0:
            raise NotFoundError(f"{self.collection_name} item not found.")


project_service = CRUDService("projects")
certification_service = CRUDService("certifications")
roadmap_service = CRUDService("roadmaps", user_scoped=True)
career_service = CRUDService("careers")
learning_resource_service = CRUDService("learning_resources")
chat_service = CRUDService("chat_history", user_scoped=True)
