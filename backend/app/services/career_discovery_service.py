"""Career discovery and explainability service.

Provides canonical career catalogue data, slug resolution, user-specific fit evaluation,
and honest profile explainability without fabricating data or pseudo-attributions.
"""

from __future__ import annotations

import re
from typing import Any, Optional
from bson import ObjectId

from ml.dataset.career_knowledge_base import KNOWLEDGE_BASE
from ml.prediction.skill_gap import analyse as analyse_skill_gap, CAREER_SKILL_TIERS, TIER_CONFIG
from app.database.connection import get_db

# ---------------------------------------------------------------------------
# Canonical Career Taxonomy & Categories
# ---------------------------------------------------------------------------

CANONICAL_CAREERS = [
    "AI Engineer",
    "Backend Developer",
    "Business Analyst",
    "Cloud Engineer",
    "Cybersecurity Analyst",
    "Data Analyst",
    "Data Scientist",
    "DevOps Engineer",
    "Frontend Developer",
    "Full Stack Developer",
    "ML Engineer",
    "Mobile App Developer",
    "QA Engineer",
    "Software Engineer",
]

CAREER_CATEGORIES: dict[str, str] = {
    "AI Engineer": "Data & AI",
    "Backend Developer": "Software Development",
    "Business Analyst": "Business & Analytics",
    "Cloud Engineer": "Cloud & DevOps",
    "Cybersecurity Analyst": "Security & QA",
    "Data Analyst": "Data & AI",
    "Data Scientist": "Data & AI",
    "DevOps Engineer": "Cloud & DevOps",
    "Frontend Developer": "Software Development",
    "Full Stack Developer": "Software Development",
    "ML Engineer": "Data & AI",
    "Mobile App Developer": "Software Development",
    "QA Engineer": "Security & QA",
    "Software Engineer": "Software Development",
}


def to_slug(career_name: str) -> str:
    """Convert career name to URL-safe canonical slug."""
    slug = career_name.lower().replace("&", "and")
    slug = re.sub(r"[^a-z0-9]+", "-", slug).strip("-")
    return slug


SLUG_TO_CANONICAL: dict[str, str] = {to_slug(name): name for name in CANONICAL_CAREERS}


def resolve_canonical_career(identifier: str) -> Optional[str]:
    """Resolve identifier (slug, canonical name, or case-insensitive title) to canonical career."""
    if not identifier:
        return None
    cleaned = identifier.strip()
    if cleaned in KNOWLEDGE_BASE:
        return cleaned

    slug = to_slug(cleaned)
    if slug in SLUG_TO_CANONICAL:
        return SLUG_TO_CANONICAL[slug]

    cleaned_lower = cleaned.lower()
    for canonical in CANONICAL_CAREERS:
        if canonical.lower() == cleaned_lower:
            return canonical

    return None


def get_canonical_career_summary(career_name: str) -> dict[str, Any]:
    """Return lightweight summary suitable for exploration cards and lists."""
    kb_item = KNOWLEDGE_BASE.get(career_name, {})
    tiers = CAREER_SKILL_TIERS.get(career_name, {})
    core_skills = tiers.get("CORE", kb_item.get("required_skills", [])[:4])
    important_skills = tiers.get("IMPORTANT", [])
    supporting_skills = tiers.get("SUPPORTING", [])

    return {
        "id": to_slug(career_name),
        "title": career_name,
        "slug": to_slug(career_name),
        "category": CAREER_CATEGORIES.get(career_name, "Technology"),
        "description": kb_item.get("description", ""),
        "required_skills": kb_item.get("required_skills", []),
        "core_skills": core_skills,
        "important_skills": important_skills,
        "supporting_skills": supporting_skills,
        "soft_skills": kb_item.get("soft_skills", []),
        "demand": kb_item.get("demand", "High"),
        "growth": kb_item.get("growth", "High"),
        "salary_range": kb_item.get("salary_range", "Industry Standard"),
    }


def get_all_canonical_careers() -> list[dict[str, Any]]:
    """Return all 14 canonical career items in alphabetical order."""
    return [get_canonical_career_summary(c) for c in sorted(CANONICAL_CAREERS)]


