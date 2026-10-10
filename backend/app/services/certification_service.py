"""Certification service — canonical credentials catalogue, matching, and recommendations."""

from __future__ import annotations

from typing import Any, Optional
from bson import ObjectId

from ml.dataset.career_knowledge_base import KNOWLEDGE_BASE
from app.services.career_discovery_service import (
    CANONICAL_CAREERS,
    CAREER_CATEGORIES,
    to_slug,
    resolve_canonical_career,
    evaluate_skill_gap_for_user,
)
from app.database.connection import get_db

# ---------------------------------------------------------------------------
# Canonical Certification Catalogue Definition
# ---------------------------------------------------------------------------

_CERT_PROVIDER_MAP: dict[str, str] = {
    "Oracle Certified Professional Java SE": "Oracle",
    "AWS Developer Associate": "Amazon Web Services",
    "Microsoft Certified: Azure Developer Associate": "Microsoft",
    "Meta Front-End Developer Certificate": "Meta",
    "Google UX Design Certificate": "Google",
    "AWS Certified Solutions Architect Associate": "Amazon Web Services",
    "Node.js Application Developer (JSNAD)": "OpenJS / Linux Foundation",
    "Oracle Certified Associate Java Programmer": "Oracle",
    "Meta Full-Stack Engineer Certificate": "Meta",
    "AWS Certified Developer Associate": "Amazon Web Services",
    "MongoDB Certified Developer Associate": "MongoDB",
    "Meta React Native Specialization": "Meta",
    "Google Associate Android Developer": "Google",
    "Certified Kubernetes Administrator (CKA)": "Cloud Native Computing Foundation",
    "AWS Certified DevOps Engineer Professional": "Amazon Web Services",
    "HashiCorp Certified: Terraform Associate": "HashiCorp",
    "AWS Solutions Architect Professional": "Amazon Web Services",
    "Google Associate Cloud Engineer": "Google Cloud",
    "Microsoft Certified: Azure Solutions Architect Expert": "Microsoft",
    "Google Data Analytics Professional Certificate": "Google",
    "Microsoft Power BI Data Analyst (PL-300)": "Microsoft",
    "IBM Data Analyst Professional Certificate": "IBM",
    "IBM Data Science Professional Certificate": "IBM",
    "TensorFlow Developer Certificate": "Google",
    "Microsoft Certified: Azure Data Scientist Associate": "Microsoft",
    "AWS Certified Machine Learning Specialty": "Amazon Web Services",
    "Google Professional Machine Learning Engineer": "Google Cloud",
    "DeepLearning.AI Machine Learning Specialization": "DeepLearning.AI",
    "DeepLearning.AI Deep Learning Specialization": "DeepLearning.AI",
    "AWS Certified AI Practitioner": "Amazon Web Services",
    "Microsoft Certified: Azure AI Engineer Associate": "Microsoft",
    "CompTIA Security+": "CompTIA",
    "Certified Ethical Hacker (CEH)": "EC-Council",
    "GIAC Security Essentials (GSEC)": "GIAC / SANS",
    "ISTQB Certified Tester Foundation Level (CTFL)": "ISTQB",
    "Selenium Certified Automated Professional": "Industry Standard",
    "Certified Software Quality Analyst (CSQA)": "ISQI",
    "IIBA Entry Certificate in Business Analysis (ECBA)": "IIBA",
    "PMI Professional in Business Analysis (PMI-PBA)": "PMI",
    "Certified Business Analysis Professional (CBAP)": "IIBA",
}

