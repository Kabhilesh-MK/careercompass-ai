"""Async MongoDB connection management using Motor."""

from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import settings

_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None


async def connect_db() -> None:
    """Initialize the Motor client and database. Call on app startup."""
    global _client, _db
    _client = AsyncIOMotorClient(settings.MONGODB_URL)
    _db = _client[settings.MONGODB_DB_NAME]
    # Verify connectivity
    await _client.admin.command("ping")


async def close_db() -> None:
    """Close the Motor client. Call on app shutdown."""
    global _client, _db
    if _client is not None:
        _client.close()
    _client = None
    _db = None


def get_db() -> AsyncIOMotorDatabase:
    """Return the active database handle. Raises if not initialized."""
    if _db is None:
        raise RuntimeError("Database not initialized. Call connect_db() on startup.")
    return _db


def get_client() -> AsyncIOMotorClient:
    if _client is None:
        raise RuntimeError("Database not initialized. Call connect_db() on startup.")
    return _client
