"""
Verification script for Phase 6:
Executes Cases A through G and executes the complete Data Quality Audit.
"""

import sys
import json
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.career_ontology import CareerOntologyService
from app.services.skill_gap_service import SkillGapService
from app.services.learning_recommendation_service import LearningRecommendationService
from app.services.roadmap_service import RoadmapService
from app.services.career_intelligence_service import CareerIntelligenceService
from app.services.project_catalog import ProjectCatalogService
from app.services.project_recommendation_service import ProjectRecommendationService
from app.services.model_service import ModelService

from app.schemas.career_intelligence import CareerIntelligenceRequest
from app.schemas.project_recommendation import ProjectRecommendationRequest

ModelService.get_instance().load_artifacts()
intel_service = CareerIntelligenceService()
catalog_service = ProjectCatalogService()
rec_service = ProjectRecommendationService(
    catalog_service=catalog_service,
    ontology_service=intel_service.ontology_service,
)

print("=" * 60)
print("PHASE 6 VERIFICATION CASES")
print("=" * 60)

# CASE A: python, ai, programming -> AI & Machine Learning Engineering
print("\n--- CASE A ---")
skills_a = ["python", "ai", "programming"]
intel_a = intel_service.evaluate(CareerIntelligenceRequest(skills=skills_a)).model_dump()
projs_a = rec_service.recommend_projects(ProjectRecommendationRequest(skills=skills_a)).model_dump()
print(f"Target Career: {intel_a['target_career_track']} (Source: {intel_a['target_source']})")
print(f"Prediction: {intel_a['prediction']['career_track']} ({intel_a['prediction']['probability']:.2f})")
print(f"Skill Coverage: {intel_a['required_skill_coverage']['percentage']:.1f}%")
print(f"Missing Skills: {len(intel_a['missing_required_skills'])} items")
print(f"Learning Recs: {len(intel_a['learning_recommendations'])} items")
print(f"Project Recs: {len(projs_a['projects'])} projects")
print(f"Top Project: {projs_a['projects'][0]['title']} (Score: {projs_a['projects'][0]['relevance_score']:.1f})")
assert intel_a['prediction']['career_track'] == "AI & Machine Learning Engineering"
assert projs_a['target_career_track'] == "AI & Machine Learning Engineering"
assert len(projs_a['projects']) > 0
print("✓ Case A Verified")

# CASE B: python, web_development, database_systems -> Software Development & Engineering
print("\n--- CASE B ---")
skills_b = ["python", "web_development", "database_systems"]
intel_b = intel_service.evaluate(CareerIntelligenceRequest(skills=skills_b)).model_dump()
projs_b = rec_service.recommend_projects(ProjectRecommendationRequest(skills=skills_b)).model_dump()
print(f"Target Career: {intel_b['target_career_track']}")
print(f"Prediction: {intel_b['prediction']['career_track']} ({intel_b['prediction']['probability']:.2f})")
print(f"Top Project: {projs_b['projects'][0]['title']} (Score: {projs_b['projects'][0]['relevance_score']:.1f})")
assert intel_b['prediction']['career_track'] == "Software Development & Engineering"
assert projs_b['target_career_track'] == "Software Development & Engineering"
assert projs_b['projects'][0]['project_id'] != projs_a['projects'][0]['project_id']
print("✓ Case B Verified (Projects differ from Case A)")

# CASE C: excel, communication, critical_thinking -> Data Analytics & Business Intelligence
print("\n--- CASE C ---")
skills_c = ["excel", "communication", "critical_thinking"]
intel_c = intel_service.evaluate(CareerIntelligenceRequest(skills=skills_c)).model_dump()
projs_c = rec_service.recommend_projects(ProjectRecommendationRequest(skills=skills_c)).model_dump()
print(f"Target Career: {intel_c['target_career_track']}")
print(f"Prediction: {intel_c['prediction']['career_track']} ({intel_c['prediction']['probability']:.2f})")
print(f"Top Project: {projs_c['projects'][0]['title']} (Score: {projs_c['projects'][0]['relevance_score']:.1f})")
assert intel_c['prediction']['career_track'] == "Data Analytics & Business Intelligence"
assert projs_c['target_career_track'] == "Data Analytics & Business Intelligence"
print("✓ Case C Verified (Analytics/BI projects recommended)")