_CERT_LEVEL_MAP: dict[str, str] = {
    "Oracle Certified Professional Java SE": "Advanced",
    "AWS Developer Associate": "Intermediate",
    "Microsoft Certified: Azure Developer Associate": "Intermediate",
    "Meta Front-End Developer Certificate": "Beginner",
    "Google UX Design Certificate": "Beginner",
    "AWS Certified Solutions Architect Associate": "Intermediate",
    "Node.js Application Developer (JSNAD)": "Intermediate",
    "Oracle Certified Associate Java Programmer": "Beginner",
    "Meta Full-Stack Engineer Certificate": "Intermediate",
    "AWS Certified Developer Associate": "Intermediate",
    "MongoDB Certified Developer Associate": "Intermediate",
    "Meta React Native Specialization": "Intermediate",
    "Google Associate Android Developer": "Intermediate",
    "Certified Kubernetes Administrator (CKA)": "Advanced",
    "AWS Certified DevOps Engineer Professional": "Advanced",
    "HashiCorp Certified: Terraform Associate": "Intermediate",
    "AWS Solutions Architect Professional": "Advanced",
    "Google Associate Cloud Engineer": "Intermediate",
    "Microsoft Certified: Azure Solutions Architect Expert": "Advanced",
    "Google Data Analytics Professional Certificate": "Beginner",
    "Microsoft Power BI Data Analyst (PL-300)": "Intermediate",
    "IBM Data Analyst Professional Certificate": "Beginner",
    "IBM Data Science Professional Certificate": "Beginner",
    "TensorFlow Developer Certificate": "Intermediate",
    "Microsoft Certified: Azure Data Scientist Associate": "Intermediate",
    "AWS Certified Machine Learning Specialty": "Advanced",
    "Google Professional Machine Learning Engineer": "Advanced",
    "DeepLearning.AI Machine Learning Specialization": "Intermediate",
    "DeepLearning.AI Deep Learning Specialization": "Advanced",
    "AWS Certified AI Practitioner": "Beginner",
    "Microsoft Certified: Azure AI Engineer Associate": "Intermediate",
    "CompTIA Security+": "Beginner",
    "Certified Ethical Hacker (CEH)": "Intermediate",
    "GIAC Security Essentials (GSEC)": "Intermediate",
    "ISTQB Certified Tester Foundation Level (CTFL)": "Beginner",
    "Selenium Certified Automated Professional": "Intermediate",
    "Certified Software Quality Analyst (CSQA)": "Intermediate",
    "IIBA Entry Certificate in Business Analysis (ECBA)": "Beginner",
    "PMI Professional in Business Analysis (PMI-PBA)": "Advanced",
    "Certified Business Analysis Professional (CBAP)": "Advanced",
}

_CERT_SKILLS_MAP: dict[str, list[str]] = {
    "Oracle Certified Professional Java SE": ["Java", "Problem Solving"],
    "AWS Developer Associate": ["AWS", "Docker", "Git"],
    "Microsoft Certified: Azure Developer Associate": ["Azure", "SQL", "Git"],
    "Meta Front-End Developer Certificate": ["HTML", "CSS", "JavaScript", "React"],
    "Google UX Design Certificate": ["Communication", "Problem Solving"],
    "AWS Certified Solutions Architect Associate": ["AWS", "Linux", "Docker"],
    "Node.js Application Developer (JSNAD)": ["NodeJS", "JavaScript", "Git"],
    "Oracle Certified Associate Java Programmer": ["Java", "Problem Solving"],
    "Meta Full-Stack Engineer Certificate": ["React", "NodeJS", "MongoDB", "SQL"],
    "AWS Certified Developer Associate": ["AWS", "Docker", "Python"],
    "MongoDB Certified Developer Associate": ["MongoDB", "SQL", "NodeJS"],
    "Meta React Native Specialization": ["React", "JavaScript"],
    "Google Associate Android Developer": ["Java", "Git"],
    "Certified Kubernetes Administrator (CKA)": ["Docker", "Linux", "DevOps"],
    "AWS Certified DevOps Engineer Professional": ["AWS", "Docker", "Linux", "Git"],
    "HashiCorp Certified: Terraform Associate": ["AWS", "Azure", "Linux"],
    "AWS Solutions Architect Professional": ["AWS", "Linux", "Docker"],
    "Google Associate Cloud Engineer": ["Linux", "Docker", "Git"],
    "Microsoft Certified: Azure Solutions Architect Expert": ["Azure", "SQL", "Linux"],
    "Google Data Analytics Professional Certificate": ["SQL", "Excel", "Statistics", "Python"],
    "Microsoft Power BI Data Analyst (PL-300)": ["Power BI", "SQL", "Excel"],
    "IBM Data Analyst Professional Certificate": ["Python", "SQL", "Excel"],
    "IBM Data Science Professional Certificate": ["Python", "SQL", "Machine Learning", "Statistics"],
    "TensorFlow Developer Certificate": ["Python", "Deep Learning", "Machine Learning"],
    "Microsoft Certified: Azure Data Scientist Associate": ["Azure", "Python", "Machine Learning"],
    "AWS Certified Machine Learning Specialty": ["AWS", "Python", "Machine Learning"],
    "Google Professional Machine Learning Engineer": ["Python", "Machine Learning", "Deep Learning"],
    "DeepLearning.AI Machine Learning Specialization": ["Python", "Machine Learning", "Statistics"],
    "DeepLearning.AI Deep Learning Specialization": ["Python", "Deep Learning"],
    "AWS Certified AI Practitioner": ["AWS", "Python", "Problem Solving"],
    "Microsoft Certified: Azure AI Engineer Associate": ["Azure", "Python", "Deep Learning"],
    "CompTIA Security+": ["Linux", "Problem Solving"],
    "Certified Ethical Hacker (CEH)": ["Linux", "Git", "Problem Solving"],
    "GIAC Security Essentials (GSEC)": ["Linux", "Problem Solving"],
    "ISTQB Certified Tester Foundation Level (CTFL)": ["Communication", "Problem Solving"],
    "Selenium Certified Automated Professional": ["Java", "Python", "Git"],
    "Certified Software Quality Analyst (CSQA)": ["Problem Solving", "Communication"],
    "IIBA Entry Certificate in Business Analysis (ECBA)": ["Excel", "Communication", "Problem Solving"],
    "PMI Professional in Business Analysis (PMI-PBA)": ["Excel", "Communication", "Teamwork"],
    "Certified Business Analysis Professional (CBAP)": ["Power BI", "Excel", "Leadership"],
}

