
import os
import sys
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load env
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(project_root, ".env")
load_dotenv(env_path)

from app.shared.models import Base

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found")
    sys.exit(1)

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
inspector = inspect(engine)

def audit():
    print("--- Database Schema Audit ---")
    missing_items = []
    
    # Check tables
    model_tables = Base.metadata.tables
    db_tables = inspector.get_table_names()
    
    for table_name, table_obj in model_tables.items():
        if table_name not in db_tables:
            print(f"[MISSING TABLE] {table_name}")
            missing_items.append(f"Table: {table_name}")
            continue
            
        # Check columns
        db_cols = {c['name']: c for c in inspector.get_columns(table_name)}
        model_cols = table_obj.columns
        
        for col in model_cols:
            if col.name not in db_cols:
                print(f"[MISSING COLUMN] {table_name}.{col.name}")
                missing_items.append(f"Column: {table_name}.{col.name}")
    
    if not missing_items:
        print("\nAll models match the database schema!")
    else:
        print(f"\nFound {len(missing_items)} discrepancies.")

if __name__ == "__main__":
    audit()
