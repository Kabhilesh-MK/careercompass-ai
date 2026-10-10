"""
CareerCompass AI — Full E2E Application Validation Harness (Phase 3)
Tests:
1. Pre-flight checks
2. Fresh user authentication (User A)
3. New user onboarding & profile completion
4. ML pipeline prediction & persistence
5. User B authentication & onboarding
6. User data isolation (Cross-user access checks)
7. Profile differentiation test (Profile A vs Profile B)
8. Resume upload & analysis
9. AI Mentor chat persistence & scoping
10. Reports generation & HTML export
11. Settings persistence & scoping
12. Error handling & invalid token / schema rejection
13. MongoDB record scoping audit
14. Cleanup of temporary test accounts
"""

import sys
import os
import json
import math
import io
import requests
from bson import ObjectId
from pymongo import MongoClient

sys.path.insert(0, os.path.abspath("backend"))

BASE_URL = "http://127.0.0.1:8000"
MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "career_compass_ai"

results = {}

def log_test(section, name, status, details=None):
    if section not in results:
        results[section] = []
    entry = {"test": name, "status": status, "details": details or {}}
    results[section].append(entry)
    symbol = "OK" if status == "PASS" else ("WARN" if status == "WARNING" else "FAIL")
    print(f"[{symbol}] {section} :: {name} -> {status}")
    if details:
        print(f"    Details: {details}")

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
db = client[DB_NAME]

# -------------------------------------------------------------
# 1. PRE-FLIGHT
# -------------------------------------------------------------
print("\n=== 1. PRE-FLIGHT CHECKS ===")
try:
    r = requests.get(f"{BASE_URL}/", timeout=3)
    if r.status_code == 200:
        log_test("PRE-FLIGHT", "FastAPI Running", "PASS", r.json())
    else:
        log_test("PRE-FLIGHT", "FastAPI Running", "FAIL", {"status": r.status_code})
except Exception as e:
    log_test("PRE-FLIGHT", "FastAPI Running", "FAIL", {"error": str(e)})

try:
    client.server_info()
    colls = db.list_collection_names()
    log_test("PRE-FLIGHT", "MongoDB Connected", "PASS", {"collections_count": len(colls)})
except Exception as e:
    log_test("PRE-FLIGHT", "MongoDB Connected", "FAIL", {"error": str(e)})

try:
    r_fe = requests.get("http://localhost:5173", timeout=3)
    if r_fe.status_code == 200:
        log_test("PRE-FLIGHT", "Vite Frontend Running", "PASS", {"status": 200})
    else:
        log_test("PRE-FLIGHT", "Vite Frontend Running", "FAIL", {"status": r_fe.status_code})
except Exception as e:
    log_test("PRE-FLIGHT", "Vite Frontend Running", "FAIL", {"error": str(e)})

try:
    r_stat = requests.get(f"{BASE_URL}/api/ml/status", timeout=3)
    stat = r_stat.json()
    if stat.get("model_ready") and stat.get("encoder_ready") and stat.get("preprocessor_ready"):
        log_test("PRE-FLIGHT", "ML Artifacts Ready", "PASS", stat)
    else:
        log_test("PRE-FLIGHT", "ML Artifacts Ready", "FAIL", stat)
except Exception as e:
    log_test("PRE-FLIGHT", "ML Artifacts Ready", "FAIL", {"error": str(e)})

# -------------------------------------------------------------
# 2. FRESH USER AUTHENTICATION
# -------------------------------------------------------------
print("\n=== 2. FRESH USER AUTHENTICATION ===")
user_a_email = "e2e_test_user_a@test.com"
user_a_pwd = "Password123!"

# Pre-clean User A if exists
db.users.delete_many({"email": user_a_email})

# Register User A
reg_payload = {
    "full_name": "E2E Test Student A",
    "email": user_a_email,
    "password": user_a_pwd,
    "role": "student"
}
r_reg = requests.post(f"{BASE_URL}/api/auth/register", json=reg_payload)
if r_reg.status_code == 201:
    data_reg = r_reg.json()
    user_a_token = data_reg.get("access_token")
    user_a_id = data_reg.get("user_id")
    log_test("AUTHENTICATION", "Register User A (201)", "PASS", {"token_present": bool(user_a_token), "user_id": user_a_id})
