from pymongo import MongoClient
from bson import ObjectId
from pathlib import Path

client = MongoClient("mongodb://localhost:27017")
db = client["career_compass_ai"]

emails = ["e2e_test_user_a@test.com", "e2e_test_user_b@test.com"]
users = list(db.users.find({"email": {"$in": emails}}))
uids = [str(u["_id"]) for u in users]
oids = [u["_id"] for u in users]

print(f"Target test users to delete: {emails}, uids: {uids}")

collections = [
    "users", "skills", "predictions", "roadmaps", "resumes", "resume_analyses",
    "chat_history", "learning_progress", "achievements", "settings", "reports",
    "placement_scores", "notifications", "favorites"
]

summary = {}
for c in collections:
    coll = db[c]
    if c == "users":
        r = coll.delete_many({"_id": {"$in": oids}})
    else:
        r = coll.delete_many({"user_id": {"$in": uids}})
    summary[c] = r.deleted_count

print("Deleted counts per collection:", summary)

# Delete uploaded test resumes
upload_dir = Path("backend/app/uploads/resumes")
if upload_dir.exists():
    for uid in uids:
        for f in upload_dir.glob(f"{uid}_*"):
            try:
                f.unlink()
                print(f"Removed uploaded file: {f.name}")
            except Exception as e:
                print("Error removing file:", e)

# Verification
remaining_users = db.users.count_documents({"email": {"$in": emails}})
print(f"Remaining test users in DB: {remaining_users}")
