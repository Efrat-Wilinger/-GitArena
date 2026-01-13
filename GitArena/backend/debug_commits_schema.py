import os
import sys
from sqlalchemy import create_engine, inspect, text
from dotenv import load_dotenv

# Load environment variables
import pathlib
current_dir = pathlib.Path(__file__).parent.absolute()
env_path = current_dir.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ DATABASE_URL not found in environment variables.")
    sys.exit(1)

def check_schema():
    print(f"Connecting to database...")
    try:
        engine = create_engine(DATABASE_URL)
        inspector = inspect(engine)
        
        tables = ["commits", "pull_requests", "issues", "releases", "deployments", "activities"]
        
        for table_name in tables:
            print(f"\n--- Checking table: {table_name} ---")
            if not inspector.has_table(table_name):
                print(f"❌ Table '{table_name}' does not exist!")
                continue
                
            columns = inspector.get_columns(table_name)
            column_names = [col['name'] for col in columns]
            
            print(f"✅ Found {len(columns)} columns: {column_names}")
            
            # Check specifically for suspicious columns in commits
            if table_name == "commits":
                missing = []
                expected = ["files_changed", "diff_data", "additions", "deletions"]
                for exp in expected:
                    if exp not in column_names:
                        missing.append(exp)
                
                if missing:
                    print(f"❌ MISSING COLUMNS in commits: {missing}")
                else:
                    print("✅ All expected columns found in commits.")

    except Exception as e:
        print(f"❌ Error validating schema: {e}")

if __name__ == "__main__":
    check_schema()
