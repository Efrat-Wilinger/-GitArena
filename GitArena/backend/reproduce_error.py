
import os
import sys
from sqlalchemy import create_engine, text
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

sql = """
SELECT repositories.id AS repositories_id, repositories.github_id AS repositories_github_id, repositories.name AS repositories_name, repositories.full_name AS repositories_full_name, repositories.description AS repositories_description, repositories.url AS repositories_url, repositories.language AS repositories_language, repositories.stargazers_count AS repositories_stargazers_count, repositories.forks_count AS repositories_forks_count, repositories.user_id AS repositories_user_id, repositories.space_id AS repositories_space_id, repositories.is_synced AS repositories_is_synced, repositories.last_synced_at AS repositories_last_synced_at, repositories.created_at AS repositories_created_at, repositories.updated_at AS repositories_updated_at 
FROM repositories 
WHERE repositories.github_id = '883729774' 
 LIMIT 1
"""

def reproduce():
    try:
        with engine.connect() as conn:
            print("Executing SQL...")
            result = conn.execute(text(sql))
            print("SQL Executed Successfully!")
            row = result.fetchone()
            print(f"Row: {row}")
    except Exception as e:
        print(f"SQL FAILED: {e}")

if __name__ == "__main__":
    reproduce()
