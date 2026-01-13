import sys
import os

# Add the project root to sys.path to allow importing from 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, inspect
from app.config.settings import settings
from app.shared.database import Base
# Import Quest to ensure it's registered with Base.metadata
from app.shared.models import Quest

def create_table():
    """Create the quests table if it doesn't exist"""
    print("🔄 Checking database schema...")
    engine = create_engine(settings.DATABASE_URL)
    
    inspector = inspect(engine)
    if 'quests' not in inspector.get_table_names():
        print("➕ Creating 'quests' table...")
        # create_all will only create tables that don't exist
        Base.metadata.create_all(bind=engine, tables=[Quest.__table__])
        print("✅ 'quests' table created successfully!")
    else:
        print("⏭️ 'quests' table already exists.")

if __name__ == "__main__":
    try:
        create_table()
    except Exception as e:
        print(f"❌ Error creating table: {e}")
        sys.exit(1)
