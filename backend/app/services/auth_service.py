"""Authentication service — register, login, password reset, token refresh."""

from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId

from app.database.connection import get_db
from app.models.user_model import build_user_document
from app.auth.security import hash_password, verify_password
from app.auth.jwt_handler import create_access_token, create_refresh_token, decode_token
from app.schemas.auth import RegisterRequest, LoginRequest, ResetPasswordRequest
from app.utils.exceptions import ConflictError, UnauthorizedError, NotFoundError
from app.utils.helpers import oid_to_str


async def register_user(data: RegisterRequest) -> dict:
    db = get_db()
    existing = await db.users.find_one({"email": data.email.lower()})
    if existing:
        raise ConflictError("An account with this email already exists.")

    doc = build_user_document(data)
    result = await db.users.insert_one(doc)
    user_id = str(result.inserted_id)

    access = create_access_token(user_id, "student")
    refresh = create_refresh_token(user_id, "student")

    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
        "role": "student",
        "user_id": user_id,
        "full_name": data.full_name,
        "profile_completed": False,
    }


async def login_user(data: LoginRequest) -> dict:
    db = get_db()
    user = await db.users.find_one({"email": data.email.lower()})
    if not user:
        raise UnauthorizedError("Invalid email or password.")
    stored_hash = user.get("password") or user.get("password_hash")
    if not stored_hash or not verify_password(data.password, stored_hash):
        raise UnauthorizedError("Invalid email or password.")

    user_id = str(user["_id"])
    role = user.get("role", "student")
    access = create_access_token(user_id, role)
    refresh = create_refresh_token(user_id, role)

    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
        "role": role,
        "user_id": user_id,
        "full_name": user["full_name"],
        "profile_completed": user.get("profile_completed", False),
    }



async def admin_login(email: str, password: str) -> dict:
    db = get_db()
    admin = await db.admins.find_one({"email": email.lower()})
    if not admin:
        raise UnauthorizedError("Invalid admin credentials.")
    if not verify_password(password, admin["password"]):
        raise UnauthorizedError("Invalid admin credentials.")

    admin_id = str(admin["_id"])
    access = create_access_token(admin_id, "admin")
    refresh = create_refresh_token(admin_id, "admin")
    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
        "role": "admin",
        "user_id": admin_id,
        "full_name": admin["full_name"],
    }


def refresh_token(refresh_token_str: str) -> dict:
    try:
        payload = decode_token(refresh_token_str)
    except Exception:
        raise UnauthorizedError("Invalid refresh token.")
    if payload.get("type") != "refresh":
        raise UnauthorizedError("Invalid refresh token.")
    user_id = payload["sub"]
    role = payload["role"]
    access = create_access_token(user_id, role)
    return {"access_token": access, "token_type": "bearer"}


async def forgot_password(email: str) -> str:
    """Create a reset token (Phase 2: returned in response; email sending in later phase)."""
    db = get_db()
    user = await db.users.find_one({"email": email.lower()})
    if not user:
        # Do not leak whether the email exists.
        return "If that email exists, a reset link has been sent."
    from app.auth.jwt_handler import create_access_token
    reset_token = create_access_token(str(user["_id"]), "student", extra={"type": "reset"})
    await db.users.update_one({"_id": user["_id"]}, {"$set": {"reset_token": reset_token, "updated_at": datetime.now(timezone.utc)}})
    return reset_token


async def reset_password(token: str, new_password: str) -> None:
    from app.auth.jwt_handler import verify_access_token
    payload = verify_access_token(token)
    if payload is None or payload.get("type") not in ("access", "reset"):
        raise UnauthorizedError("Invalid or expired reset token.")
    user_id = payload["sub"]
    db = get_db()
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password": hash_password(new_password), "reset_token": None, "updated_at": datetime.now(timezone.utc)}},
    )
    if result.matched_count == 0:
        raise NotFoundError("User not found.")


async def change_password(user_id: str, current_password: str, new_password: str) -> None:
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise NotFoundError("User not found.")
    if not verify_password(current_password, user["password"]):
        raise UnauthorizedError("Current password is incorrect.")
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password": hash_password(new_password), "updated_at": datetime.now(timezone.utc)}},
    )
