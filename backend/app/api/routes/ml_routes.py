"""ML prediction routes.

POST /api/ml/predict   — full career prediction + report
POST /api/ml/retrain   — admin: trigger model retraining
GET  /api/ml/status    — check whether saved model artifacts are ready
GET  /api/ml/prediction - get latest prediction report
GET  /api/ml/placement  - get latest placement score
GET  /api/ml/skill-gap  - get latest skill gap analysis
"""

from __future__ import annotations

from typing import Any, Optional
from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, Depends, BackgroundTasks

from app.auth.dependencies import get_current_user
from app.schemas.ml_schemas import MLReportResponse, StudentProfile
from app.services.ml_service import retrain_models, run_full_prediction
from app.services.roadmap_service import upsert_roadmap
from app.schemas.learning import RoadmapMilestone
from app.database.connection import get_db
from app.utils.helpers import oid_to_str
from ml.utils.paths import ENCODER_PATH, MODEL_PATH

router = APIRouter(prefix="/api/ml", tags=["ML Engine"])

# Import here so the path reference resolves at module load time
from ml.preprocessing.preprocessor import PREPROCESSOR_PATH  # noqa: E402


@router.post("/predict", response_model=MLReportResponse)
async def predict_career(
    profile: StudentProfile,
    user: dict = Depends(get_current_user),
):
    """Run the full ML pipeline for a student profile.

    Returns career prediction, skill gap analysis, placement readiness,
    personalised recommendations, learning roadmap, and chart data.
    """
    profile_dict = profile.to_ml_dict()
    result = await run_full_prediction(profile_dict)
    
    # Generate honest explainability for top prediction
    from app.services.career_discovery_service import build_career_explanation
    predicted_career = result["prediction"]["predicted_career"]
    explanation = build_career_explanation(profile_dict, predicted_career, result["skill_gap"], user)
    result["prediction"]["explanation"] = explanation

    # Save predictions to MongoDB, scope to authenticated user ID
    db = get_db()
    user_id = str(user["_id"])
    now = datetime.now(timezone.utc)
    
    pred_payload = {
        "user_id": user_id,
        "profile": profile_dict,
        "prediction": result["prediction"],
        "skill_gap": result["skill_gap"],
        "placement": result["placement"],
        "recommendations": result["recommendations"],
        "visualization_data": result["visualization_data"],
        "updated_at": now,
    }
    
    # Upsert prediction
    await db.predictions.update_one(
        {"user_id": user_id},
        {"$set": pred_payload, "$setOnInsert": {"created_at": now}},
        upsert=True
    )
    
    # Save the roadmap milestones to roadmaps collection
    milestones = [RoadmapMilestone(**m) for m in result["roadmap"]]
    await upsert_roadmap(user_id, result["prediction"]["predicted_career"], milestones)
    
    # Finally, set profile_completed = True
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"profile_completed": True, "updated_at": now}}
    )
    
    return result


@router.get("/prediction", response_model=dict)
async def get_latest_prediction(user: dict = Depends(get_current_user)):
    db = get_db()
    pred = await db.predictions.find_one({"user_id": str(user["_id"])}, sort=[("updated_at", -1)])
    if not pred:
        return {}
    return oid_to_str(pred)


from ml.prediction.skill_gap import analyse as analyse_skill_gap
from ml.dataset.career_knowledge_base import KNOWLEDGE_BASE


