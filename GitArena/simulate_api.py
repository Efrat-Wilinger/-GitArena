import os
import sys
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

# Load .env
load_dotenv('.env', override=True)

# Correct port 5435
DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:newpassword123@127.0.0.1:5435/gitarena")

from app.shared.models import User
from app.modules.spaces.service import SpaceService
from app.modules.spaces.dto import SpaceResponse

def main():
    engine = create_engine(DB_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    print(f"=== API SIMULATION: GET /spaces/ ===")
    
    # 1. Get current user
    user = db.query(User).filter(User.username == "Efrat-Wilinger").first()
    if not user:
        print("[ERROR] User Efrat-Wilinger not found")
        return
        
    print(f"[INFO] Authenticated as: {user.username} (ID: {user.id})")
    
    # 2. Call Service
    service = SpaceService(db)
    spaces_responses = service.get_my_spaces(user.id)
    
    print(f"[INFO] Service returned {len(spaces_responses)} space responses.")
    
    # 3. Print as JSON (to see what frontend sees)
    print("\n[JSON OUTPUT SAMPLE]:")
    for resp in spaces_responses:
        # Convert Pydantic model to dict for printing
        data = resp.model_dump()
        # Convert datetime objects to string for JSON serialization
        for key in ['created_at', 'updated_at']:
            if data.get(key):
                data[key] = data[key].isoformat()
        
        print(f"Project: {data['name']} (ID: {data['id']})")
        # print(json.dumps(data, indent=2))
        
    if not spaces_responses:
        print("[WARNING] The list is EMPTY!")

if __name__ == "__main__":
    main()
