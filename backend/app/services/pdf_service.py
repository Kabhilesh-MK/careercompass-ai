"""PDF report generation service using only the stdlib + basic text.

ReportLab is not available in this environment, so we generate a clean
HTML-based report and return it as a well-formatted HTML string.  The
frontend renders it in a hidden iframe and calls window.print() to produce
a browser-native PDF — no server-side binary dependency needed.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


def _bar(pct: float, color: str = "#6D4CFF") -> str:
    filled = max(0, min(100, pct))
    return (
        f'<div style="background:#f1f5f9;border-radius:6px;height:8px;width:100%;">'
        f'<div style="background:{color};width:{filled}%;height:100%;border-radius:6px;"></div>'
        f'</div>'
    )


def generate_html_report(report_data: dict[str, Any], user_info: dict[str, Any] | None = None) -> str:
    """Build a print-ready HTML report from ML report data."""
    now = datetime.now(timezone.utc).strftime("%B %d, %Y")
    user = user_info or {}
    name = user.get("full_name", "Student")
    college = user.get("college", "")
    email = user.get("email", "")
    cgpa = user.get("cgpa", "")

    pred = report_data.get("prediction", {})
    career = pred.get("predicted_career", "—")
    confidence = pred.get("confidence", 0)
    top5 = pred.get("top_5_careers", [])

    gap = report_data.get("skill_gap", {})
    match_pct = gap.get("match_percentage", 0)
    missing = gap.get("missing_skills", [])
    strengths_sk = gap.get("strengths", [])

    placement = report_data.get("placement", {})
    overall_score = placement.get("overall_score", 0)
    readiness = placement.get("readiness_level", "")
    components = placement.get("components", {})
    suggestions = placement.get("suggestions", [])

    recs = report_data.get("recommendations", {})
    courses = recs.get("courses", [])
    certs = recs.get("certifications", [])
    projects_rec = recs.get("projects", [])

    roadmap = report_data.get("roadmap", [])

    color_map = {"programming": "#6D4CFF", "soft_skills": "#8B5CF6", "projects": "#22C55E",
                 "cgpa": "#F59E0B", "internship": "#3B82F6", "certifications": "#EC4899",
                 "communication": "#14B8A6"}

    top5_rows = "".join(
        f'<tr><td style="padding:8px 0;color:#374151;font-weight:500;">{c["career"]}</td>'
        f'<td style="padding:8px 0;width:120px;">{_bar(c["probability"])}</td>'
        f'<td style="padding:8px 0;text-align:right;color:#6D4CFF;font-weight:600;">{c["probability"]:.1f}%</td></tr>'
        for c in top5
    )

    missing_pills = "".join(
        f'<span style="display:inline-block;background:#FEE2E2;color:#DC2626;border-radius:20px;'
        f'padding:4px 12px;font-size:12px;margin:3px;font-weight:500;">{s["name"]}</span>'
        for s in missing[:10]
    )

    strength_pills = "".join(
        f'<span style="display:inline-block;background:#DCFCE7;color:#16A34A;border-radius:20px;'
        f'padding:4px 12px;font-size:12px;margin:3px;font-weight:500;">{s["name"]} {s["level"]:.0f}%</span>'
        for s in strengths_sk[:5]
    )

    component_rows = "".join(
        f'<tr><td style="padding:6px 0;color:#374151;font-weight:500;text-transform:capitalize;">'
        f'{k.replace("_"," ")}</td>'
        f'<td style="padding:6px 0;width:180px;">{_bar(v, color_map.get(k,"#6D4CFF"))}</td>'
        f'<td style="padding:6px 0;text-align:right;font-weight:600;color:#374151;">{v:.0f}%</td></tr>'
        for k, v in components.items()
    )

    suggestion_items = "".join(f'<li style="margin:6px 0;color:#4B5563;">{s}</li>' for s in suggestions[:5])

    course_list = "".join(f'<li style="margin:4px 0;color:#4B5563;">{c}</li>' for c in courses[:5])
    cert_list = "".join(f'<li style="margin:4px 0;color:#4B5563;">{c}</li>' for c in certs[:4])
    project_list = "".join(f'<li style="margin:4px 0;color:#4B5563;">{p}</li>' for p in projects_rec[:4])

    roadmap_rows = "".join(
        f'<div style="display:flex;align-items:flex-start;gap:16px;margin-bottom:16px;">'
        f'<div style="background:#6D4CFF;color:white;border-radius:20px;padding:4px 12px;'
        f'font-size:11px;font-weight:600;white-space:nowrap;flex-shrink:0;">{m.get("week","")}</div>'
        f'<div><div style="font-weight:600;color:#111827;font-size:14px;">{m.get("title","")}</div>'
        f'<div style="color:#6B7280;font-size:12px;margin-top:2px;">{m.get("description","")}</div></div>'
        f'</div>'
        for m in roadmap
    )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>CareerCompass AI — Career Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
  * {{ margin:0;padding:0;box-sizing:border-box; }}
  body {{ font-family:'Poppins',sans-serif;color:#111827;background:#fff;padding:40px; }}
  h2 {{ font-size:18px;font-weight:700;color:#111827;margin-bottom:16px; }}
  h3 {{ font-size:14px;font-weight:600;color:#374151;margin-bottom:10px; }}
  .section {{ margin-bottom:36px;padding-bottom:28px;border-bottom:1px solid #F3F4F6; }}
  table {{ width:100%;border-collapse:collapse; }}
  @media print {{
    body {{ padding:20px; }}
    .no-print {{ display:none; }}
  }}
</style>
</head>
<body>

<!-- Header -->
<div style="display:flex;justify-content:space-between;align-items:center;
            background:linear-gradient(135deg,#6D4CFF,#8B5CF6);
            color:white;border-radius:16px;padding:28px 32px;margin-bottom:32px;">
  <div>
    <div style="font-size:22px;font-weight:700;letter-spacing:-0.5px;">CareerCompass AI</div>
    <div style="font-size:13px;opacity:0.85;margin-top:2px;">Intelligent Career Guidance Platform</div>
  </div>
  <div style="text-align:right;font-size:13px;opacity:0.9;">
    <div style="font-weight:600;">{name}</div>
    {f'<div>{college}</div>' if college else ''}
    {f'<div>{email}</div>' if email else ''}
    {f'<div>CGPA: {cgpa}</div>' if cgpa else ''}
    <div style="margin-top:4px;">Generated: {now}</div>
  </div>
</div>

<!-- Career Prediction -->
<div class="section">
  <h2>🎯 Career Prediction</h2>
  <div style="display:flex;align-items:center;gap:24px;margin-bottom:20px;
              background:#F5F3FF;border-radius:12px;padding:20px 24px;">
    <div>
      <div style="font-size:28px;font-weight:700;color:#6D4CFF;">{career}</div>
      <div style="color:#6B7280;margin-top:4px;">Predicted Career Path</div>
    </div>
    <div style="margin-left:auto;text-align:center;">
      <div style="font-size:36px;font-weight:700;color:#6D4CFF;">{confidence:.1f}%</div>
      <div style="color:#6B7280;font-size:12px;">Confidence</div>
    </div>
  </div>
  <h3>Top Career Matches</h3>
  <table>{top5_rows}</table>
</div>

<!-- Skill Gap -->
<div class="section">
  <h2>📊 Skill Gap Analysis</h2>
  <div style="display:flex;gap:16px;margin-bottom:20px;">
    <div style="flex:1;background:#F0FDF4;border-radius:10px;padding:16px;">
      <div style="font-size:28px;font-weight:700;color:#16A34A;">{match_pct:.0f}%</div>
      <div style="color:#6B7280;font-size:13px;">Skill Match</div>
    </div>
    <div style="flex:1;background:#FEF2F2;border-radius:10px;padding:16px;">
      <div style="font-size:28px;font-weight:700;color:#DC2626;">{len(missing)}</div>
      <div style="color:#6B7280;font-size:13px;">Missing Skills</div>
    </div>
  </div>
  <h3>Strengths</h3>
  <div style="margin-bottom:16px;">{strength_pills or '<span style="color:#6B7280;">No strengths data</span>'}</div>
  <h3>Missing Skills</h3>
  <div>{missing_pills or '<span style="color:#22C55E;font-size:13px;">All required skills met!</span>'}</div>
</div>

<!-- Placement Readiness -->
<div class="section">
  <h2>🚀 Placement Readiness</h2>
  <div style="display:flex;align-items:center;gap:24px;margin-bottom:20px;
              background:#FFF7ED;border-radius:12px;padding:20px 24px;">
    <div>
      <div style="font-size:36px;font-weight:700;color:#F59E0B;">{overall_score:.0f}%</div>
      <div style="color:#6B7280;">Overall Score</div>
    </div>
    <div style="font-size:15px;font-weight:600;color:#92400E;">{readiness}</div>
  </div>
  <h3>Component Breakdown</h3>
  <table style="margin-bottom:16px;">{component_rows}</table>
  <h3>Suggestions</h3>
  <ul style="padding-left:20px;">{suggestion_items}</ul>
</div>

<!-- Recommendations -->
<div class="section">
  <h2>📚 Recommendations</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;">
    <div>
      <h3>Courses</h3>
      <ul style="padding-left:18px;">{course_list}</ul>
    </div>
    <div>
      <h3>Certifications</h3>
      <ul style="padding-left:18px;">{cert_list}</ul>
    </div>
    <div>
      <h3>Projects</h3>
      <ul style="padding-left:18px;">{project_list}</ul>
    </div>
  </div>
</div>

<!-- Roadmap -->
<div class="section">
  <h2>🗺️ 6-Week Learning Roadmap</h2>
  {roadmap_rows}
</div>

<!-- Footer -->
<div style="text-align:center;color:#9CA3AF;font-size:12px;margin-top:24px;border-top:1px solid #F3F4F6;padding-top:16px;">
  Generated by CareerCompass AI · Intelligent Skill Gap Analysis and Career Recommendation System
</div>

</body>
</html>"""
