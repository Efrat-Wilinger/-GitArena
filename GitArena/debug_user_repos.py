import sys
import os
import asyncio
import httpx
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.config.settings import settings
from app.shared.database import Base
from app.shared.models import User, Repository, Space

# Setup DB
password_part = settings.DATABASE_URL.split('//')[1].split('@')[0].split(':')[1] if ':' in settings.DATABASE_URL.split('//')[1].split('@')[0] else ""
masked_url = settings.DATABASE_URL.replace(password_part, '****') if password_part else settings.DATABASE_URL
print(f"[INFO] Using DATABASE_URL: {masked_url}")
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

async def check_github_api(token):
    print(f"\n[INFO] Testing GitHub Token: {token[:10]}...")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://api.github.com/user/repos",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Accept": "application/vnd.github.v3+json"
                },
                params={"per_page": 5}
            )
            print(f"[INFO] GitHub API Status: {response.status_code}")
            if response.status_code == 200:
                repos = response.json()
                print(f"[INFO] GitHub API returned {len(repos)} repos (sample).")
                for r in repos:
                    print(f"  - {r['full_name']} (ID: {r['id']})")
            else:
                print(f"[ERROR] GitHub Response: {response.text}")
        except Exception as e:
            print(f"[ERROR] Connection Failed: {e}")

def main():
    print("=== DEBUG USER REPOS and SYNC ===")
    
    # 1. Get User
    # Assuming user ID 1 for now (dev user). In prod we'd need email.
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        print("[ERROR] User ID 1 not found!")
        # Try getting any user
        user = db.query(User).first()
        if user:
            print(f"[INFO] Found alternative User ID {user.id}: {user.username}")
        else:
            return

    print(f"[INFO] User: {user.username} (ID: {user.id})")
    print(f"[INFO] Has Token: {'YES' if user.access_token else 'NO'}")
    
    # 2. Check DB Repos
    repo_count = db.query(Repository).filter(Repository.user_id == user.id).count()
    unlinked_repos = db.query(Repository).filter(Repository.user_id == user.id, Repository.space_id == None).all()
    print(f"[INFO] DB Repository Count: {repo_count}")
    print(f"[INFO] Unlinked DB Repository Count: {len(unlinked_repos)}")
    
    for r in unlinked_repos:
        print(f"  - Unlinked Repo: {r.full_name} (ID: {r.id}, GH ID: {r.github_id})")

    # 3. Check Spaces
    spaces = db.query(Space).filter(Space.owner_id == user.id).all()
    print(f"[INFO] User Spaces Count: {len(spaces)}")
    for s in spaces:
        linked_repos = [r.full_name for r in s.repositories]
        print(f"  - Space: {s.name} (Linked Repos: {linked_repos})")

    # 4. Check GitHub API
    if user.access_token:
        asyncio.run(check_github_api(user.access_token))
    else:
        print("[WARN] No Access Token, cannot test GitHub API.")

if __name__ == "__main__":
    main()
