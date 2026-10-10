"""Learning progress routes — track projects, certifications, courses, and roadmap."""

from __future__ import annotations

from typing import Any, Optional
from fastapi import APIRouter, Depends, Query, Body, status

from app.auth.dependencies import get_current_user
from app.schemas.engagement import UpdateProgressRequest
from app.services import learning_progress_service

router = APIRouter(tags=["Learning Progress"])


@router.get("/api/progress", response_model=dict[str, Any])
@router.get("/api/learning-progress", response_model=dict[str, Any])
async def get_progress(user: dict = Depends(get_current_user)):
    """Retrieve full learning progress record with metrics and skills in progress."""
    return await learning_progress_service.get_progress(str(user["_id"]))


@router.post("/api/progress/item", response_model=dict[str, Any])
async def update_item(
    body: UpdateProgressRequest,
    user: dict = Depends(get_current_user),
):
    """Generic endpoint to update a course, project, or certification progress."""
    return await learning_progress_service.update_item(
        str(user["_id"]),
        body.item_type,
        body.item_id,
        body.completed,
        body.progress_pct,
        body.title,
        body.provider,
    )


@router.put("/api/learning-progress/project/{project_id}", response_model=dict[str, Any])
@router.put("/api/progress/project/{project_id}", response_model=dict[str, Any])
async def update_project_progress(
    project_id: str,
    progress_pct: int = Query(default=100, ge=0, le=100, description="Numerical completion percentage"),
    completed: Optional[bool] = Query(default=None, description="Explicit completion flag"),
    status: Optional[str] = Query(default=None, description="not_started | in-progress | completed"),
    user: dict = Depends(get_current_user),
):
    """Update project completion percentage and status."""
    return await learning_progress_service.update_project_progress(
        user_id=str(user["_id"]),
        project_id=project_id,
        progress_pct=progress_pct,
        completed=completed,
        status=status,
    )


@router.put("/api/learning-progress/certification/{cert_id}", response_model=dict[str, Any])
@router.put("/api/progress/certification/{cert_id}", response_model=dict[str, Any])
async def update_certification_progress(
    cert_id: str,
    completed: Optional[bool] = Query(default=None, description="Whether credential was achieved"),
    status: Optional[str] = Query(default=None, description="not_started | in_progress | completed | earned"),
    user: dict = Depends(get_current_user),
):
    """Update certification earned status."""
    return await learning_progress_service.update_certification_progress(
        user_id=str(user["_id"]),
        cert_id=cert_id,
        completed=completed,
        status=status,
    )


@router.post("/api/progress/roadmap", response_model=dict[str, Any])
async def update_roadmap(
    pct: int = Query(..., ge=0, le=100),
    user: dict = Depends(get_current_user),
):
    """Update roadmap overall progress and recalculate learning progress."""
    return await learning_progress_service.update_roadmap_completion(str(user["_id"]), pct)