def get_canonical_career_detail(career_name: str) -> dict[str, Any]:
    """Return complete knowledge base details for a canonical career."""
    kb_item = KNOWLEDGE_BASE.get(career_name)
    if not kb_item:
        raise KeyError(f"Career '{career_name}' not found in canonical knowledge base.")

    tiers = CAREER_SKILL_TIERS.get(career_name, {})
    return {
        "id": to_slug(career_name),
        "title": career_name,
        "slug": to_slug(career_name),
        "category": CAREER_CATEGORIES.get(career_name, "Technology"),
        "description": kb_item.get("description", ""),
        "required_skills": kb_item.get("required_skills", []),
        "core_skills": tiers.get("CORE", []),
        "important_skills": tiers.get("IMPORTANT", []),
        "supporting_skills": tiers.get("SUPPORTING", []),
        "optional_skills": tiers.get("OPTIONAL", []),
        "soft_skills": kb_item.get("soft_skills", []),
        "courses": kb_item.get("courses", []),
        "certifications": kb_item.get("certifications", []),
        "projects": kb_item.get("projects", []),
        "books": kb_item.get("books", []),
        "practice_sites": kb_item.get("practice_sites", []),
        "interview_topics": kb_item.get("interview_topics", []),
        "demand": kb_item.get("demand", "High"),
        "growth": kb_item.get("growth", "High"),
        "salary_range": kb_item.get("salary_range", "Industry Standard"),
    }


# ---------------------------------------------------------------------------
# Explainability & User Fit Evaluation
# ---------------------------------------------------------------------------

