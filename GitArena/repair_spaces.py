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

from app.shared.models import Space, SpaceMember

def main():
    engine = create_engine(DB_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    print(f"=== REPAIRING SPACE MEMBERSHIPS ===")
    
    spaces = db.query(Space).all()
    repaired_count = 0
    already_correct = 0
    
    for space in spaces:
        if not space.owner_id:
            print(f"  [SKIP] Space ID {space.id} ({space.name}) has no owner_id.")
            continue
            
        # Check if owner is already a member
        is_member = db.query(SpaceMember).filter(
            SpaceMember.space_id == space.id,
            SpaceMember.user_id == space.owner_id
        ).first()
        
        if not is_member:
            print(f"  [REPAIR] Adding Owner ID {space.owner_id} as manager to Space ID {space.id} ({space.name})")
            new_member = SpaceMember(
                space_id=space.id,
                user_id=space.owner_id,
                role="manager"
            )
            db.add(new_member)
            repaired_count += 1
        else:
            already_correct += 1
            
    if repaired_count > 0:
        db.commit()
        print(f"\n[SUCCESS] Repaired {repaired_count} spaces. {already_correct} were already correct.")
    else:
        print(f"\n[INFO] All {already_correct} spaces already have the owner as a member.")

if __name__ == "__main__":
    main()
