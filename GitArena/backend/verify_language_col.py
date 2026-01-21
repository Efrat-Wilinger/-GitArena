
import os
import sys
from sqlalchemy import create_engine, inspect
from dotenv import load_dotenv

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(project_root, ".env")
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found in .env")
    sys.exit(1)

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
inspector = inspect(engine)

def verify():
    columns = [c['name'] for c in inspector.get_columns("repositories")]
    if "language" in columns:
        print("LANGUAGE_COLUMN_EXISTS")
    else:
        print("LANGUAGE_COLUMN_MISSING")

if __name__ == "__main__":
    verify()
