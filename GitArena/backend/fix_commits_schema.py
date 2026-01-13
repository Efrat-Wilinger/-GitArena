import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import pathlib

# Load environment variables
current_dir = pathlib.Path(__file__).parent.absolute()
env_path = current_dir.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ DATABASE_URL not found in environment variables.")
    sys.exit(1)

def fix_schema():
    print(f"Connecting to database...")
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            print("Adding missing columns to commits table...")
            
            # additions
            try:
                conn.execute(text("ALTER TABLE commits ADD COLUMN additions INTEGER DEFAULT 0"))
                print("✅ Added 'additions' column.")
            except Exception as e:
                print(f"⚠️ Could not add 'additions' (maybe exists?): {e}")

            # deletions
            try:
                conn.execute(text("ALTER TABLE commits ADD COLUMN deletions INTEGER DEFAULT 0"))
                print("✅ Added 'deletions' column.")
            except Exception as e:
                print(f"⚠️ Could not add 'deletions' (maybe exists?): {e}")

            # files_changed
            try:
                conn.execute(text("ALTER TABLE commits ADD COLUMN files_changed INTEGER DEFAULT 0"))
                print("✅ Added 'files_changed' column.")
            except Exception as e:
                print(f"⚠️ Could not add 'files_changed' (maybe exists?): {e}")

            # diff_data (JSON)
            try:
                conn.execute(text("ALTER TABLE commits ADD COLUMN diff_data JSON"))
                print("✅ Added 'diff_data' column.")
            except Exception as e:
                print(f"⚠️ Could not add 'diff_data' (maybe exists?): {e}")
                
            conn.commit()
            print("✅ Schema fix completed successfully.")

    except Exception as e:
        print(f"❌ Error fixing schema: {e}")

if __name__ == "__main__":
    fix_schema()
