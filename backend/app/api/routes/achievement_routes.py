"""Achievements routes."""

from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.services import achievement_service

router = APIRouter(prefix="/api/achievements", tags=["Achievements"])


@router.get("", response_model=list)
async def list_achievements(user: dict = Depends(get_current_user)):
    return await achievement_service.get_user_achievements(str(user["_id"]))


@router.post("/grant/{key}", response_model=dict)
async def grant(key: str, user: dict = Depends(get_current_user)):
    badge = await achievement_service.grant_achievement(str(user["_id"]), key)
    return badge or {"message": "Already earned or invalid key"}


@router.post("/evaluate", response_model=list)
async def evaluate(context: dict, user: dict = Depends(get_current_user)):
    """Evaluate & auto-grant achievements based on provided context dict."""
    return await achievement_service.evaluate_and_grant(str(user["_id"]), context)
