"""Resume routes — upload (PDF), list, get, delete."""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status

from app.services import resume_service
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/resume", tags=["Resume"])


@router.post("/upload", response_model=dict, status_code=201)
async def upload_resume(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    content = await file.read()
    return await resume_service.save_resume(
        user_id=str(user["_id"]),
        filename=file.filename or "resume.pdf",
        content=content,
        content_type=file.content_type or "application/pdf",
    )


@router.get("", response_model=dict)
async def get_resume(user: dict = Depends(get_current_user)):
    resume = await resume_service.get_resume(str(user["_id"]))
    return resume or {"message": "No resume uploaded yet."}


@router.get("/list", response_model=list)
async def list_resumes(user: dict = Depends(get_current_user)):
    return await resume_service.list_resumes(str(user["_id"]))


@router.delete("/{resume_id}", status_code=204)
async def delete_resume(resume_id: str, user: dict = Depends(get_current_user)):
    await resume_service.delete_resume(resume_id, str(user["_id"]))
