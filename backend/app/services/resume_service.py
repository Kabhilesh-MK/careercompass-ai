"""Resume service — file metadata persistence (no NLP in Phase 2)."""

from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from bson import ObjectId

from app.config import settings
from app.database.connection import get_db
from app.utils.exceptions import NotFoundError, ValidationError
from app.utils.helpers import oid_to_str


def _resume_dir() -> Path:
    base = Path(settings.UPLOAD_DIR) / "resumes"
    base.mkdir(parents=True, exist_ok=True)
    return base


async def save_resume(
    user_id: str,
    filename: str,
    content: bytes,
    content_type: str,
) -> dict:
    clean_filename = Path(filename).name
    safe_chars = "".join(c for c in clean_filename if c.isalnum() or c in "._-")
    if not safe_chars.lower().endswith(".pdf"):
        raise ValidationError("Only PDF files are accepted.")

    # MIME validation
    valid_mimes = {"application/pdf", "application/x-pdf", "application/acrobat", "applications/pdf"}
    if content_type and content_type.lower() not in valid_mimes:
        raise ValidationError("Invalid content type. Only PDF documents are allowed.")

    # PDF Magic Bytes validation
    if not content.startswith(b"%PDF-"):
        raise ValidationError("Invalid file format. File does not contain a valid PDF header.")

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise ValidationError(f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit.")

    safe_name = f"{user_id}_{safe_chars}"
    resume_dir = _resume_dir().resolve()
    file_path = (resume_dir / safe_name).resolve()
    if not str(file_path).startswith(str(resume_dir)):
        raise ValidationError("Invalid filename or path traversal detected.")

    file_path.write_bytes(content)

    doc = {
        "user_id": user_id,
        "filename": safe_chars,
        "file_path": str(file_path),
        "file_size": len(content),
        "content_type": content_type,
        "extracted_skills": [],
        "analysis": None,
        "uploaded_at": datetime.now(timezone.utc),
    }
    result = await get_db().resumes.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc


async def get_resume(user_id: str) -> Optional[dict]:
    doc = await get_db().resumes.find_one({"user_id": user_id})
    return oid_to_str(doc)


async def list_resumes(user_id: str) -> list[dict]:
    cursor = get_db().resumes.find({"user_id": user_id}).sort("uploaded_at", -1)
    docs = await cursor.to_list(length=20)
    return [oid_to_str(d) for d in docs]


async def delete_resume(resume_id: str, user_id: str) -> None:
    db = get_db()
    doc = await db.resumes.find_one({"_id": ObjectId(resume_id), "user_id": user_id})
    if not doc:
        raise NotFoundError("Resume not found.")
    try:
        Path(doc["file_path"]).unlink(missing_ok=True)
    except Exception:
        pass
    await db.resumes.delete_one({"_id": ObjectId(resume_id), "user_id": user_id})
    await db.resume_analyses.delete_many({"resume_id": resume_id, "user_id": user_id})
