"""Utility helpers shared across the backend."""

from bson import ObjectId


def oid_to_str(doc: dict | None) -> dict | None:
    """Convert a Mongo document's _id ObjectId to a string id field."""
    if doc is None:
        return None
    doc = dict(doc)
    if "_id" in doc and isinstance(doc["_id"], ObjectId):
        doc["_id"] = str(doc["_id"])
    return doc


def str_to_oid(id_str: str) -> ObjectId:
    return ObjectId(id_str)