# CASE D: unknown_skill_xyz, python
print("\n--- CASE D ---")
skills_d = ["unknown_skill_xyz", "python"]
intel_d = intel_service.evaluate(CareerIntelligenceRequest(skills=skills_d)).model_dump()
projs_d = rec_service.recommend_projects(ProjectRecommendationRequest(skills=skills_d)).model_dump()
print(f"Recognized Skills: {intel_d['recognized_skills']}")
print(f"Unknown Skills: {intel_d['unknown_skills']}")
assert "unknown_skill_xyz" in intel_d['unknown_skills']
assert "python" in intel_d['recognized_skills']
print("✓ Case D Verified (Unknown skill isolated, valid skill processed)")

# CASE E: Target Override (ML: AI & ML -> Target Override: SDE)
print("\n--- CASE E ---")
skills_e = ["python", "ai", "programming"]
override_track = "Software Development & Engineering"
intel_e = intel_service.evaluate(CareerIntelligenceRequest(skills=skills_e, target_career_track=override_track)).model_dump()
projs_e = rec_service.recommend_projects(ProjectRecommendationRequest(skills=skills_e, target_career_track=override_track)).model_dump()
print(f"ML Model Prediction: {intel_e['prediction']['career_track']} (Unchanged)")
print(f"Active Target Track: {intel_e['target_career_track']} (User Override)")
print(f"Project Target Track: {projs_e['target_career_track']} (User Selected)")
assert intel_e['prediction']['career_track'] == "AI & Machine Learning Engineering"
assert intel_e['target_career_track'] == override_track
assert intel_e['target_source'] == "user_selected"
assert projs_e['target_career_track'] == override_track
assert projs_e['target_source'] == "user_selected"
print("✓ Case E Verified (ML prediction intact, target override active)")

# DATA QUALITY AUDIT
print("\n" + "=" * 60)
print("DATA QUALITY AUDIT")
print("=" * 60)

model_svc = ModelService.get_instance()
model_svc.load_artifacts()
vocab = set(model_svc.canonical_vocabulary)
supported_tracks = set(model_svc.classes_)

catalog = catalog_service.get_all_projects()
project_ids = set()
duplicate_ids = []
invalid_skills = []
missing_metadata = []
placeholder_urls = []
track_mismatches = []

for p in catalog:
    # 1. Duplicate check
    if p.project_id in project_ids:
        duplicate_ids.append(p.project_id)
    project_ids.add(p.project_id)

    # 2. Track check
    if p.career_track not in supported_tracks:
        track_mismatches.append((p.project_id, p.career_track))

    # 3. Canonical skills check
    for sk in p.skills_demonstrated:
        if sk not in vocab:
            invalid_skills.append((p.project_id, "demonstrated", sk))
    for sk in p.skills_targeted:
        if sk not in vocab:
            invalid_skills.append((p.project_id, "targeted", sk))
    for sk in p.prerequisites:
        if sk not in vocab:
            invalid_skills.append((p.project_id, "prereq", sk))

    # 4. Metadata completeness
    if not p.project_id or not p.title or not p.description or not p.suggested_evidence or not p.suggested_deliverables:
        missing_metadata.append(p.project_id)

# Audit learning resources
from app.services.learning_recommendation_service import CURATED_RESOURCE_CATALOG
for skill_token, res_list in CURATED_RESOURCE_CATALOG.items():
    if skill_token not in vocab:
        invalid_skills.append(("catalog_key", "learning_skill", skill_token))
    for r in res_list:
        url = r.get("url")
        res_id = r.get("resource_id")
        if url and ("example.com" in url or "placeholder" in url):
            placeholder_urls.append((res_id, url))

print(f"Total Projects in Catalog: {len(catalog)}")
print(f"Duplicate Project IDs: {len(duplicate_ids)} -> {duplicate_ids}")
print(f"Invalid Skill IDs: {len(invalid_skills)} -> {invalid_skills}")
print(f"Missing Project Metadata: {len(missing_metadata)} -> {missing_metadata}")
print(f"Placeholder URLs: {len(placeholder_urls)} -> {placeholder_urls}")
print(f"Career Track Mismatches: {len(track_mismatches)} -> {track_mismatches}")

assert len(duplicate_ids) == 0, "Duplicate project IDs found"
assert len(invalid_skills) == 0, "Invalid skills found"
assert len(missing_metadata) == 0, "Missing metadata found"
assert len(placeholder_urls) == 0, "Placeholder URLs found"
assert len(track_mismatches) == 0, "Track mismatches found"

print("\n" + "=" * 60)
print("AUDIT RESULT: 100% CLEAN. ZERO DEFECTS DETECTED.")
print("=" * 60)