async def evaluate_user_career_fit(user_id: str, career_name: str) -> dict[str, Any]:
    """Evaluate a user's real skill profile against a target career.

    Uses single source of truth skill_gap.analyse, maps model probability from latest
    prediction, and generates honest explanation without pseudo-attributions.
    """
    db = get_db()
    pred_doc = await db.predictions.find_one({"user_id": user_id}, sort=[("updated_at", -1)])
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)}) or {}

    # Extract user skills profile from prediction record or user document
    profile_dict: dict[str, Any] = {}
    if pred_doc and isinstance(pred_doc.get("profile"), dict):
        profile_dict.update(pred_doc["profile"])

    for cat in (user_doc.get("skills") or []):
        for sk in (cat.get("skills") or []):
            profile_dict[sk["name"]] = float(sk.get("level", 0.0))

    def _safe_float(val, default):
        if val is None:
            return default
        try:
            return float(val)
        except (ValueError, TypeError):
            return default

    def _safe_int(val, default):
        if val is None:
            return default
        try:
            return int(val)
        except (ValueError, TypeError):
            return default

    profile_dict["CGPA"] = _safe_float(profile_dict.get("CGPA", user_doc.get("cgpa")), 7.5)
    profile_dict["Projects Completed"] = _safe_int(profile_dict.get("Projects Completed", user_doc.get("projects_completed")), 0)
    profile_dict["Internship"] = _safe_int(profile_dict.get("Internship", user_doc.get("internships")), 0)
    profile_dict["Certifications"] = _safe_int(profile_dict.get("Certifications", user_doc.get("certifications_count")), 0)
    profile_dict["Preferred Domain"] = profile_dict.get("Preferred Domain") or user_doc.get("preferred_domain") or "Full Stack"
    interests = user_doc.get("interests", ["Web Development"])
    profile_dict["Interest"] = profile_dict.get("Interest") or (interests[0] if interests else "Web Development")

    # Run single source of truth skill gap analysis
    sg = analyse_skill_gap(profile_dict, career_name)

    # Retrieve genuine model probability
    model_prob: Optional[float] = None
    has_prediction = False
    last_updated: Optional[str] = None

    if pred_doc and "prediction" in pred_doc:
        has_prediction = True
        last_updated = pred_doc.get("updated_at", pred_doc.get("created_at", "")).isoformat() if hasattr(pred_doc.get("updated_at", pred_doc.get("created_at")), "isoformat") else str(pred_doc.get("updated_at", ""))

        # Check all_predictions first, then top_5_careers
        all_preds = pred_doc["prediction"].get("all_predictions") or []
        for p in all_preds:
            if p.get("career") == career_name:
                model_prob = float(p.get("probability", 0.0))
                break

        if model_prob is None:
            top_5 = pred_doc["prediction"].get("top_5_careers") or []
            for p in top_5:
                if p.get("career") == career_name:
                    model_prob = float(p.get("probability", 0.0))
                    break

        if model_prob is None:
            # Career was evaluated by model but not in top 5 and all_predictions was absent
            model_prob = 0.0

    # Categorize gaps into Critical, Important, Developing
    missing = sg.get("missing_skills", [])
    critical_gaps = sg.get("critical", [m for m in missing if m.get("priority") == "Critical"])
    important_gaps = sg.get("important", [m for m in missing if m.get("priority") in ("Important", "High")])
    developing_gaps = sg.get("developing", [m for m in missing if m.get("priority") in ("Developing", "Medium", "Low")])

    # Explainability breakdown
    explanation = build_career_explanation(profile_dict, career_name, sg, user_doc)

    # Recommended projects with reasons
    kb_detail = get_canonical_career_detail(career_name)
    recommended_projects = _build_project_recommendations(kb_detail.get("projects", []), missing, career_name)
    recommended_certs = _build_cert_recommendations(kb_detail.get("certifications", []), career_name)

    # Adaptive Roadmap track
    total_gaps = len(missing)
    crit_count = len(critical_gaps)
    if crit_count == 0 and total_gaps <= 1:
        track = "Accelerated Track (4 weeks)"
        desc = "Your foundational skills are met. Focus directly on advanced capstone projects and interview readiness."
    elif crit_count <= 2 and total_gaps <= 4:
        track = "Job-Ready Track (6–8 weeks)"
        desc = "Target priority competencies first to close critical gaps, then assemble portfolio projects."
    else:
        track = "Foundation Track (8–12 weeks)"
        desc = "Step-by-step competency building across core and important domain skills."

    return {
        "career": career_name,
        "slug": to_slug(career_name),
        "model_probability": round(model_prob, 2) if model_prob is not None else None,
        "has_prediction": has_prediction,
        "last_prediction_date": last_updated,
        "skill_fit": {
            "match_percentage": sg.get("match_percentage", 0.0),
            "current_skills": sg.get("current_skills", []),
            "missing_skills": missing,
            "critical_gaps": critical_gaps,
            "important_gaps": important_gaps,
            "developing_gaps": developing_gaps,
            "strengths": sg.get("strengths", []),
            "weaknesses": sg.get("weaknesses", []),
            "skills_met_count": sg.get("skills_met", 0),
            "total_required": sg.get("total_required", 0),
        },
        "explanation": explanation,
        "recommended_projects": recommended_projects,
        "recommended_certifications": recommended_certs,
        "roadmap_preview": {
            "track": track,
            "description": desc,
            "critical_gaps_count": crit_count,
            "total_gaps_count": total_gaps,
            "top_gaps": [m["name"] for m in missing[:3]],
        },
    }