@router.get("/placement", response_model=dict)
async def get_latest_placement(user: dict = Depends(get_current_user)):
    db = get_db()
    pred = await db.predictions.find_one({"user_id": str(user["_id"])}, sort=[("updated_at", -1)])
    if not pred:
        return {
            "overallScore": 0,
            "status": "Needs Preparation",
            "breakdown": [],
            "strengths": [],
            "weaknesses": [],
            "recommendations": [],
            "companyReadiness": [],
            "interviewReadiness": {},
        }

    placement_data = pred.get("placement", {})
    components = placement_data.get("components", {})
    breakdown = [{"subject": k.replace("_", " ").title(), "score": round(v)} for k, v in components.items()]

    overall = round(placement_data.get("overall_score", 0))
    status_label = (
        placement_data.get("readiness_level")
        or ("Placement Ready" if overall >= 75 else "On Track" if overall >= 50 else "Needs Preparation")
    )

    # Format strengths and weaknesses cleanly
    strengths_raw = placement_data.get("strengths", [])
    weaknesses_raw = placement_data.get("weaknesses", [])
    strengths = [
        {"name": s, "score": round(components.get(s.lower().replace(" ", "_"), 80))} if isinstance(s, str) else s
        for s in strengths_raw
    ]
    weaknesses = [
        {"name": w, "score": round(components.get(w.lower().replace(" ", "_"), 45))} if isinstance(w, str) else w
        for w in weaknesses_raw
    ]

    prog = components.get("programming", 50)
    proj = components.get("projects", 50)
    cgpa = components.get("cgpa", 50)
    soft = components.get("soft_skills", 50)
    company_readiness = [
        {"company": "Product Startups", "score": round(min(100, proj * 0.55 + prog * 0.45))},
        {"company": "Mid-size Tech", "score": round(min(100, prog * 0.4 + soft * 0.3 + proj * 0.3))},
        {"company": "Tier-1 Enterprise", "score": round(min(100, cgpa * 0.35 + prog * 0.45 + soft * 0.2))},
        {"company": "Consulting & Services", "score": round(min(100, soft * 0.45 + cgpa * 0.3 + prog * 0.25))},
    ]

    return {
        "overallScore": overall,
        "status": status_label,
        "breakdown": breakdown,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": placement_data.get("suggestions", []),
        "companyReadiness": company_readiness,
        "interviewReadiness": {k: round(v) for k, v in components.items()},
    }


@router.get("/skill-gap", response_model=dict)
async def get_latest_skill_gap(
    career: Optional[str] = None,
    user: dict = Depends(get_current_user),
):
    """Return dynamic, domain-tiered skill-gap analysis for user against target career."""
    from app.services.career_discovery_service import evaluate_skill_gap_for_user
    return await evaluate_skill_gap_for_user(str(user["_id"]), career)


