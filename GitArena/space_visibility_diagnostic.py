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
from app.modules.spaces.repository import SpaceRepository
from app.modules.spaces.dto import SpaceResponse

def main():
    engine = create_engine(DB_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    print(f"=== SPACE VISIBILITY DIAGNOSTIC ===")
    
    # 1. Get current user
    user = db.query(User).filter(User.username == "Efrat-Wilinger").first()
    if not user:
        print("[ERROR] User Efrat-Wilinger not found")
        return
        
    print(f"[INFO] User: {user.username} (ID: {user.id})")
    
    # 2. Run Repository Logic
    repo = SpaceRepository(db)
    spaces = repo.get_user_spaces(user.id)
    print(f"[INFO] SpaceRepository.get_user_spaces returned: {len(spaces)} spaces")
    
    for s in spaces:
        print(f"  - ID: {s.id}, Name: {s.name}, Owner: {s.owner_id}, Repos: {[r.full_name for r in s.repositories]}")
        
    # 3. Test Serialization
    print("\n[INFO] Testing Serialization to SpaceResponse...")
    serialized_count = 0
    for s in spaces:
        try:
            resp = SpaceResponse.model_validate(s)
            serialized_count += 1
        except Exception as e:
            print(f"  [ERROR] Serialization failed for Space ID {s.id}: {e}")
            
    print(f"[INFO] Successfully serialized {serialized_count}/{len(spaces)} spaces")
    
    # 4. Check for orphaned spaces or different owners
    total_spaces = db.query(Space).count()
    print(f"\n[INFO] Total Spaces in DB (Global): {total_spaces}")
    if total_spaces > len(spaces):
        others = db.query(Space).filter(Space.owner_id != user.id).all()
        print(f"[INFO] {len(others)} spaces belong to other owners or are null")
        for o in others:
            print(f"  - Other Space: {o.name} (Owner: {o.owner_id})")

if __name__ == "__main__":
    main()
