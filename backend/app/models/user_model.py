"""MongoDB document builders for the users collection."""

from datetime import datetime, timezone
from typing import Optional

from app.schemas.user import UserBase
from app.schemas.auth import RegisterRequest
from app.auth.security import hash_password


def build_user_document(data: RegisterRequest) -> dict:
    now = datetime.now(timezone.utc)
    return {
        "full_name": data.full_name,
        "email": data.email.lower(),
        "password": hash_password(data.password),
        "phone": data.phone,
        "role": "student",
        "degree": data.degree,
        "department": data.department,
        "college": data.college,
        "year": data.year,
        "cgpa": data.cgpa,
        "skills": [],
        "interests": data.interests,
        "education": [],
        "avatar": None,
        "bio": None,
        "location": None,
        "profile_completed": False,
        "preferred_domain": None,
        "internships": 0,
        "projects_completed": 0,
        "certifications_count": 0,
        "created_at": now,
        "updated_at": now,
    }


def build_admin_document(full_name: str, email: str, hashed_password: str) -> dict:
    now = datetime.now(timezone.utc)
    return {
        "full_name": full_name,
        "email": email.lower(),
        "password": hashed_password,
        "role": "admin",
        "created_at": now,
        "updated_at": now,
    }
