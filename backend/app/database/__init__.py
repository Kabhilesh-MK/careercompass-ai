"""Database package — exposes connection helpers and collection names."""

COLLECTIONS = {
    "users": "users",
    "skills": "skills",
    "careers": "careers",
    "predictions": "predictions",
    "roadmaps": "roadmaps",
    "projects": "projects",
    "certifications": "certifications",
    "learning_resources": "learning_resources",
    "placement_scores": "placement_scores",
    "resumes": "resumes",
    "chat_history": "chat_history",
    "admins": "admins",
}

from .connection import connect_db, close_db, get_db, get_client  # noqa: E402

__all__ = ["COLLECTIONS", "connect_db", "close_db", "get_db", "get_client"]
