
import os
import sys
from sqlalchemy import create_engine, inspect
from dotenv import load_dotenv

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

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
inspector = inspect(engine)

def check_table(table_name):
    print(f"\nChecking table: {table_name}")
    if not inspector.has_table(table_name):
        print(f"Table {table_name} does not exist!")
        return

    columns = inspector.get_columns(table_name)
    print(f"Columns in {table_name}:")
    for column in columns:
        print(f" - {column['name']} ({column['type']})")

if __name__ == "__main__":
    check_table("repositories")
    check_table("users")
