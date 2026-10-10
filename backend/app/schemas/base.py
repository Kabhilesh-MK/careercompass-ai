"""Shared Pydantic helpers used across schemas."""

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class MongoModel(BaseModel):
    """Base model that maps Mongo _id <-> id and handles datetime serialization."""

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        json_encoders={datetime: lambda v: v.isoformat()},
    )

    id: Optional[str] = Field(default=None, alias="_id")


def utcnow() -> datetime:
    return datetime.now(timezone.utc)
