import os
import httpx
import logging
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

# Load .env
load_dotenv('.env', override=True)

# Correct port 5435
DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:newpassword123@127.0.0.1:5435/gitarena")

from app.shared.models import User, Repository, Space

def main():
    engine = create_engine(DB_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    print(f"=== DEEP SYNC DIAGNOSTIC ===")
    
    # 1. Get current user
    user = db.query(User).filter(User.username == "Efrat-Wilinger").first()
    if not user:
        print("[ERROR] User Efrat-Wilinger not found")
        return
        
    print(f"[INFO] User: {user.username} (ID: {user.id})")
    
    # 2. Check DB Repos
    total_db_repos = db.query(Repository).count()
    user_db_repos = db.query(Repository).filter(Repository.user_id == user.id).all()
    
    print(f"[INFO] Total Repos in DB (Global): {total_db_repos}")
    print(f"[INFO] Repos for this User in DB: {len(user_db_repos)}")
    
    # 3. Check GitHub API (Full List)
    print("\n[INFO] Fetching FULL repository list from GitHub...")
    all_gh_repos = []
    page = 1
    try:
        while True:
            response = httpx.get(
                "https://api.github.com/user/repos",
                headers={
                    "Authorization": f"Bearer {user.access_token}",
                    "Accept": "application/vnd.github.v3+json"
                },
                params={"per_page": 100, "page": page, "sort": "updated"}
            )
            if response.status_code != 200:
                print(f"[ERROR] GitHub API Error: {response.status_code}")
                break
            
            repos = response.json()
            if not repos:
                break
            all_gh_repos.extend(repos)
            if len(repos) < 100:
                break
            page += 1
            
        print(f"[INFO] GitHub reported {len(all_gh_repos)} total repositories.")
        
        # 4. Compare
        gh_ids_in_db = {r.github_id for r in db.query(Repository).all()}
        user_gh_ids_in_db = {r.github_id for r in user_db_repos}
        
        missing_in_db = []
        assigned_to_other = []
        
        for gh_repo in all_gh_repos:
            gid = str(gh_repo["id"])
            if gid not in gh_ids_in_db:
                missing_in_db.append(gh_repo["full_name"])
            elif gid not in user_gh_ids_in_db:
                # Exists in DB but not for this user
                other_repo = db.query(Repository).filter(Repository.github_id == gid).first()
                assigned_to_other.append(f"{gh_repo['full_name']} (Assigned to User ID: {other_repo.user_id})")

        print(f"\n[SUMMARY]")
        print(f"- Repos to import: {len(missing_in_db)}")
        print(f"- Repos existing but assigned to others: {len(assigned_to_other)}")
        
        if missing_in_db:
            print("\n[SAMPLE MISSING REPOS]:")
            for m in missing_in_db[:10]:
                print(f"  - {m}")
        
        if assigned_to_other:
            print("\n[REPOS ASSIGNED TO OTHERS]:")
            for a in assigned_to_other[:10]:
                print(f"  - {a}")

    except Exception as e:
        print(f"[ERROR] Diagnostic failed: {e}")

if __name__ == "__main__":
    main()
