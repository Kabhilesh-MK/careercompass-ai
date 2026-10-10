"""Settings routes — theme, notifications, privacy, change password."""

from fastapi import APIRouter, Depends

from app.schemas.misc import SettingsUpdate, ChangePasswordRequest
from app.services import settings_service, auth_service
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/settings", tags=["Settings"])


@router.get("", response_model=dict)
async def get_settings(user: dict = Depends(get_current_user)):
    return await settings_service.get_settings(str(user["_id"]))


@router.put("", response_model=dict)
async def update_settings(data: SettingsUpdate, user: dict = Depends(get_current_user)):
    return await settings_service.update_settings(str(user["_id"]), data)


@router.put("/password", response_model=dict)
async def change_password(data: ChangePasswordRequest, user: dict = Depends(get_current_user)):
    await auth_service.change_password(str(user["_id"]), data.current_password, data.new_password)
    return {"message": "Password updated successfully."}
