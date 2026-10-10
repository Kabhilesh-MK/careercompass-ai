"""Skills routes — get/update user skills."""

from fastapi import APIRouter, Depends

from app.schemas.user import SkillsUpdate
from app.services import profile_service
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/skills", tags=["Skills"])


@router.get("", response_model=dict)
async def get_skills(user: dict = Depends(get_current_user)):
    profile = await profile_service.get_profile(str(user["_id"]))
    return {"skills": profile.get("skills", [])}


@router.put("", response_model=dict)
async def update_skills(data: SkillsUpdate, user: dict = Depends(get_current_user)):
    return await profile_service.update_skills(str(user["_id"]), data)
