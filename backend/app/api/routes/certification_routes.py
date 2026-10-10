"""Certifications routes — canonical credentials catalogue, recommendations, and CRUD."""

from __future__ import annotations

from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.schemas.learning import Certification
from app.services.crud_service import certification_service as crud_cert_service
from app.services import certification_service
from app.auth.dependencies import get_current_user, get_current_admin, get_current_user_optional

router = APIRouter(prefix="/api/certifications", tags=["Certifications"])


@router.get("", response_model=list[dict[str, Any]])
async def list_certifications(
    career: Optional[str] = Query(default=None, description="Filter by canonical career or slug"),
    skill: Optional[str] = Query(default=None, description="Filter by skill covered"),
    level: Optional[str] = Query(default=None, description="Filter by Beginner, Intermediate, Advanced"),
    search: Optional[str] = Query(default=None, description="Text search across title, provider, skills"),
    user: Optional[dict] = Depends(get_current_user_optional),
):
    """List canonical certifications with optional filtering and user progress state."""
    user_id = str(user["_id"]) if user else None
    return await certification_service.list_certifications(
        career=career,
        skill=skill,
        level=level,
        search=search,
        user_id=user_id,
    )


@router.get("/recommended", response_model=dict[str, Any])
async def get_recommended_certifications(
    career: Optional[str] = Query(default=None, description="Target career for recommendations"),
    user: dict = Depends(get_current_user),
):
    """Get categorized, ranked certification recommendations tailored to student gaps."""
    return await certification_service.get_recommended_certifications(str(user["_id"]), career=career)


@router.get("/{item_id}", response_model=dict[str, Any])
async def get_certification(
    item_id: str,
    user: Optional[dict] = Depends(get_current_user_optional),
):
    """Get full certification specification by ID with student activity state."""
    user_id = str(user["_id"]) if user else None
    cert = await certification_service.get_certification_by_id(item_id, user_id=user_id)
    if not cert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Certification '{item_id}' not found.",
        )
    return cert


@router.post("", response_model=dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_certification(data: Certification, user: dict = Depends(get_current_user)):
    return await crud_cert_service.create(data.model_dump())


@router.put("/{item_id}", response_model=dict[str, Any])
async def update_certification(item_id: str, data: Certification, user: dict = Depends(get_current_user)):
    return await crud_cert_service.update(item_id, data.model_dump(exclude_unset=True))


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_certification(item_id: str, user: dict = Depends(get_current_admin)):
    await crud_cert_service.delete(item_id)
