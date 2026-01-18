import sys
import os

# Create a valid path for import
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load .env manually
try:
    with open(".env", "r") as f:
        for line in f:
            if line.strip() and not line.startswith("#"):
                key, val = line.strip().split("=", 1)
                os.environ[key] = val
except Exception:
    print("Warning: Could not load .env file")

from app.shared.database import SessionLocal
from app.shared.models import Repository, Commit, Space
from sqlalchemy import func

def debug_data():
    db = SessionLocal()
    try:
        print("--- Debugging Data for Vitality Metrics ---")
        
        # 1. Total Commits in DB
        total_commits = db.query(Commit).count()
        print(f"Total Commits in DB: {total_commits}")
        
        # 2. Spaces and Repos
        spaces = db.query(Space).all()
        print(f"Total Spaces: {len(spaces)}")
        
        for space in spaces:
            print(f"\nSpace: {space.name} (ID: {space.id})")
            repos = db.query(Repository).filter(Repository.space_id == space.id).all()
            print(f"  Repos: {len(repos)}")
            
            for repo in repos:
                commit_count = db.query(Commit).filter(Commit.repository_id == repo.id).count()
                print(f"    Repo: {repo.name} (ID: {repo.id}) - Commits: {commit_count}")
                
        # 3. Check orphaned commits?
        orphaned = db.query(Commit).filter(Commit.repository_id == None).count()
        print(f"\nOrphaned Commits: {orphaned}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_data()
