import sys
import os
from dotenv import load_dotenv

# Path to backend .env
backend_env_path = os.path.join(os.path.dirname(__file__), '../backend/.env')
print(f"Loading .env from: {os.path.abspath(backend_env_path)}")
load_dotenv(dotenv_path=backend_env_path)

# Add backend directory to path to import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

# Debug: Print DB URL (masked)
db_url = os.getenv("DATABASE_URL", "NOT_SET")
print(f"DEBUG: DATABASE_URL={db_url.replace(db_url.split(':')[2].split('@')[0], '****') if 'postgresql' in db_url and '@' in db_url else db_url}")
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from app.shared.database import SessionLocal
from app.shared.models import Space, User

def list_project_managers():
    db = SessionLocal()
    try:
        spaces = db.query(Space).all()
        
        print(f"{'ID':<5} | {'Project Name':<30} | {'Manager (Owner)':<20} | {'Email':<30}")
        print("-" * 90)
        
        for space in spaces:
            # Get Owner
            owner = db.query(User).filter(User.id == space.owner_id).first()
            owner_name = owner.username if owner else "Unknown"
            
            # Get other Managers/Admins
            from app.shared.models import SpaceMember
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
    list_project_managers()
