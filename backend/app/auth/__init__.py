"""Auth package — exposes security, JWT, and dependency helpers."""

from .security import hash_password, verify_password
from .jwt_handler import create_access_token, create_refresh_token, decode_token, verify_access_token
from .dependencies import get_current_user, get_current_admin, require_role, revoke_token

__all__ = [
    "hash_password",
    "verify_password",
    "create_access_token",
    "create_refresh_token",
    "decode_token",
    "verify_access_token",
    "get_current_user",
    "get_current_admin",
    "require_role",
    "revoke_token",
]