_CERT_URLS: dict[str, str] = {
    "Oracle Certified Professional Java SE": "https://education.oracle.com/java-se-certification",
    "AWS Developer Associate": "https://aws.amazon.com/certification/certified-developer-associate/",
    "Microsoft Certified: Azure Developer Associate": "https://learn.microsoft.com/en-us/credentials/certifications/azure-developer/",
    "Meta Front-End Developer Certificate": "https://www.coursera.org/professional-certificates/meta-front-end-developer",
    "Google UX Design Certificate": "https://grow.google/certificates/ux-design/",
    "AWS Certified Solutions Architect Associate": "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
    "Node.js Application Developer (JSNAD)": "https://training.linuxfoundation.org/certification/jsnad/",
    "Oracle Certified Associate Java Programmer": "https://education.oracle.com/oracle-certified-associate-java-se-8-programmer/",
    "Meta Full-Stack Engineer Certificate": "https://www.coursera.org/professional-certificates/meta-full-stack-engineer",
    "AWS Certified Developer Associate": "https://aws.amazon.com/certification/certified-developer-associate/",
    "MongoDB Certified Developer Associate": "https://learn.mongodb.com/pages/certified-developer-associate-exam",
    "Meta React Native Specialization": "https://www.coursera.org/specializations/meta-react-native",
    "Google Associate Android Developer": "https://developers.google.com/certification/associate-android-developer",
    "Certified Kubernetes Administrator (CKA)": "https://www.cncf.io/certification/cka/",
    "AWS Certified DevOps Engineer Professional": "https://aws.amazon.com/certification/certified-devops-engineer-professional/",
    "HashiCorp Certified: Terraform Associate": "https://www.hashicorp.com/certification/terraform-associate",
    "AWS Solutions Architect Professional": "https://aws.amazon.com/certification/certified-solutions-architect-professional/",
    "Google Associate Cloud Engineer": "https://cloud.google.com/learn/certification/cloud-engineer",
    "Microsoft Certified: Azure Solutions Architect Expert": "https://learn.microsoft.com/en-us/credentials/certifications/azure-solutions-architect/",
    "Google Data Analytics Professional Certificate": "https://grow.google/certificates/data-analytics/",
    "Microsoft Power BI Data Analyst (PL-300)": "https://learn.microsoft.com/en-us/credentials/certifications/data-analyst-associate/",
    "IBM Data Analyst Professional Certificate": "https://www.coursera.org/professional-certificates/ibm-data-analyst",
    "IBM Data Science Professional Certificate": "https://www.coursera.org/professional-certificates/ibm-data-science",
    "TensorFlow Developer Certificate": "https://www.tensorflow.org/certificate",
    "Microsoft Certified: Azure Data Scientist Associate": "https://learn.microsoft.com/en-us/credentials/certifications/azure-data-scientist/",
    "AWS Certified Machine Learning Specialty": "https://aws.amazon.com/certification/certified-machine-learning-specialty/",
    "Google Professional Machine Learning Engineer": "https://cloud.google.com/learn/certification/machine-learning-engineer",
    "DeepLearning.AI Machine Learning Specialization": "https://www.deeplearning.ai/program/machine-learning-specialization/",
    "DeepLearning.AI Deep Learning Specialization": "https://www.deeplearning.ai/program/deep-learning-specialization/",
    "AWS Certified AI Practitioner": "https://aws.amazon.com/certification/certified-ai-practitioner/",
    "Microsoft Certified: Azure AI Engineer Associate": "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-engineer/",
    "CompTIA Security+": "https://www.comptia.org/certifications/security",
    "Certified Ethical Hacker (CEH)": "https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/",
    "GIAC Security Essentials (GSEC)": "https://www.giac.org/certifications/security-essentials-gsec/",
    "ISTQB Certified Tester Foundation Level (CTFL)": "https://www.istqb.org/certifications/certified-tester-foundation-level",
    "Selenium Certified Automated Professional": "https://www.selenium.dev/documentation/",
    "Certified Software Quality Analyst (CSQA)": "https://isqi.org/en/csqa",
    "IIBA Entry Certificate in Business Analysis (ECBA)": "https://www.iiba.org/business-analysis-certifications/ecba/",
    "PMI Professional in Business Analysis (PMI-PBA)": "https://www.pmi.org/certifications/business-analysis-pba",
    "Certified Business Analysis Professional (CBAP)": "https://www.iiba.org/business-analysis-certifications/cbap/",
}


