"""Favorites routes."""

from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import get_current_user
from app.schemas.engagement import AddFavoriteRequest
from app.services import favorites_service

router = APIRouter(prefix="/api/favorites", tags=["Favorites"])


@router.get("", response_model=list)
async def list_favorites(
    item_type: str | None = Query(default=None),
    user: dict = Depends(get_current_user),
):
    return await favorites_service.get_favorites(str(user["_id"]), item_type)


@router.post("", response_model=dict)
async def add_favorite(body: AddFavoriteRequest, user: dict = Depends(get_current_user)):
    return await favorites_service.add_favorite(
        str(user["_id"]), body.item_type, body.item_id, body.item_title, body.item_meta
    )


@router.delete("", response_model=dict)
async def remove_favorite(
    item_type: str = Query(...),
    item_id: str = Query(...),
    user: dict = Depends(get_current_user),
):
    ok = await favorites_service.remove_favorite(str(user["_id"]), item_type, item_id)
    return {"removed": ok}


@router.delete("/{item_id}", response_model=dict)
async def remove_favorite_by_id(
    item_id: str,
    item_type: str | None = Query(default=None),
    user: dict = Depends(get_current_user),
):
    from app.database.connection import get_db
    db = get_db()
    q = {"user_id": str(user["_id"]), "item_id": item_id}
    if item_type:
        q["item_type"] = item_type
    res = await db.favorites.delete_one(q)
    return {"removed": res.deleted_count > 0}


@router.get("/check", response_model=dict)
async def check_favorite(
    item_type: str = Query(...),
    item_id: str = Query(...),
    user: dict = Depends(get_current_user),
):
    is_fav = await favorites_service.is_favorite(str(user["_id"]), item_type, item_id)
    return {"is_favorite": is_fav}
