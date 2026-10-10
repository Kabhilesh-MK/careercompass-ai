"""Admin routes — dashboard statistics and user management."""

from fastapi import APIRouter, Depends

from app.services import admin_service
from app.auth.dependencies import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/stats", response_model=dict, dependencies=[Depends(get_current_admin)])
async def get_stats():
    return await admin_service.get_stats()


@router.get("/users", response_model=list, dependencies=[Depends(get_current_admin)])
async def list_users():
    return await admin_service.list_users()


@router.get("/users/{user_id}", response_model=dict, dependencies=[Depends(get_current_admin)])
async def get_user(user_id: str):
    return await admin_service.get_user(user_id)


@router.put("/users/{user_id}/status", response_model=dict, dependencies=[Depends(get_current_admin)])
async def update_user_status(user_id: str, status: str):
    return await admin_service.update_user_status(user_id, status)