def _build_canonical_certifications() -> list[dict[str, Any]]:
    catalogue = []
    for career in sorted(CANONICAL_CAREERS):
        kb_item = KNOWLEDGE_BASE.get(career, {})
        category = CAREER_CATEGORIES.get(career, "Technology")
        slug = to_slug(career)
        kb_certs = kb_item.get("certifications", [])

        for idx, title in enumerate(kb_certs):
            c_id = f"cert-{slug}-{idx + 1}"
            provider = _CERT_PROVIDER_MAP.get(title, "Industry Recognized")
            level = _CERT_LEVEL_MAP.get(title, "Intermediate")
            skills = _CERT_SKILLS_MAP.get(title, kb_item.get("required_skills", [])[:3])
            url = _CERT_URLS.get(title, "https://www.google.com/search?q=" + title.replace(" ", "+"))
            duration = "4-6 weeks" if level == "Beginner" else ("8-12 weeks" if level == "Intermediate" else "12-16 weeks")

            catalogue.append({
                "id": c_id,
                "_id": c_id,
                "title": title,
                "provider": provider,
                "career": career,
                "career_slug": slug,
                "category": category,
                "skills": skills,
                "level": level,
                "duration": duration,
                "official_url": url,
                "url": url,
                "description": f"Verified industry credential validating {level.lower()}-level competency in {', '.join(skills[:3])} for {career} roles.",
                "prerequisites": skills[:2] if level != "Beginner" else [],
            })
    return catalogue


CANONICAL_CERTIFICATIONS: list[dict[str, Any]] = _build_canonical_certifications()
CERTIFICATION_BY_ID: dict[str, dict[str, Any]] = {c["id"]: c for c in CANONICAL_CERTIFICATIONS}


# ---------------------------------------------------------------------------
# Certification Matching & Recommendations
# ---------------------------------------------------------------------------

