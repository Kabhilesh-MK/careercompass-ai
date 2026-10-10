"""Email report service.

Sends a career report summary email with an HTML body.
Configured via environment variables:
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, FROM_EMAIL
Falls back gracefully when SMTP is not configured.
"""

from __future__ import annotations

import asyncio
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

from loguru import logger

from app.config.settings import settings


def _build_email_html(report_data: dict[str, Any], recipient_name: str) -> str:
    pred = report_data.get("prediction", {})
    career = pred.get("predicted_career", "—")
    confidence = pred.get("confidence", 0)
    top5 = pred.get("top_5_careers", [])
    roadmap = report_data.get("roadmap", [])
    placement = report_data.get("placement", {})
    recs = report_data.get("recommendations", {})
    courses = recs.get("courses", [])[:4]

    top5_html = "".join(
        f'<tr><td style="padding:6px 8px;color:#374151;">{c["career"]}</td>'
        f'<td style="padding:6px 8px;text-align:right;font-weight:600;color:#6D4CFF;">{c["probability"]:.1f}%</td></tr>'
        for c in top5
    )
    roadmap_html = "".join(
        f'<li style="margin:6px 0;"><strong>{m.get("week","")}</strong>: {m.get("title","")}</li>'
        for m in roadmap
    )
    course_html = "".join(f'<li style="margin:4px 0;">{c}</li>' for c in courses)

    return f"""
    <div style="font-family:Poppins,Arial,sans-serif;max-width:600px;margin:0 auto;color:#111827;">
      <div style="background:linear-gradient(135deg,#6D4CFF,#8B5CF6);padding:28px 32px;border-radius:12px 12px 0 0;color:white;">
        <h1 style="margin:0;font-size:22px;font-weight:700;">CareerCompass AI</h1>
        <p style="margin:4px 0 0;opacity:0.85;font-size:13px;">Your Career Report</p>
      </div>
      <div style="padding:28px 32px;background:white;border:1px solid #E5E7EB;">
        <p style="font-size:15px;margin-bottom:20px;">Hi <strong>{recipient_name}</strong>,</p>
        <p style="color:#4B5563;margin-bottom:24px;">Your CareerCompass AI report is ready. Here's a summary of your career analysis:</p>

        <div style="background:#F5F3FF;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
          <p style="font-size:13px;color:#6B7280;margin:0 0 4px;">Predicted Career</p>
          <p style="font-size:22px;font-weight:700;color:#6D4CFF;margin:0;">{career}</p>
          <p style="font-size:13px;color:#6B7280;margin:4px 0 0;">Confidence: <strong style="color:#6D4CFF;">{confidence:.1f}%</strong></p>
        </div>

        <h3 style="font-size:14px;color:#374151;margin-bottom:10px;">Top Career Matches</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#F9FAFB;border-radius:8px;overflow:hidden;">
          {top5_html}
        </table>

        <h3 style="font-size:14px;color:#374151;margin-bottom:10px;">Placement Readiness</h3>
        <p style="color:#4B5563;margin-bottom:24px;">
          Overall Score: <strong style="color:#F59E0B;">{placement.get("overall_score", 0):.0f}%</strong> —
          {placement.get("readiness_level", "")}
        </p>

        <h3 style="font-size:14px;color:#374151;margin-bottom:10px;">Recommended Courses</h3>
        <ul style="padding-left:20px;margin-bottom:24px;">{course_html}</ul>

        <h3 style="font-size:14px;color:#374151;margin-bottom:10px;">Your 6-Week Roadmap</h3>
        <ol style="padding-left:20px;margin-bottom:24px;">{roadmap_html}</ol>

        <div style="text-align:center;margin-top:28px;">
          <a href="#" style="background:#6D4CFF;color:white;padding:12px 28px;border-radius:8px;
             text-decoration:none;font-weight:600;font-size:14px;">
            View Full Report
          </a>
        </div>
      </div>
      <div style="padding:16px 32px;background:#F9FAFB;border-radius:0 0 12px 12px;
                  text-align:center;color:#9CA3AF;font-size:12px;border:1px solid #E5E7EB;border-top:0;">
        CareerCompass AI · Intelligent Skill Gap Analysis and Career Recommendation System
      </div>
    </div>
    """


def _send_sync(to_email: str, subject: str, html_body: str) -> None:
    host = getattr(settings, "SMTP_HOST", "")
    port = int(getattr(settings, "SMTP_PORT", 587))
    user = getattr(settings, "SMTP_USER", "")
    password = getattr(settings, "SMTP_PASSWORD", "")
    from_email = getattr(settings, "FROM_EMAIL", user or "noreply@careercompass.ai")

    if not host or not user:
        logger.warning("SMTP not configured — skipping email send.")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"CareerCompass AI <{from_email}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(host, port) as smtp:
        smtp.ehlo()
        smtp.starttls()
        smtp.login(user, password)
        smtp.sendmail(from_email, [to_email], msg.as_string())
    logger.info(f"Career report email sent to {to_email}")


async def send_report_email(
    to_email: str,
    recipient_name: str,
    report_data: dict[str, Any],
) -> dict[str, str]:
    """Async wrapper — runs SMTP in thread pool."""
    html = _build_email_html(report_data, recipient_name)
    subject = f"Your CareerCompass AI Career Report — {report_data.get('prediction', {}).get('predicted_career', '')}"
    try:
        await asyncio.to_thread(_send_sync, to_email, subject, html)
        return {"status": "sent", "message": f"Report emailed to {to_email}"}
    except Exception as exc:  # noqa: BLE001
        logger.error(f"Email send failed: {exc}")
        return {"status": "failed", "message": str(exc)}
