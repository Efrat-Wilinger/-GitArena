
import sys
import os
sys.path.append(os.getcwd())
from app.shared.database import SessionLocal
from app.shared.models import Repository, User
from app.modules.github.dto import RepositoryResponse

db = SessionLocal()
try:
    users = db.query(User).all()
    print(f"Found {len(users)} users.")
    for user in users:
        print(f"User: {user.username} (ID: {user.id})")
        repos = db.query(Repository).filter(Repository.user_id == user.id).all()
        print(f"  Repos: {len(repos)}")
        for repo in repos:
            print(f"    - Repo: {repo.name} (ID: {repo.id})")
            print(f"      URL: {repo.url}, FullName: {repo.full_name}, CreatedAt: {repo.created_at}")
            try:
                RepositoryResponse.model_validate(repo)
                print("      [VALID]")
            except Exception as e:
                print(f"      [INVALID] {e}")

except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
