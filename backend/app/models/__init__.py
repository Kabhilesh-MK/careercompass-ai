"""Models package — document builders for MongoDB collections."""

from .user_model import build_user_document, build_admin_document

__all__ = ["build_user_document", "build_admin_document"]
