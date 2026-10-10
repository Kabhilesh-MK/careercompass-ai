"""Projects routes — canonical catalogue, recommendations, and CRUD."""

from __future__ import annotations

from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.schemas.learning import Project
from app.services.crud_service import project_service as crud_project_service
from app.services import project_service
from app.auth.dependencies import get_current_user, get_current_admin, get_current_user_optional

router = APIRouter(prefix="/api/projects", tags=["Projects"])


@router.get("", response_model=list[dict[str, Any]])
async def list_projects(
    career: Optional[str] = Query(default=None, description="Filter by canonical career or slug"),
    skill: Optional[str] = Query(default=None, description="Filter by specific skill"),
    difficulty: Optional[str] = Query(default=None, description="Filter by Beginner, Intermediate, Advanced"),
    search: Optional[str] = Query(default=None, description="Text search across title, description, skills"),
    user: Optional[dict] = Depends(get_current_user_optional),
):
    """List canonical projects with optional filtering and user activity state."""
    user_id = str(user["_id"]) if user else None
    return await project_service.list_projects(
        career=career,
        skill=skill,
        difficulty=difficulty,
        search=search,
        user_id=user_id,
    )


@router.get("/recommended", response_model=dict[str, Any])
async def get_recommended_projects(
    career: Optional[str] = Query(default=None, description="Target career for recommendations"),
    user: dict = Depends(get_current_user),
):
    """Get categorized, ranked project recommendations tailored to student gaps and active roadmap."""
    return await project_service.get_recommended_projects(str(user["_id"]), career=career)


@router.get("/{item_id}", response_model=dict[str, Any])
async def get_project(
    item_id: str,
    user: Optional[dict] = Depends(get_current_user_optional),
):
    """Get full project specification by ID with student activity state."""
    user_id = str(user["_id"]) if user else None
    proj = await project_service.get_project_by_id(item_id, user_id=user_id)
    if not proj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project '{item_id}' not found.",
        )
    return proj


@router.post("", response_model=dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_project(data: Project, user: dict = Depends(get_current_user)):
    return await crud_project_service.create(data.model_dump())


@router.put("/{item_id}", response_model=dict[str, Any])
async def update_project(item_id: str, data: Project, user: dict = Depends(get_current_user)):
    return await crud_project_service.update(item_id, data.model_dump(exclude_unset=True))


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(item_id: str, user: dict = Depends(get_current_admin)):
    await crud_project_service.delete(item_id)
