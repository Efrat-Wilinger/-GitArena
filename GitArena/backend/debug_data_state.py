import sys
import os

# Add the parent directory to sys.path to resolve app imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.shared.database import SessionLocal
from app.shared.models import User, Repository, Space
from sqlalchemy.orm import Session
from sqlalchemy import text

def check_data_state():
    db: Session = SessionLocal()
    print("\n--- DATABASE STATE CHECK (v3) ---\n")
    
    current_user_id = None

    # 1. Check Users
    try:
        print("1. Querying Users...")
        users = db.query(User).all()
        print(f"   Total Users: {len(users)}")
        if users:
            user = users[0]
            current_user_id = user.id
            print(f"   First User: {user.username} (ID: {user.id})")
            print(f"   GitHub Login: {user.github_login}")
            print(f"   Access Token: {'[PRESENT]' if user.access_token else '[MISSING]'}")
        else:
            print("   No users found.")
    except Exception as e:
        print(f"   ERROR querying Users: {e}")

    # 2. Check Repositories
    if current_user_id:
        try:
            print(f"\n2. Querying Repositories for User ID {current_user_id}...")
            repos = db.query(Repository).filter(Repository.user_id == current_user_id).all()
            print(f"   Synced Repositories: {len(repos)}")
            for repo in repos[:5]:
                print(f"     - {repo.name} (Synched: {repo.is_synced})")
        except Exception as e:
            print(f"   ERROR querying Repositories: {e}")

    # 3. Check Spaces
    if current_user_id:
        try:
            print(f"\n3. Querying Spaces (Projects) for User ID {current_user_id}...")
            spaces = db.query(Space).filter(Space.owner_id == current_user_id).all()
            print(f"   Owned Projects: {len(spaces)}")
            for space in spaces:
                print(f"     - {space.name}")
        except Exception as e:
            print(f"   ERROR querying Spaces: {e}")

    db.close()
    print("\n--- END CHECK ---")

if __name__ == "__main__":
    check_data_state()
