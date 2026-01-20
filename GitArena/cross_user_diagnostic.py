import os
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

from app.shared.models import User, Space, SpaceMember

def main():
    engine = create_engine(DB_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    print(f"=== CROSS-USER DIAGNOSTIC ===")
    
    # 1. List all users with tokens
    users = db.query(User).all()
    print(f"[INFO] Total Users in DB: {len(users)}")
    for u in users:
        print(f"  - User ID: {u.id}, Username: {u.username}, Has Token: {'Yes' if u.access_token else 'No'}")
    
    # 2. Check Space Memberships for ID 1
    target_user_id = 1
    memberships = db.query(SpaceMember).filter(SpaceMember.user_id == target_user_id).all()
    print(f"\n[INFO] Memberships for User ID {target_user_id}: {len(memberships)}")
    for m in memberships:
        s = db.query(Space).filter(Space.id == m.space_id).first()
        print(f"  - In Space: {s.name if s else 'Unknown'} (ID: {m.space_id}, Role: {m.role})")

    # 3. Check for any spaces NOT associated with any user
    orphaned_spaces = db.query(Space).filter(Space.owner_id == None).all()
    print(f"\n[INFO] Orphaned Spaces (No Owner): {len(orphaned_spaces)}")
    for s in orphaned_spaces:
        print(f"  - Orphaned Space: {s.name} (ID: {s.id})")

if __name__ == "__main__":
    main()
