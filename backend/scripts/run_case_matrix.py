"""
Verification script for Phase 7 Manual Test Matrix (Cases A - F and J).
"""

import sys
from pathlib import Path

# Add backend directory to sys.path
_BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from fastapi.testclient import TestClient
from app.main import app
from app.services.model_service import ModelService

def run_matrix():
    print("=" * 60)
    print("PHASE 7 MANUAL TEST MATRIX EXECUTION")
    print("=" * 60)

    with TestClient(app) as client:
        # CASE A: python + ai + programming -> Expected: AI/ML prediction
        print("\n[CASE A] python + ai + programming")
        res_a = client.post("/api/v1/predictions/career", json={"skills": ["python", "ai", "programming"]})
        assert res_a.status_code == 200, f"Case A failed: {res_a.status_code}"
        data_a = res_a.json()
        print(f"  Top prediction: {data_a['prediction']['career_track']} (p={data_a['prediction']['probability']:.4f})")
        assert "AI & Machine Learning" in data_a["prediction"]["career_track"], "Case A must predict AI/ML"
        print("  ✓ PASS: Case A predicted AI & Machine Learning Engineering")

        # CASE B: python + web_development + database_systems -> Expected: SDE prediction
        print("\n[CASE B] python + web_development + database_systems")
        res_b = client.post("/api/v1/predictions/career", json={"skills": ["python", "web_development", "database_systems"]})
        assert res_b.status_code == 200, f"Case B failed: {res_b.status_code}"
        data_b = res_b.json()
        print(f"  Top prediction: {data_b['prediction']['career_track']} (p={data_b['prediction']['probability']:.4f})")
        assert "Software Development" in data_b["prediction"]["career_track"], "Case B must predict SDE"
        print("  ✓ PASS: Case B predicted Software Development & Engineering")

        # CASE C: excel + communication + critical_thinking -> Expected: Data/BI prediction
        print("\n[CASE C] excel + communication + critical_thinking")
        res_c = client.post("/api/v1/predictions/career", json={"skills": ["excel", "communication", "critical_thinking"]})
        assert res_c.status_code == 200, f"Case C failed: {res_c.status_code}"
        data_c = res_c.json()
        print(f"  Top prediction: {data_c['prediction']['career_track']} (p={data_c['prediction']['probability']:.4f})")
        assert "Data Analytics" in data_c["prediction"]["career_track"], "Case C must predict Data/BI"
        print("  ✓ PASS: Case C predicted Data Analytics & Business Intelligence")

        # CASE D: unknown_skill_xyz + python -> Expected: unknown skill warning + real prediction
        print("\n[CASE D] unknown_skill_xyz + python")
        res_d = client.post("/api/v1/predictions/career", json={"skills": ["unknown_skill_xyz", "python"]})
        assert res_d.status_code == 200, f"Case D failed: {res_d.status_code}"
        data_d = res_d.json()
        unknowns = data_d["input"]["unknown_skills"]
        recognized = data_d["input"]["recognized_skills"]
        print(f"  Recognized: {recognized}, Unknown: {unknowns}")
        assert "unknown_skill_xyz" in unknowns, "unknown_skill_xyz must be reported in unknown_skills"
        assert "python" in recognized, "python must be recognized"
        assert data_d["prediction"]["career_track"] is not None, "Real prediction must still be returned"
        print(f"  Top prediction: {data_d['prediction']['career_track']}")
        print("  ✓ PASS: Case D reported unknown skill and delivered real prediction")

        # CASE E: empty skills -> Expected: validation error
        print("\n[CASE E] empty skills")
        res_e = client.post("/api/v1/predictions/career", json={"skills": []})
        assert res_e.status_code == 422, f"Case E must return 422, got {res_e.status_code}"
        print(f"  Status code: {res_e.status_code}, Detail: {res_e.json().get('detail')}")
        print("  ✓ PASS: Case E cleanly rejected empty skills with 422")

        # CASE F: AI/ML prediction + SDE manual target override -> Expected: prediction remains AI/ML, planning target becomes SDE
        print("\n[CASE F] AI/ML prediction + SDE manual target override")
        res_f = client.post(
            "/api/v1/career/intelligence",
            json={
                "skills": ["python", "ai", "programming"],
                "target_career_track": "Software Development & Engineering"
            }
        )
        assert res_f.status_code == 200, f"Case F failed: {res_f.status_code}"
        data_f = res_f.json()
        ml_pred = data_f["prediction"]["career_track"]
        target_track = data_f["target_career_track"]
        target_src = data_f["target_source"]
        print(f"  Model Prediction: {ml_pred}")
        print(f"  Planning Target:  {target_track} (source: {target_src})")
        assert "AI & Machine Learning" in ml_pred, "Model prediction must remain AI/ML"
        assert "Software Development" in target_track, "Target track must be SDE override"
        assert target_src == "user_selected", "Target source must be user_selected"
        print("  ✓ PASS: Case F maintained independent ML prediction and user override target")

        # CASE J: restart backend -> model reloads correctly and API becomes ready
        print("\n[CASE J] restart backend (reset singleton and re-verify readiness)")
        ModelService.reset_instance()
        # Before load, readiness is false or unready
        svc = ModelService.get_instance()
        assert not svc.is_ready()
        # Now simulate startup load
        svc.load_artifacts()
        assert svc.is_ready()
        ready_res = client.get("/api/v1/ready")
        assert ready_res.status_code == 200
        assert ready_res.json()["status"] == "ready"
        print(f"  Readiness response: {ready_res.json()}")
        print("  ✓ PASS: Case J model reload lifecycle verified")

    print("\nALL BACKEND MATRIX CASES PASSED!")
    print("=" * 60)

if __name__ == "__main__":
    run_matrix()
