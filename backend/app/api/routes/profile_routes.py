"""Profile routes — get/update profile, update skills, education, upload photo."""

from fastapi import APIRouter, Depends, UploadFile, File

from app.schemas.user import UserUpdate, SkillsUpdate, UserResponse
from app.services import profile_service
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/profile", tags=["Profile"])


@router.get("", response_model=dict)
async def get_profile(user: dict = Depends(get_current_user)):
    return await profile_service.get_profile(str(user["_id"]))


@router.put("/update", response_model=dict)
async def update_profile(data: UserUpdate, user: dict = Depends(get_current_user)):
    return await profile_service.update_profile(str(user["_id"]), data)


@router.put("/skills", response_model=dict)
async def update_skills(data: SkillsUpdate, user: dict = Depends(get_current_user)):
    return await profile_service.update_skills(str(user["_id"]), data)


@router.put("/education", response_model=dict)
async def update_education(education: list[dict], user: dict = Depends(get_current_user)):
    return await profile_service.update_education(str(user["_id"]), education)


@router.post("/photo", response_model=dict)
async def upload_photo(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    # Phase 2: store photo URL string; actual file storage in later phase.
    photo_url = f"/uploads/avatars/{user['_id']}_{file.filename}"
    return await profile_service.upload_photo(str(user["_id"]), photo_url)
