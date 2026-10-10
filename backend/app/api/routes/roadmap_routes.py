"""Roadmap routes — user roadmap CRUD + adaptive milestone progress updates."""

from typing import Optional
from fastapi import APIRouter, Depends, Query

from app.schemas.learning import RoadmapMilestone
from app.services import roadmap_service
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/roadmap", tags=["Roadmap"])


@router.get("", response_model=dict)
async def get_roadmap(
    career: Optional[str] = Query(None, description="Canonical career or slug"),
    regenerate: bool = Query(False, description="Force adaptive regeneration"),
    user: dict = Depends(get_current_user),
):
    """Retrieve existing user roadmap or adaptively generate one for the target career."""
    return await roadmap_service.get_or_generate_roadmap(
        user_id=str(user["_id"]),
        career_identifier=career,
        force_regenerate=regenerate,
    )


@router.post("/generate", response_model=dict)
async def generate_roadmap(
    payload: dict = {},
    user: dict = Depends(get_current_user),
):
    """Explicitly generate / regenerate an adaptive roadmap for the target career."""
    career = payload.get("career") or payload.get("target_role")
    return await roadmap_service.get_or_generate_roadmap(
        user_id=str(user["_id"]),
        career_identifier=career,
        force_regenerate=True,
    )


@router.post("", response_model=dict)
async def upsert_roadmap(
    target_role: str,
    milestones: list[RoadmapMilestone],
    user: dict = Depends(get_current_user),
):
    """Directly upsert custom roadmap milestones."""
    return await roadmap_service.upsert_roadmap(str(user["_id"]), target_role, milestones)


@router.put("/milestone/{roadmap_id}/{index}", response_model=dict)
async def update_milestone(
    roadmap_id: str,
    index: int,
    status: str = Query("completed", description="not_started | in-progress | completed"),
    progress: int = Query(100, ge=0, le=100, description="0-100 completion percentage"),
    user: dict = Depends(get_current_user),
):
    """Update milestone status and progress, auto-syncing overall progress and next action."""
    return await roadmap_service.update_milestone(
        roadmap_id=roadmap_id,
        milestone_index=index,
        status=status,
        progress=progress,
        user_id=str(user["_id"]),
    )