@router.post("/compare", response_model=dict)
async def compare_careers(
    payload: dict,
    user: dict = Depends(get_current_user),
):
    """Evaluate 2-3 target careers side-by-side using the student's real profile."""
    from app.services.career_discovery_service import (
        resolve_canonical_career,
        to_slug,
        _build_project_recommendations,
        _build_cert_recommendations,
    )
    from ml.prediction.skill_gap import CAREER_SKILL_TIERS, TIER_CONFIG

    raw_careers: list[str] = payload.get("careers", [])
    resolved: list[str] = []
    for c in raw_careers:
        canon = resolve_canonical_career(c)
        if canon and canon not in resolved:
            resolved.append(canon)

    if len(resolved) < 2:
        resolved = ["Full Stack Developer", "Backend Developer", "Software Engineer"]
    careers_to_compare = resolved[:3]

    db = get_db()
    pred = await db.predictions.find_one({"user_id": str(user["_id"])}, sort=[("updated_at", -1)])
    user_doc = await db.users.find_one({"_id": ObjectId(str(user["_id"]))}) or {}

    # Reconstruct student profile dict for skill-gap evaluation
    profile_dict: dict[str, Any] = {}
    if pred and isinstance(pred.get("profile"), dict):
        profile_dict.update(pred["profile"])

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

    # Map existing genuine model probabilities
    prob_map: dict[str, float] = {}
    if pred and "prediction" in pred:
        all_preds = pred["prediction"].get("all_predictions") or []
        for item in all_preds:
            prob_map[item["career"]] = float(item["probability"])
        if not prob_map:
            for item in pred["prediction"].get("top_5_careers", []):
                prob_map[item["career"]] = float(item["probability"])

    cgpa_val = profile_dict["CGPA"]
    academic_fit = round(min(100.0, (cgpa_val / 8.5) * 100), 1)

    proj_val = profile_dict["Projects Completed"]
    intern_val = profile_dict["Internship"]
    experience_fit = round(min(100.0, ((proj_val / 4.0) * 0.6 + (intern_val / 2.0) * 0.4) * 100), 1)

    all_relevant_skills: set[str] = set()
    results = []

    for career_name in careers_to_compare:
        kb_data = KNOWLEDGE_BASE.get(career_name, {})
        sg = analyse_skill_gap(profile_dict, career_name)
        crit_count = sum(1 for m in sg.get("missing_skills", []) if m.get("priority") == "Critical")
        total_gaps = len(sg.get("missing_skills", []))

        track = (
            "Advanced Track (4 weeks)" if total_gaps <= 1
            else "Job-Ready Track (6–8 weeks)" if total_gaps <= 4
            else "Foundation Track (8–12 weeks)"
        )

        tiers = CAREER_SKILL_TIERS.get(career_name, {})
        career_core = tiers.get("CORE", [])
        career_important = tiers.get("IMPORTANT", [])
        all_relevant_skills.update(career_core)
        all_relevant_skills.update(career_important)

        missing = sg.get("missing_skills", [])
        projects = _build_project_recommendations(kb_data.get("projects", []), missing, career_name)
        certs = _build_cert_recommendations(kb_data.get("certifications", []), career_name)

        results.append({
            "career": career_name,
            "slug": to_slug(career_name),
            "model_probability": round(prob_map.get(career_name, 0.0), 2),
            "has_model_probability": career_name in prob_map,
            "skill_fit_percentage": round(sg.get("match_percentage", 0.0), 1),
            "academic_fit_percentage": academic_fit,
            "experience_fit_percentage": experience_fit,
            "critical_gaps_count": crit_count,
            "total_gaps_count": total_gaps,
            "top_gaps": [m["name"] for m in missing[:3]],
            "core_skills": career_core,
            "important_skills": career_important,
            "recommended_projects": projects[:3],
            "recommended_certifications": certs[:2],
            "roadmap_track": track,
            "description": kb_data.get("description", ""),
            "salary_range": kb_data.get("salary_range", "Industry Standard"),
            "growth": kb_data.get("growth", "High"),
            "demand": kb_data.get("demand", "High"),
        })

    # Build side-by-side core skills comparison matrix
    skills_matrix = []
    for sk in sorted(all_relevant_skills):
        user_lvl = round(float(profile_dict.get(sk, 0.0)), 1)
        req_by_career: dict[str, Any] = {}
        for c_name in careers_to_compare:
            tiers = CAREER_SKILL_TIERS.get(c_name, {})
            tier_name = "CORE" if sk in tiers.get("CORE", []) else ("IMPORTANT" if sk in tiers.get("IMPORTANT", []) else None)
            if tier_name:
                target_req = TIER_CONFIG[tier_name]["target"]
                req_by_career[c_name] = {
                    "required": target_req,
                    "tier": tier_name,
                    "status": "met" if user_lvl >= target_req else ("partial" if user_lvl >= target_req * 0.5 else "gap"),
                }
            else:
                req_by_career[c_name] = None

        skills_matrix.append({
            "skill": sk,
            "user_level": user_lvl,
            "career_requirements": req_by_career,
        })

    return {
        "comparisons": results,
        "skills_matrix": skills_matrix,
        "summary": "Compare the requirements, skill profiles, and learning tracks across these careers. You make the final decision.",
    }


@router.post("/retrain", response_model=dict)
async def trigger_retrain(
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user),
):
    """Trigger a background model retraining (admin / power users)."""
    background_tasks.add_task(retrain_models)
    return {"message": "Model retraining scheduled in the background."}


@router.get("/status", response_model=dict)
async def model_status():
    """Return whether the trained model artifacts exist on disk."""
    return {
        "model_ready": MODEL_PATH.exists(),
        "encoder_ready": ENCODER_PATH.exists(),
        "preprocessor_ready": PREPROCESSOR_PATH.exists(),
        "model_path": str(MODEL_PATH),
    }