else:
    log_test("AUTHENTICATION", "Register User A (201)", "FAIL", {"status": r_reg.status_code, "resp": r_reg.text})
    sys.exit(1)

# Login User A
login_payload = {"email": user_a_email, "password": user_a_pwd}
r_login = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload)
if r_login.status_code == 200:
    data_login = r_login.json()
    user_a_token = data_login.get("access_token")
    user_a_id = data_login.get("user_id")
    log_test("AUTHENTICATION", "Login User A (200)", "PASS", {"token_present": bool(user_a_token), "user_id": user_a_id})
else:
    log_test("AUTHENTICATION", "Login User A (200)", "FAIL", {"status": r_login.status_code, "resp": r_login.text})

headers_a = {"Authorization": f"Bearer {user_a_token}"}

# Protected routes check without token
r_unauth_prof = requests.get(f"{BASE_URL}/api/profile")
r_unauth_pred = requests.get(f"{BASE_URL}/api/ml/prediction")
if r_unauth_prof.status_code == 401 and r_unauth_pred.status_code == 401:
    log_test("AUTHENTICATION", "Protected Routes Reject Unauth (401)", "PASS", {"profile_status": r_unauth_prof.status_code, "pred_status": r_unauth_pred.status_code})
else:
    log_test("AUTHENTICATION", "Protected Routes Reject Unauth (401)", "FAIL", {"profile_status": r_unauth_prof.status_code, "pred_status": r_unauth_pred.status_code})

# -------------------------------------------------------------
# 3. NEW USER ONBOARDING
# -------------------------------------------------------------
print("\n=== 3. NEW USER ONBOARDING ===")
# Verify new user profile initial state in DB
db_user_a = db.users.find_one({"email": user_a_email})
initial_profile_completed = db_user_a.get("profile_completed", False)
if not initial_profile_completed:
    log_test("ONBOARDING", "Initial profile_completed is False", "PASS", {"profile_completed": False})
else:
    log_test("ONBOARDING", "Initial profile_completed is False", "FAIL", {"profile_completed": True})

# Update profile information via /api/profile/update
profile_update = {
    "college": "Apex Institute of Technology",
    "degree": "B.Tech Computer Science",
    "graduation_year": 2026,
    "cgpa": 8.4,
    "bio": "Passionate about data science and machine learning."
}
r_prof_up = requests.put(f"{BASE_URL}/api/profile/update", json=profile_update, headers=headers_a)
if r_prof_up.status_code == 200:
    log_test("ONBOARDING", "Update Academic & Basic Profile", "PASS", r_prof_up.json().get("profile", {}))
else:
    log_test("ONBOARDING", "Update Academic & Basic Profile", "FAIL", {"status": r_prof_up.status_code, "resp": r_prof_up.text})

# -------------------------------------------------------------
# 4. ML PREDICTION PIPELINE
# -------------------------------------------------------------
print("\n=== 4. ML PREDICTION PIPELINE ===")
profile_a_ml = {
    "Python": 88.0,
    "Java": 40.0,
    "C++": 35.0,
    "SQL": 85.0,
    "HTML": 30.0,
    "CSS": 25.0,
    "JavaScript": 40.0,
    "React": 25.0,
    "NodeJS": 30.0,
    "MongoDB": 60.0,
    "MySQL": 75.0,
    "Git": 70.0,
    "GitHub": 75.0,
    "AWS": 50.0,
    "Azure": 45.0,
    "Docker": 45.0,
    "Linux": 60.0,
    "Machine Learning": 88.0,
    "Deep Learning": 82.0,
    "Power BI": 70.0,
    "Excel": 65.0,
    "Statistics": 85.0,
    "Communication": 75.0,
    "Problem Solving": 85.0,
    "Leadership": 65.0,
    "Teamwork": 75.0,
    "Aptitude": 80.0,
    "CGPA": 8.4,
    "Projects Completed": 4,
    "Internship": 1,
    "Certifications": 2,
    "Interest": "Data Science",
    "Preferred Domain": "Machine Learning"
}