def calculate_cert_score(
    cert: dict[str, Any],
    target_career: Optional[str],
    skill_gaps: list[dict[str, Any]],
    user_skills: dict[str, float],
    is_completed: bool,
) -> tuple[int, list[str], str]:
    """Compute deterministic relevance score for a certification (0 - 100)."""
    score = 0
    reasons = []

    # 1. Career alignment (max 40)
    if target_career:
        canonical_target = resolve_canonical_career(target_career) or target_career
        if cert["career"].lower() == canonical_target.lower():
            score += 40
            reasons.append(f"Official credential path for {cert['career']}")
        elif cert["category"] == CAREER_CATEGORIES.get(canonical_target, ""):
            score += 20
            reasons.append(f"Validates {cert['category']} domain proficiency")

    # 2. Skill gap coverage (max 35)
    gap_by_name = {g["name"].lower(): g for g in skill_gaps}
    matched_gaps = []
    gap_score = 0

    for sk in cert["skills"]:
        sk_lower = sk.lower()
        if sk_lower in gap_by_name:
            matched_gaps.append(sk)
            gap_score += 15

    gap_score = min(35, gap_score)
    score += gap_score
    if matched_gaps:
        reasons.append(f"Validates your skill gaps in {', '.join(matched_gaps)}")

    # 3. Level suitability (max 15)
    avg_skill = sum(user_skills.values()) / max(1, len(user_skills)) if user_skills else 50.0
    level = cert["level"]
    if level == "Beginner" and avg_skill <= 50:
        score += 15
    elif level == "Intermediate" and 40 <= avg_skill <= 75:
        score += 15
    elif level == "Advanced" and avg_skill >= 65:
        score += 15
    else:
        score += 8

    # 4. Completed penalty (-50)
    if is_completed:
        score = max(10, score - 50)
        reasons.append("Already earned")

    final_score = min(100, max(15, score))
    reason = ". ".join(reasons) + "." if reasons else f"Demonstrates validated competence from {cert['provider']}."

    return final_score, matched_gaps, reason


async def list_certifications(
    career: Optional[str] = None,
    skill: Optional[str] = None,
    level: Optional[str] = None,
    search: Optional[str] = None,
    user_id: Optional[str] = None,
) -> list[dict[str, Any]]:
    """List certifications with optional filtering and user progress overlay."""
    results = [dict(c) for c in CANONICAL_CERTIFICATIONS]

    if career:
        canonical_career = resolve_canonical_career(career)
        if canonical_career:
            results = [c for c in results if c["career"].lower() == canonical_career.lower()]
        else:
            slug = to_slug(career)
            results = [c for c in results if c["career_slug"] == slug]

    if skill:
        sk_lower = skill.strip().lower()
        results = [c for c in results if any(s.lower() == sk_lower for s in c["skills"])]

    if level and level.lower() != "all":
        lvl_lower = level.strip().lower()
        results = [c for c in results if c["level"].lower() == lvl_lower]

    if search:
        q = search.strip().lower()
        results = [
            c for c in results
            if q in c["title"].lower()
            or q in c["provider"].lower()
            or any(q in s.lower() for s in c["skills"])
            or q in c["career"].lower()
        ]

    # Overlay user progress
    if user_id:
        db = get_db()
        progress_doc = await db.learning_progress.find_one({"user_id": user_id}) or {}
        user_certs = {c.get("cert_id"): c for c in progress_doc.get("certifications", [])}

        fav_docs = await db.favorites.find({"user_id": user_id, "item_type": "certification"}).to_list(100)
        fav_ids = {d["item_id"] for d in fav_docs}

        for c in results:
            c_prog = user_certs.get(c["id"])
            if c_prog:
                c["status"] = "completed" if c_prog.get("completed") else "in-progress"
                c["completed"] = c_prog.get("completed", False)
                c["completed_at"] = c_prog.get("completed_at")
            else:
                c["status"] = "not_started"
                c["completed"] = False
                c["completed_at"] = None

            c["is_favorite"] = c["id"] in fav_ids
    else:
        for c in results:
            c["status"] = "not_started"
            c["completed"] = False
            c["is_favorite"] = False

    return results


