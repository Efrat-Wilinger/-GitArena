import sys
import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

# Ensure we can import from app
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Load env vars
load_dotenv('backend/.env')

from app.shared.database import Base
from app.shared.models import GamificationStats, Achievement, UserAchievement

def init_db():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("Error: DATABASE_URL not found in environment variables")
        return

    print(f"Connecting to database...")
    engine = create_engine(database_url)
    
    print("Creating tables for Gamification models...")
    # This will create tables only if they don't exist
    Base.metadata.create_all(bind=engine)
    
    print("✅ Gamification tables created successfully!")

if __name__ == "__main__":
    init_db()