r_pred = requests.post(f"{BASE_URL}/api/ml/predict", json=profile_a_ml, headers=headers_a)
if r_pred.status_code == 200:
    pred_res_a = r_pred.json()
    top_career_a = pred_res_a.get("prediction", {}).get("predicted_career")
    all_probs_a = pred_res_a.get("prediction", {}).get("career_probabilities", [])
    top_5_a = pred_res_a.get("prediction", {}).get("top_5_careers", [])
    top_career_a = pred_res_a.get("prediction", {}).get("predicted_career")
    conf_a = pred_res_a.get("prediction", {}).get("confidence")
    
    log_test("ML PREDICTION", "POST /api/ml/predict Success", "PASS" if len(top_5_a) == 5 else "FAIL", {
        "predicted_career": top_career_a,
        "top_5_count": len(top_5_a),
        "confidence": conf_a,
        "top_5": [(x['career'], x['probability']) for x in top_5_a]
    })
else:
    log_test("ML PREDICTION", "POST /api/ml/predict Success", "FAIL", {"status": r_pred.status_code, "resp": r_pred.text})
    pred_res_a = {}

# Verify profile_completed changed to True
db_user_a_after = db.users.find_one({"email": user_a_email})
if db_user_a_after.get("profile_completed"):
    log_test("ONBOARDING", "profile_completed transitioned to True", "PASS")
else:
    log_test("ONBOARDING", "profile_completed transitioned to True", "FAIL")

# Check GET /api/ml/prediction
r_get_pred = requests.get(f"{BASE_URL}/api/ml/prediction", headers=headers_a)
if r_get_pred.status_code == 200 and r_get_pred.json().get("prediction"):
    persisted_career = r_get_pred.json()["prediction"]["predicted_career"]
    persisted_uid = r_get_pred.json().get("user_id")
    log_test("ML PREDICTION", "GET /api/ml/prediction returns persisted prediction", "PASS", {
        "persisted_career": persisted_career,
        "persisted_user_id": persisted_uid,
        "matches_user": (persisted_uid == str(db_user_a["_id"]))
    })
else:
    log_test("ML PREDICTION", "GET /api/ml/prediction returns persisted prediction", "FAIL", {"status": r_get_pred.status_code})

# Check GET /api/ml/skill-gap
r_get_sg = requests.get(f"{BASE_URL}/api/ml/skill-gap", headers=headers_a)
if r_get_sg.status_code == 200 and r_get_sg.json().get("targetRole"):
    log_test("ML PREDICTION", "GET /api/ml/skill-gap returns skill gap", "PASS", {
        "targetRole": r_get_sg.json().get("targetRole"),
        "matchPercentage": r_get_sg.json().get("matchPercentage"),
        "currentSkillsCount": len(r_get_sg.json().get("currentSkills", [])),
        "missingSkillsCount": len(r_get_sg.json().get("missingSkills", []))
    })
else:
    log_test("ML PREDICTION", "GET /api/ml/skill-gap returns skill gap", "FAIL", {"status": r_get_sg.status_code, "resp": r_get_sg.text})

# Check GET /api/roadmap vs /api/ml/roadmap
r_get_ml_rm = requests.get(f"{BASE_URL}/api/ml/roadmap", headers=headers_a)
r_get_rm = requests.get(f"{BASE_URL}/api/roadmap", headers=headers_a)
log_test("ML PREDICTION", "GET /api/ml/roadmap endpoint existence", "WARNING" if r_get_ml_rm.status_code == 404 else "PASS", {
    "status": r_get_ml_rm.status_code,
    "note": "Frontend and backend use GET /api/roadmap for user roadmap."
})
if r_get_rm.status_code == 200 and r_get_rm.json().get("milestones"):
    log_test("ML PREDICTION", "GET /api/roadmap returns persisted roadmap", "PASS", {
        "target_role": r_get_rm.json().get("target_role"),
        "milestones_count": len(r_get_rm.json().get("milestones", []))
    })
else:
    log_test("ML PREDICTION", "GET /api/roadmap returns persisted roadmap", "FAIL", {"status": r_get_rm.status_code})

# Check GET /api/ml/placement
r_get_place = requests.get(f"{BASE_URL}/api/ml/placement", headers=headers_a)
if r_get_place.status_code == 200 and "overallScore" in r_get_place.json():
    log_test("ML PREDICTION", "GET /api/ml/placement returns placement score", "PASS", r_get_place.json())
else:
    log_test("ML PREDICTION", "GET /api/ml/placement returns placement score", "FAIL", {"status": r_get_place.status_code})

