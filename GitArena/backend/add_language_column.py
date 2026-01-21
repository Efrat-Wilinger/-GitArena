
import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Find project root .env
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(project_root, ".env")
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found in .env")
    sys.exit(1)

# Handle postgresql:// vs postgres://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)

def add_column():
    print(f"Connecting to database to add 'language' column...")
    try:
        with engine.connect() as conn:
            # Check if column exists first
            check_sql = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='repositories' AND column_name='language';
            """)
            result = conn.execute(check_sql).fetchone()
            
            if result:
                print("Column 'language' already exists in 'repositories' table.")
            else:
                print("Adding column 'language' to 'repositories' table...")
                alter_sql = text("ALTER TABLE repositories ADD COLUMN language VARCHAR;")
                conn.execute(alter_sql)
                conn.commit()
                print("Successfully added column 'language'.")
                
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    add_column()