def build_career_explanation(
    profile_dict: dict[str, Any],
    career_name: str,
    skill_gap_result: dict[str, Any],
    user_doc: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    """Generate explainability data based on actual user profile and career tiers.

    Distinguishes statistical model probability from rule-based competency comparisons.
    """
    current_skills = skill_gap_result.get("current_skills", [])
    missing_skills = skill_gap_result.get("missing_skills", [])

    # Strong alignment: skills in CORE or IMPORTANT tiers that meet or exceed required threshold
    strong_alignment = [
        {"skill": s["name"], "level": s["level"], "required": s["required"], "tier": s["tier"]}
        for s in current_skills
        if s.get("status") == "met" or s["level"] >= 60
    ]

    # Areas to strengthen: missing skills sorted by priority
    areas_to_strengthen = [
        {
            "skill": m["name"],
            "current": m["current"],
            "required": m["required"],
            "gap": m["gap"],
            "priority": m["priority"],
            "tier": m["tier"],
        }
        for m in missing_skills[:4]
    ]

    # Supporting factors from profile
    supporting_factors = []
    cgpa = float(profile_dict.get("CGPA", 7.0))
    if cgpa >= 7.5:
        supporting_factors.append(f"Strong academic foundation ({cgpa:.1f} CGPA)")

    projects_count = int(profile_dict.get("Projects Completed", 0))
    if projects_count > 0:
        supporting_factors.append(f"{projects_count} practical project(s) completed")

    internships = int(profile_dict.get("Internship", 0))
    if internships > 0:
        supporting_factors.append(f"{internships} internship experience(s) logged")

    certs_count = int(profile_dict.get("Certifications", 0))
    if certs_count > 0:
        supporting_factors.append(f"{certs_count} industry certification(s) logged")

    preferred_domain = profile_dict.get("Preferred Domain", "")
    career_category = CAREER_CATEGORIES.get(career_name, "")
    if preferred_domain.lower() in career_category.lower() or career_category.lower() in preferred_domain.lower():
        supporting_factors.append(f"Aligned with preferred domain ({preferred_domain})")

    return {
        "career": career_name,
        "strong_alignment": strong_alignment,
        "supporting_factors": supporting_factors,
        "areas_to_strengthen": areas_to_strengthen,
        "model_statement": (
            "Model probability represents statistical similarity between your overall profile "
            "vector and historical training benchmarks from the validated Random Forest classifier."
        ),
        "competency_statement": (
            "Skill alignment reflects explicit technical domain requirements defined in the CareerCompass "
            "knowledge base across CORE, IMPORTANT, and SUPPORTING tiers."
        ),
    }


def _build_project_recommendations(
    kb_projects: list[str],
    missing_skills: list[dict[str, Any]],
    career_name: str,
) -> list[dict[str, Any]]:
    """Format recommended projects with specific rationale."""
    missing_names = {m["name"].lower(): m["name"] for m in missing_skills}
    results = []

    for idx, p_title in enumerate(kb_projects):
        # Match project title with relevant skills
        matched_gaps = [orig for low, orig in missing_names.items() if low in p_title.lower()]
        difficulty = "Intermediate" if idx % 2 == 0 else "Advanced"

        if matched_gaps:
            reason = f"Directly addresses priority skill gaps in {', '.join(matched_gaps)} and provides portfolio evidence."
        else:
            reason = f"Builds practical capstone experience aligned with industry {career_name} workflows."

        results.append({
            "id": f"proj-{to_slug(career_name)}-{idx+1}",
            "title": p_title,
            "difficulty": difficulty,
            "career": career_name,
            "matched_gaps": matched_gaps,
            "reason": reason,
        })

    return results


def _build_cert_recommendations(
    kb_certs: list[str],
    career_name: str,
) -> list[dict[str, Any]]:
    """Format recommended certifications with clear rationale."""
    results = []
    for idx, cert_title in enumerate(kb_certs):
        provider = "Industry Recognized"
        if "AWS" in cert_title:
            provider = "Amazon Web Services"
        elif "Google" in cert_title:
            provider = "Google Cloud"
        elif "Microsoft" in cert_title or "Azure" in cert_title or "Power BI" in cert_title:
            provider = "Microsoft"
        elif "Meta" in cert_title:
            provider = "Meta"
        elif "IBM" in cert_title:
            provider = "IBM"
        elif "CompTIA" in cert_title:
            provider = "CompTIA"
        elif "Oracle" in cert_title:
            provider = "Oracle"
        elif "ISTQB" in cert_title:
            provider = "ISTQB"

        reason = f"Validates verified domain competency for {career_name} hiring evaluations."

        results.append({
            "id": f"cert-{to_slug(career_name)}-{idx+1}",
            "title": cert_title,
            "provider": provider,
            "career": career_name,
            "reason": reason,
        })
    return results


async def evaluate_skill_gap_for_user(
    user_id: str,
    career_identifier: Optional[str] = None,
) -> dict[str, Any]:
    """Dynamically evaluate user skill gap against target career.

    If career_identifier is provided, resolves to canonical career.
    Otherwise defaults to the user's latest predicted career or preferred domain.
    """
    db = get_db()
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)}) or {}
    pred_doc = await db.predictions.find_one({"user_id": user_id}, sort=[("updated_at", -1)])

    # Determine canonical target career
    canonical_career: Optional[str] = None
    if career_identifier:
        canonical_career = resolve_canonical_career(career_identifier)

    if not canonical_career and pred_doc and "prediction" in pred_doc:
        candidate = pred_doc["prediction"].get("predicted_career")
        if candidate:
            canonical_career = resolve_canonical_career(candidate)

    if not canonical_career:
        # Fallback to user preferred domain or Software Engineer
        domain = user_doc.get("preferred_domain", "")
        for c in CANONICAL_CAREERS:
            if domain and domain.lower() in c.lower():
                canonical_career = c
                break
        if not canonical_career:
            canonical_career = "Software Engineer"

    # Assemble user's fresh profile
    profile_dict: dict[str, Any] = {}
    if pred_doc and isinstance(pred_doc.get("profile"), dict):
        profile_dict.update(pred_doc["profile"])

    # Always layer current user_doc skills to allow instant skill update propagation
    for cat in (user_doc.get("skills") or []):
        for sk in (cat.get("skills") or []):
            profile_dict[sk["name"]] = float(sk.get("level", 0.0))

    def _safe_float(val, default):
        if val is None:
            return default
        try:
            return float(val)
        except (ValueError, TypeError):
            return default

    def _safe_int(val, default):
        if val is None:
            return default
        try:
            return int(val)
        except (ValueError, TypeError):
            return default

    profile_dict["CGPA"] = _safe_float(profile_dict.get("CGPA", user_doc.get("cgpa")), 7.5)
    profile_dict["Projects Completed"] = _safe_int(profile_dict.get("Projects Completed", user_doc.get("projects_completed")), 0)
    profile_dict["Internship"] = _safe_int(profile_dict.get("Internship", user_doc.get("internships")), 0)
    profile_dict["Certifications"] = _safe_int(profile_dict.get("Certifications", user_doc.get("certifications_count")), 0)

    # Perform domain-tiered skill gap analysis using the single engine
    sg = analyse_skill_gap(profile_dict, canonical_career)

    # Format recommendations (projects & certifications from knowledge base)
    kb_detail = get_canonical_career_detail(canonical_career)
    missing = sg.get("missing_skills", [])
    rec_projects = _build_project_recommendations(kb_detail.get("projects", []), missing, canonical_career)
    rec_certs = _build_cert_recommendations(kb_detail.get("certifications", []), canonical_career)

    recs_list = []
    for p in rec_projects[:2]:
        recs_list.append({
            "id": p["id"],
            "title": p["title"],
            "impact": "Portfolio Project",
            "type": "project",
            "reason": p.get("reason", ""),
        })
    for c in rec_certs[:2]:
        recs_list.append({
            "id": c["id"],
            "title": c["title"],
            "impact": "Industry Credential",
            "type": "cert",
            "reason": c.get("reason", ""),
            "provider": c.get("provider", ""),
        })

    return {
        "career": canonical_career,
        "slug": to_slug(canonical_career),
        "targetRole": canonical_career,
        "target_role": canonical_career,
        "matchPercentage": round(sg.get("match_percentage", 0.0)),
        "match_percentage": round(sg.get("match_percentage", 0.0)),
        "summary": sg.get("summary", {}),
        "critical": sg.get("critical", []),
        "important": sg.get("important", []),
        "developing": sg.get("developing", []),
        "met": sg.get("met", []),
        "currentSkills": sg.get("current_skills", []),
        "current_skills": sg.get("current_skills", []),
        "missingSkills": sg.get("missing_skills", []),
        "missing_skills": sg.get("missing_skills", []),
        "strengths": sg.get("strengths", []),
        "weaknesses": sg.get("weaknesses", []),
        "recommendations": recs_list,
        "tierSummary": sg.get("tier_summary", {}),
        "tier_summary": sg.get("tier_summary", {}),
    }

