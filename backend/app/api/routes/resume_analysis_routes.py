"""Resume analysis routes — enhanced analyzer endpoint."""

from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import get_current_user
from app.services import resume_analyzer_service

router = APIRouter(prefix="/api/resume/analyze", tags=["Resume Analysis"])


@router.post("/{resume_id}", response_model=dict)
async def analyze_resume(
    resume_id: str,
    predicted_career: str = Query(default=""),
    user: dict = Depends(get_current_user),
):
    """Trigger enhanced analysis for an already-uploaded resume."""
    from app.database.connection import get_db
    db = get_db()
    from bson import ObjectId
    resume = await db.resumes.find_one({"_id": ObjectId(resume_id), "user_id": str(user["_id"])})
    if not resume:
        from app.utils.exceptions import NotFoundError
        raise NotFoundError("Resume not found.")
    file_path = resume.get("file_path", "")
    return await resume_analyzer_service.analyze_and_save(
        resume_id, str(user["_id"]), file_path, predicted_career
    )


@router.get("/{resume_id}", response_model=dict)
async def get_analysis(resume_id: str, user: dict = Depends(get_current_user)):
    result = await resume_analyzer_service.get_analysis(resume_id, user_id=str(user["_id"]))
    if not result:
        from app.utils.exceptions import NotFoundError
        raise NotFoundError("Analysis not found. Please run analysis first.")
    return result