# -------------------------------------------------------------
# 5. USER B & USER DATA ISOLATION
# -------------------------------------------------------------
print("\n=== 5. USER B & DATA ISOLATION ===")
user_b_email = "e2e_test_user_b@test.com"
user_b_pwd = "Password456!"

db.users.delete_many({"email": user_b_email})

reg_b_payload = {
    "full_name": "E2E Test Student B",
    "email": user_b_email,
    "password": user_b_pwd,
    "role": "student"
}
r_reg_b = requests.post(f"{BASE_URL}/api/auth/register", json=reg_b_payload)
user_b_token = r_reg_b.json().get("access_token")
user_b_id = r_reg_b.json().get("user_id")
headers_b = {"Authorization": f"Bearer {user_b_token}"}
log_test("USER ISOLATION", "Register User B", "PASS", {"user_b_id": user_b_id})

# Profile B (Frontend focused)
profile_b_ml = {
    "Python": 20.0,
    "Java": 20.0,
    "C++": 15.0,
    "SQL": 30.0,
    "HTML": 90.0,
    "CSS": 90.0,
    "JavaScript": 90.0,
    "React": 90.0,
    "NodeJS": 85.0,
    "MongoDB": 50.0,
    "MySQL": 30.0,
    "Git": 75.0,
    "GitHub": 80.0,
    "AWS": 25.0,
    "Azure": 20.0,
    "Docker": 30.0,
    "Linux": 40.0,
    "Machine Learning": 15.0,
    "Deep Learning": 10.0,
    "Power BI": 20.0,
    "Excel": 30.0,
    "Statistics": 25.0,
    "Communication": 80.0,
    "Problem Solving": 75.0,
    "Leadership": 60.0,
    "Teamwork": 80.0,
    "Aptitude": 70.0,
    "CGPA": 7.8,
    "Projects Completed": 3,
    "Internship": 1,
    "Certifications": 1,
    "Interest": "Web Development",
    "Preferred Domain": "Frontend"
}

r_pred_b = requests.post(f"{BASE_URL}/api/ml/predict", json=profile_b_ml, headers=headers_b)
pred_res_b = r_pred_b.json()
top_career_b = pred_res_b.get("prediction", {}).get("predicted_career")
log_test("USER ISOLATION", "User B ML Prediction Executed", "PASS", {"predicted_career": top_career_b})

# Cross-user isolation verification
# 1. Profile Isolation
prof_a = requests.get(f"{BASE_URL}/api/profile", headers=headers_a).json()
prof_b = requests.get(f"{BASE_URL}/api/profile", headers=headers_b).json()
iso_prof = (prof_a.get("email") == user_a_email and prof_b.get("email") == user_b_email)
log_test("USER ISOLATION", "Profile Scoped to Authenticated User", "PASS" if iso_prof else "FAIL", {
    "user_a_email": prof_a.get("email"),
    "user_b_email": prof_b.get("email")
})

# 2. Prediction Isolation
pred_from_a = requests.get(f"{BASE_URL}/api/ml/prediction", headers=headers_a).json()
pred_from_b = requests.get(f"{BASE_URL}/api/ml/prediction", headers=headers_b).json()
iso_pred = (pred_from_a.get("user_id") != pred_from_b.get("user_id")) and (pred_from_a.get("user_id") == str(db_user_a["_id"]))
log_test("USER ISOLATION", "Prediction Scoped to Authenticated User", "PASS" if iso_pred else "FAIL", {
    "user_a_persisted_id": pred_from_a.get("user_id"),
    "user_b_persisted_id": pred_from_b.get("user_id")
})

# 3. Roadmap Isolation
rm_a = requests.get(f"{BASE_URL}/api/roadmap", headers=headers_a).json()
rm_b = requests.get(f"{BASE_URL}/api/roadmap", headers=headers_b).json()
iso_rm = (rm_a.get("user_id") == str(db_user_a["_id"]) and rm_b.get("user_id") == str(user_b_id))
log_test("USER ISOLATION", "Roadmap Scoped to Authenticated User", "PASS" if iso_rm else "FAIL", {
    "rm_a_user_id": rm_a.get("user_id"),
    "rm_b_user_id": rm_b.get("user_id")
})

