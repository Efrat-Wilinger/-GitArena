import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import pathlib

# Load environment variables
current_dir = pathlib.Path(__file__).parent.absolute()
env_path = current_dir.parent / ".env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ DATABASE_URL not found")
    sys.exit(1)

def fix_diff_data():
    print(f"🔧 Adding diff_data column to commits table...\n")
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            # Add diff_data column (JSONB for PostgreSQL)
            try:
                conn.execute(text("ALTER TABLE commits ADD COLUMN diff_data JSONB"))
                conn.commit()
                print("✅ Added 'diff_data' column (JSONB type)")
            except Exception as e:
                if "already exists" in str(e).lower():
                    print("⚠️  Column 'diff_data' already exists")
                else:
                    print(f"❌ Error adding diff_data: {e}")
                    raise
            
            print("\n✅ Schema fix completed!")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    fix_diff_data()
