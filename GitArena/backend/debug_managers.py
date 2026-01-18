import sys
import os

# Add current directory to path so we can import 'app'
sys.path.append(os.getcwd())

from app.shared.database import SessionLocal
from app.shared.models import Space, User, SpaceMember

def list_managers():
    print("--- Connecting to Database ---")
    db = SessionLocal()
    try:
        spaces = db.query(Space).all()
        print(f"{'ID':<5} | {'Project Name':<30} | {'Manager (Owner)':<20} | {'Admins (Additional)':<30}")
        print("-" * 95)
        
        for space in spaces:
            owner = db.query(User).filter(User.id == space.owner_id).first()
            owner_name = owner.username if owner else "Unknown"
            
            managers = db.query(User).join(SpaceMember).filter(
                SpaceMember.space_id == space.id,
                SpaceMember.role.in_(['manager', 'admin'])
            ).all()
            
            manager_names = [m.username for m in managers if m.id != space.owner_id]
            managers_str = ", ".join(manager_names) if manager_names else "None"
            
            print(f"{space.id:<5} | {space.name:<30} | {owner_name:<20} | {managers_str:<30}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    list_managers()
