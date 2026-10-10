"""Reports routes — generate JSON report."""

from fastapi import APIRouter, Depends

from app.services import report_service
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("", response_model=dict)
async def get_report(user: dict = Depends(get_current_user)):
    return await report_service.generate_report(str(user["_id"]))