async def get_certification_by_id(cert_id: str, user_id: Optional[str] = None) -> Optional[dict[str, Any]]:
    """Retrieve a single certification by ID with user activity state."""
    c = CERTIFICATION_BY_ID.get(cert_id)
    if not c:
        db = get_db()
        try:
            doc = await db.certifications.find_one({"_id": ObjectId(cert_id)})
        except Exception:
            doc = await db.certifications.find_one({"_id": cert_id})
        if doc:
            doc["id"] = str(doc.get("_id"))
            c = doc

    if not c:
        return None

    item = dict(c)
    if user_id:
        db = get_db()
        progress_doc = await db.learning_progress.find_one({"user_id": user_id}) or {}
        user_certs = {x.get("cert_id"): x for x in progress_doc.get("certifications", [])}
        c_prog = user_certs.get(cert_id)

        if c_prog:
            item["status"] = "completed" if c_prog.get("completed") else "in-progress"
            item["completed"] = c_prog.get("completed", False)
        else:
            item["status"] = "not_started"
            item["completed"] = False

        fav = await db.favorites.find_one({"user_id": user_id, "item_type": "certification", "item_id": cert_id})
        item["is_favorite"] = fav is not None
    else:
        item["status"] = "not_started"
        item["completed"] = False
        item["is_favorite"] = False

    return item


async def get_recommended_certifications(
    user_id: str,
    career: Optional[str] = None,
) -> dict[str, Any]:
    """Generate categorized certification recommendations tailored to student gaps."""
    db = get_db()

    gap_data = await evaluate_skill_gap_for_user(user_id, career)
    target_role = gap_data.get("target_role") or "Software Engineer"
    missing_skills = gap_data.get("missing_skills", [])
    user_skills = {s["name"]: s["level"] for s in gap_data.get("current_skills", [])}

    progress_doc = await db.learning_progress.find_one({"user_id": user_id}) or {}
    completed_ids = {
        c.get("cert_id") for c in progress_doc.get("certifications", []) if c.get("completed")
    }
    in_progress_ids = {
        c.get("cert_id") for c in progress_doc.get("certifications", []) if not c.get("completed")
    }
    user_certs = {c.get("cert_id"): c for c in progress_doc.get("certifications", [])}

    fav_docs = await db.favorites.find({"user_id": user_id, "item_type": "certification"}).to_list(100)
    fav_ids = {d["item_id"] for d in fav_docs}

    scored_certs = []
    for c in CANONICAL_CERTIFICATIONS:
        c_copy = dict(c)
        c_id = c_copy["id"]
        is_completed = c_id in completed_ids
        score, matched_gaps, reason = calculate_cert_score(
            c_copy, target_role, missing_skills, user_skills, is_completed
        )

        c_copy["relevance_score"] = score
        c_copy["matched_gaps"] = matched_gaps
        c_copy["recommendation_reason"] = reason
        c_copy["completed"] = is_completed
        c_copy["is_favorite"] = c_id in fav_ids

        c_prog = user_certs.get(c_id)
        if c_prog:
            c_copy["status"] = "completed" if c_prog.get("completed") else "in-progress"
        else:
            c_copy["status"] = "not_started"

        scored_certs.append(c_copy)

    scored_certs.sort(key=lambda x: x["relevance_score"], reverse=True)

    incomplete_certs = [c for c in scored_certs if not c["completed"]]
    completed_list = [c for c in scored_certs if c["completed"]]

    recommended_for_career = [
        c for c in incomplete_certs if c["career"].lower() == target_role.lower()
    ]
    gap_builders = [
        c for c in incomplete_certs if len(c.get("matched_gaps", [])) > 0
    ]

    return {
        "target_role": target_role,
        "career_slug": to_slug(target_role),
        "total_certifications": len(CANONICAL_CERTIFICATIONS),
        "total_completed": len(completed_list),
        "total_in_progress": len(in_progress_ids),
        "recommended": incomplete_certs[:6],
        "recommended_for_career": recommended_for_career[:4],
        "gap_builders": gap_builders[:4],
        "completed": completed_list,
    }