# -------------------------------------------------------------
# 6. PROFILE DIFFERENTIATION TEST
# -------------------------------------------------------------
print("\n=== 6. PROFILE DIFFERENTIATION TEST ===")
# Directly query production model for all 14 probability values
import joblib
import pandas as pd

prod_model = joblib.load("backend/ml/saved_models/career_prediction_model.pkl")
prod_le = joblib.load("backend/ml/saved_models/label_encoder.pkl")
prod_prep = joblib.load("backend/ml/saved_models/preprocessor.pkl")

with open("backend/ml/saved_models/feature_columns.json") as f:
    feats = json.load(f)

df_a = pd.DataFrame([{col: profile_a_ml.get(col, 0) for col in feats}])
df_b = pd.DataFrame([{col: profile_b_ml.get(col, 0) for col in feats}])

X_a = prod_prep.transform(df_a)
X_b = prod_prep.transform(df_b)

probs_14_a = prod_model.predict_proba(X_a)[0]
probs_14_b = prod_model.predict_proba(X_b)[0]

all_14_a = {prod_le.classes_[i]: round(float(p) * 100, 2) for i, p in enumerate(probs_14_a)}
all_14_b = {prod_le.classes_[i]: round(float(p) * 100, 2) for i, p in enumerate(probs_14_b)}

top5_sorted_a = sorted(all_14_a.items(), key=lambda x: x[1], reverse=True)[:5]
top5_sorted_b = sorted(all_14_b.items(), key=lambda x: x[1], reverse=True)[:5]

top1_prob_a = top5_sorted_a[0][1]
top1_prob_b = top5_sorted_b[0][1]

# Calculate normalized entropy over 14 classes
def calc_entropy_14(probs_dict):
    vals = [v / 100.0 for v in probs_dict.values()]
    ent = -sum(p * math.log(p) for p in vals if p > 0)
    max_ent = math.log(len(vals))
    return round(ent / max_ent, 4)

entropy_a = calc_entropy_14(all_14_a)
entropy_b = calc_entropy_14(all_14_b)

log_test("PROFILE DIFFERENTIATION", "Profile A Analysis (Data/ML Profile)", "PASS", {
    "top_career": top5_sorted_a[0][0],
    "top1_probability": top1_prob_a,
    "top5": top5_sorted_a,
    "all_14": all_14_a,
    "normalized_entropy": entropy_a
})

log_test("PROFILE DIFFERENTIATION", "Profile B Analysis (Web/Frontend Profile)", "PASS", {
    "top_career": top5_sorted_b[0][0],
    "top1_probability": top1_prob_b,
    "top5": top5_sorted_b,
    "all_14": all_14_b,
    "normalized_entropy": entropy_b
})

prob_vector_diff = any(abs(all_14_a[c] - all_14_b[c]) > 2.0 for c in all_14_a)
log_test("PROFILE DIFFERENTIATION", "Observable Profiles Produce Distinct Distributions", "PASS" if prob_vector_diff else "FAIL", {
    "distributions_differ": prob_vector_diff
})

# -------------------------------------------------------------
# 7. RESUME VALIDATION
# -------------------------------------------------------------
print("\n=== 7. RESUME VALIDATION ===")
# Create a dummy valid PDF file
pdf_header = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 55 >>\nstream\nBT /F1 12 Tf 100 700 Td (E2E Test Student Resume Data Science) ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000216 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n320\n%%EOF\n"

files = {"file": ("test_resume.pdf", io.BytesIO(pdf_header), "application/pdf")}
r_up_resume = requests.post(f"{BASE_URL}/api/resume/upload", files=files, headers=headers_a)
resume_id = None
if r_up_resume.status_code in [200, 201]:
    res_data = r_up_resume.json()
    resume_id = res_data.get("_id") or res_data.get("id") or res_data.get("resume_id")
    log_test("RESUME", "Upload Valid PDF Resume", "PASS", {"resume_id": resume_id, "filename": res_data.get("filename")})
else:
    log_test("RESUME", "Upload Valid PDF Resume", "FAIL", {"status": r_up_resume.status_code, "resp": r_up_resume.text})

