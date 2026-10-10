"""PDF and Email report routes."""

from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

from app.auth.dependencies import get_current_user
from app.services.pdf_service import generate_html_report
from app.services.email_service import send_report_email

router = APIRouter(prefix="/api/report", tags=["Reports"])


class ReportRequest(BaseModel):
    report_data: dict
    user_info: dict = {}


@router.post("/html", response_class=HTMLResponse)
async def get_html_report(body: ReportRequest, user: dict = Depends(get_current_user)):
    """Return a print-ready HTML report."""
    user_info = body.user_info or {
        "full_name": user.get("full_name", ""),
        "email": user.get("email", ""),
        "college": user.get("college", ""),
        "cgpa": user.get("cgpa", ""),
    }
    html = generate_html_report(body.report_data, user_info)
    return HTMLResponse(content=html)


class EmailRequest(BaseModel):
    report_data: dict
    to_email: str = ""


@router.post("/email", response_model=dict)
async def email_report(body: EmailRequest, user: dict = Depends(get_current_user)):
    """Send the career report to the user's email."""
    to_email = body.to_email or user.get("email", "")
    if not to_email:
        return {"status": "failed", "message": "No email address provided"}
    return await send_report_email(
        to_email=to_email,
        recipient_name=user.get("full_name", "Student"),
        report_data=body.report_data,
    )
