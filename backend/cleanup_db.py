import os
import shutil
import pymongo
from pathlib import Path

def cleanup():
    print("Connecting to MongoDB...")
    client = pymongo.MongoClient("mongodb://localhost:27017")
    db = client["career_compass_ai"]
    
    collections_to_clear = [
        "users",
        "skills",
        "predictions",
        "roadmaps",
        "resumes",
        "resume_analyses",
        "chat_history",
        "ai_chat_history",
        "notifications",
        "favorites",
        "learning_progress",
        "achievements",
        "settings",
        "reports",
        "placement_scores"
    ]
    
    print("Clearing collections...")
    for col in collections_to_clear:
        res = db[col].delete_many({})
        print(f"  Collection '{col}': deleted {res.deleted_count} documents.")
        
    print("Database counts after cleanup:")
    for col in db.list_collection_names():
        print(f"  {col}: {db[col].count_documents({})}")
        
    # Clear upload files except .gitkeep
    uploads_dir = Path("c:/Users/kabhi/Desktop/Semester 4 projects/DSA 3.0/project-bolt-sb1-djprtkdr/project/backend/app/uploads")
    print(f"Cleaning upload directory: {uploads_dir} ...")
    
    if uploads_dir.exists():
        for root, dirs, files in os.walk(uploads_dir):
            for file in files:
                if file != ".gitkeep":
                    file_path = Path(root) / file
                    try:
                        file_path.unlink()
                        print(f"  Deleted file: {file_path}")
                    except Exception as e:
                        print(f"  Failed to delete file {file_path}: {e}")
            for d in dirs:
                dir_path = Path(root) / d
                # If directory is empty after deleting files, delete it
                try:
                    if not any(dir_path.iterdir()):
                        dir_path.rmdir()
                        print(f"  Deleted empty directory: {dir_path}")
                except Exception as e:
                    print(f"  Failed to delete directory {dir_path}: {e}")
    else:
        print("Uploads directory does not exist.")

if __name__ == "__main__":
    cleanup()