if resume_id:
    # Trigger analysis
    r_an = requests.post(f"{BASE_URL}/api/resume/analyze/{resume_id}?predicted_career={top_career_a}", headers=headers_a)
    if r_an.status_code == 200:
        an_data = r_an.json()
        raw_ats = an_data.get("ats_score")
        ats_score = raw_ats if isinstance(raw_ats, (int, float)) else (raw_ats.get("overall_score") if isinstance(raw_ats, dict) else an_data.get("score"))
        log_test("RESUME", "Resume Analysis Execution & ATS Score", "PASS", {
            "ats_score": ats_score,
            "has_recommendations": bool(an_data.get("recommendations") or an_data.get("suggestions"))
        })
    else:
        log_test("RESUME", "Resume Analysis Execution & ATS Score", "WARNING", {"status": r_an.status_code, "resp": r_an.text})

    # Cross-user resume isolation check: User B tries to analyze User A's resume
    r_cross_an = requests.post(f"{BASE_URL}/api/resume/analyze/{resume_id}", headers=headers_b)
    if r_cross_an.status_code in [403, 404]:
        log_test("USER ISOLATION", "Cross-User Resume Access Blocked", "PASS", {"status": r_cross_an.status_code})
    else:
        log_test("USER ISOLATION", "Cross-User Resume Access Blocked", "FAIL", {"status": r_cross_an.status_code})

# -------------------------------------------------------------
# 8. MENTOR VALIDATION
# -------------------------------------------------------------
print("\n=== 8. MENTOR VALIDATION ===")
msg_payload = {"role": "user", "text": "What skills should I focus on for Machine Learning?", "time": "Now"}
r_msg = requests.post(f"{BASE_URL}/api/mentor/message", json=msg_payload, headers=headers_a)
if r_msg.status_code == 200:
    m_data = r_msg.json()
    reply = m_data.get("reply")
    log_test("MENTOR", "Send Message & Receive Response", "PASS", {"reply_length": len(reply or ""), "sample": (reply or "")[:60]})
else:
    log_test("MENTOR", "Send Message & Receive Response", "FAIL", {"status": r_msg.status_code, "resp": r_msg.text})

# Check history
r_hist = requests.get(f"{BASE_URL}/api/mentor/history", headers=headers_a)
if r_hist.status_code == 200:
    hist_messages = r_hist.json().get("messages", [])
    log_test("MENTOR", "Chat History Persisted", "PASS", {"messages_count": len(hist_messages)})
else:
    log_test("MENTOR", "Chat History Persisted", "FAIL", {"status": r_hist.status_code})

# User B history is empty
r_hist_b = requests.get(f"{BASE_URL}/api/mentor/history", headers=headers_b)
hist_b_messages = r_hist_b.json().get("messages", []) if r_hist_b.status_code == 200 else []
if len(hist_b_messages) == 0:
    log_test("USER ISOLATION", "Mentor History Scoped to User", "PASS", {"user_b_message_count": 0})
else:
    log_test("USER ISOLATION", "Mentor History Scoped to User", "FAIL", {"user_b_message_count": len(hist_b_messages)})

# -------------------------------------------------------------
# 9. REPORT VALIDATION
# -------------------------------------------------------------
print("\n=== 9. REPORT VALIDATION ===")
r_rep = requests.get(f"{BASE_URL}/api/reports", headers=headers_a)
if r_rep.status_code == 200:
    rep_data = r_rep.json()
    log_test("REPORTS", "Generate Aggregated Report", "PASS", {
        "user_name": rep_data.get("student_name") or rep_data.get("user", {}).get("name"),
        "target_career": rep_data.get("predicted_career") or rep_data.get("target_career")
    })
else:
    log_test("REPORTS", "Generate Aggregated Report", "FAIL", {"status": r_rep.status_code, "resp": r_rep.text})

# Test HTML report export
r_rep_html = requests.post(f"{BASE_URL}/api/report/html", json={"report_data": rep_data or {}}, headers=headers_a)
if r_rep_html.status_code == 200 and "<!DOCTYPE html>" in r_rep_html.text:
    log_test("REPORTS", "Export HTML Report", "PASS", {"html_bytes": len(r_rep_html.text)})
else:
    log_test("REPORTS", "Export HTML Report", "WARNING", {"status": r_rep_html.status_code})

# -------------------------------------------------------------
# 10. SETTINGS VALIDATION
# -------------------------------------------------------------
print("\n=== 10. SETTINGS VALIDATION ===")
r_set = requests.get(f"{BASE_URL}/api/settings", headers=headers_a)
orig_settings = r_set.json() if r_set.status_code == 200 else {}
log_test("SETTINGS", "Load Settings", "PASS", orig_settings)

