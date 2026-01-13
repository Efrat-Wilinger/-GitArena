import os
import sys
from sqlalchemy import create_engine, inspect
from dotenv import load_dotenv
import pathlib

# Load environment variables
current_dir = pathlib.Path(__file__).parent.absolute()
env_path = current_dir.parent / ".env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

def check_all_schemas():
    print("🔍 Checking ALL table schemas for missing columns...\n")
    
    engine = create_engine(DATABASE_URL)
    inspector = inspect(engine)
    
    # Expected columns based on models.py
    expected_schemas = {
        "repositories": ["id", "github_id", "name", "full_name", "description", "url", 
                        "language", "stargazers_count", "forks_count", "user_id", "space_id",
                        "is_synced", "last_synced_at", "created_at", "updated_at"],
        "commits": ["id", "sha", "message", "author_name", "author_email", "committed_date",
                   "repository_id", "additions", "deletions", "files_changed", "diff_data", "created_at"],
        "pull_requests": ["id", "github_id", "number", "title", "description", "state", "author",
                         "repository_id", "created_at", "updated_at", "closed_at", "merged_at"],
        "issues": ["id", "github_id", "number", "title", "body", "state", "author",
                  "repository_id", "created_at", "updated_at", "closed_at"],
        "users": ["id", "github_id", "github_login", "username", "email", "avatar_url", "name",
                 "role", "access_token", "bio", "location", "company", "blog", "twitter_username",
                 "created_at", "updated_at"]
    }
    
    all_missing = {}
    
    for table_name, expected_cols in expected_schemas.items():
        if not inspector.has_table(table_name):
            print(f"❌ Table '{table_name}' does not exist!")
            continue
        
        actual_cols = [col['name'] for col in inspector.get_columns(table_name)]
        missing = [col for col in expected_cols if col not in actual_cols]
        
        if missing:
            all_missing[table_name] = missing
            print(f"⚠️  Table '{table_name}' is missing columns:")
            for col in missing:
                print(f"     - {col}")
        else:
            print(f"✅ Table '{table_name}' has all expected columns")
    
    if all_missing:
        print(f"\n{'='*60}")
        print(f"❌ FOUND MISSING COLUMNS!")
        print(f"{'='*60}")
        for table, cols in all_missing.items():
            print(f"{table}: {', '.join(cols)}")
    else:
        print(f"\n✅ All tables have the required columns!")

if __name__ == "__main__":
    check_all_schemas()
