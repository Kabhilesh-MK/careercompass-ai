"""Career catalogue, exploration, and user-specific fit routes."""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import get_current_user
from app.services.career_discovery_service import (
    get_all_canonical_careers,
    get_canonical_career_detail,
    resolve_canonical_career,
    evaluate_user_career_fit,
)

router = APIRouter(prefix="/api/careers", tags=["Careers"])


@router.get("", response_model=list[dict[str, Any]])
async def list_careers():
    """Return all 14 canonical career classes from the verified knowledge base."""
    return get_all_canonical_careers()


@router.get("/{career_id}", response_model=dict[str, Any])
async def get_career(career_id: str):
    """Get full details for a canonical career by slug or title."""
    canonical_name = resolve_canonical_career(career_id)
    if not canonical_name:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Career '{career_id}' not found in canonical catalogue.",
        )
    return get_canonical_career_detail(canonical_name)


@router.get("/{career_id}/fit", response_model=dict[str, Any])
async def get_career_fit(
    career_id: str,
    user: dict = Depends(get_current_user),
):
    """Evaluate authenticated student's real profile and model probability for target career."""
    canonical_name = resolve_canonical_career(career_id)
    if not canonical_name:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Career '{career_id}' not found in canonical catalogue.",
        )
    return await evaluate_user_career_fit(str(user["_id"]), canonical_name)