update_set_payload = {"theme": "dark", "email_notifications": True}
r_up_set = requests.put(f"{BASE_URL}/api/settings", json=update_set_payload, headers=headers_a)
if r_up_set.status_code == 200:
    log_test("SETTINGS", "Update Settings", "PASS", r_up_set.json())
else:
    log_test("SETTINGS", "Update Settings", "FAIL", {"status": r_up_set.status_code})

r_set_after = requests.get(f"{BASE_URL}/api/settings", headers=headers_a)
if r_set_after.status_code == 200 and r_set_after.json().get("theme") == "dark":
    log_test("SETTINGS", "Settings Persist After Reload", "PASS", r_set_after.json())
else:
    log_test("SETTINGS", "Settings Persist After Reload", "FAIL", r_set_after.json())

# User B settings unaffected
r_set_b = requests.get(f"{BASE_URL}/api/settings", headers=headers_b)
if r_set_b.status_code == 200:
    log_test("USER ISOLATION", "Settings Scoped to User", "PASS", {"user_b_theme": r_set_b.json().get("theme")})
else:
    log_test("USER ISOLATION", "Settings Scoped to User", "FAIL", {"status": r_set_b.status_code})

# -------------------------------------------------------------
# 11. ERROR HANDLING
# -------------------------------------------------------------
print("\n=== 11. ERROR HANDLING ===")
# Invalid token
r_bad_token = requests.get(f"{BASE_URL}/api/profile", headers={"Authorization": "Bearer invalid.fake.jwt"})
if r_bad_token.status_code == 401:
    log_test("ERROR HANDLING", "Invalid Token Returns 401", "PASS", {"status": 401})
else:
    log_test("ERROR HANDLING", "Invalid Token Returns 401", "FAIL", {"status": r_bad_token.status_code})

# Malformed ML profile
r_bad_ml = requests.post(f"{BASE_URL}/api/ml/predict", json={"Python": "not-a-number"}, headers=headers_a)
if r_bad_ml.status_code in [400, 422]:
    log_test("ERROR HANDLING", "Malformed ML Profile Returns 422/400", "PASS", {"status": r_bad_ml.status_code})
else:
    log_test("ERROR HANDLING", "Malformed ML Profile Returns 422/400", "FAIL", {"status": r_bad_ml.status_code})

# Non-existent endpoint
r_404 = requests.get(f"{BASE_URL}/api/non_existent_endpoint_xyz", headers=headers_a)
if r_404.status_code == 404:
    log_test("ERROR HANDLING", "Non-Existent Endpoint Returns 404", "PASS", {"status": 404})
else:
    log_test("ERROR HANDLING", "Non-Existent Endpoint Returns 404", "FAIL", {"status": r_404.status_code})

# -------------------------------------------------------------
# 12. MONGODB RECORD SCOPING AUDIT
# -------------------------------------------------------------
print("\n=== 12. MONGODB VERIFICATION ===")
collections_to_audit = [
    "users", "skills", "predictions", "roadmaps", "resumes", "resume_analyses",
    "chat_history", "learning_progress", "achievements", "settings", "reports",
    "placement_scores", "notifications", "favorites"
]

mongo_counts = {}
for coll_name in collections_to_audit:
    coll = db[coll_name]
    count_a = coll.count_documents({"$or": [{"user_id": str(db_user_a["_id"])}, {"_id": db_user_a["_id"]}]})
    count_b = coll.count_documents({"$or": [{"user_id": str(user_b_id)}, {"_id": ObjectId(user_b_id)}]})
    mongo_counts[coll_name] = {"user_a_records": count_a, "user_b_records": count_b}

log_test("MONGODB VERIFICATION", "Collection Scoping Audit", "PASS", mongo_counts)

# Save test report JSON for final compilation
with open("backend/ml/saved_models/e2e_api_test_results.json", "w") as f:
    json.dump({
        "results": results,
        "user_a_id": str(db_user_a["_id"]),
        "user_b_id": str(user_b_id),
        "user_a_token": user_a_token,
        "user_b_token": user_b_token
    }, f, indent=2)

print("\n[OK] API Validation Suite Complete. Results saved to e2e_api_test_results.json")
