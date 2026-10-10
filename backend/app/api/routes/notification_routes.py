"""Notifications routes."""

from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import get_current_user
from app.schemas.engagement import MarkReadRequest
from app.services import notification_service

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("", response_model=list)
async def list_notifications(
    unread_only: bool = Query(default=False),
    user: dict = Depends(get_current_user),
):
    return await notification_service.get_notifications(str(user["_id"]), unread_only)


@router.get("/count", response_model=dict)
async def unread_count(user: dict = Depends(get_current_user)):
    count = await notification_service.get_unread_count(str(user["_id"]))
    return {"unread": count}


@router.post("/read", response_model=dict)
async def mark_read(body: MarkReadRequest, user: dict = Depends(get_current_user)):
    modified = await notification_service.mark_read(str(user["_id"]), body.ids)
    return {"modified": modified}


@router.delete("/{notif_id}", response_model=dict)
async def delete_notification(notif_id: str, user: dict = Depends(get_current_user)):
    ok = await notification_service.delete_notification(str(user["_id"]), notif_id)
    return {"deleted": ok}
