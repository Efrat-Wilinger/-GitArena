import os
import sys
from sqlalchemy import create_engine, text

def fix_schema():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL not found in environment, trying default for dev")
        # Fallback for local run if env var not set (though in docker it should be)
        database_url = "postgresql://postgres:gitarena@db:5432/gitarena" 
    
    print(f"Connecting to database...") # Don't print full URL with password
    engine = create_engine(database_url)
    
    
    # 1. Add columns to repositories table
    repo_cols = [
        ("language", "VARCHAR"),
        ("stargazers_count", "INTEGER DEFAULT 0"),
        ("forks_count", "INTEGER DEFAULT 0")
    ]
    
    print("Checking repositories table...")
    with engine.connect() as conn:
        for col_name, col_type in repo_cols:
            try:
                trans = conn.begin()
                conn.execute(text(f"ALTER TABLE repositories ADD COLUMN {col_name} {col_type}"))
                trans.commit()
                print(f"Added '{col_name}' column")
            except Exception as e:
                trans.rollback()
                print(f"Skipping '{col_name}' (likely exists)")

    # 2. Add columns to users table
    print("Checking users table...")
    user_cols = ["bio", "location", "company", "blog", "twitter_username"]
    with engine.connect() as conn:
        for col in user_cols:
            try:
                trans = conn.begin()
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} VARCHAR"))
                trans.commit()
                print(f"Added '{col}' column")
            except Exception as e:
                trans.rollback()
                print(f"Skipping '{col}' (likely exists)")

    # 3. Create issues table
    print("Checking issues table...")
    create_issues_table_sql = """
    CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,
        github_id VARCHAR UNIQUE,
        number INTEGER,
        title VARCHAR,
        body TEXT,
        state VARCHAR,
        author VARCHAR,
        repository_id INTEGER REFERENCES repositories(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        closed_at TIMESTAMP
    );
    """
    with engine.connect() as conn:
        try:
            trans = conn.begin()
            conn.execute(text(create_issues_table_sql))
            trans.commit()
            print("Ensured 'issues' table exists")
        except Exception as e:
            trans.rollback()
            print(f"Error creating issues table: {e}")

    # 4. Create releases table
    print("Checking releases table...")
    create_releases_table_sql = """
    CREATE TABLE IF NOT EXISTS releases (
        id SERIAL PRIMARY KEY,
        github_id VARCHAR UNIQUE,
        tag_name VARCHAR,
        name VARCHAR,
        body TEXT,
        draft BOOLEAN DEFAULT FALSE,
        prerelease BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP,
        published_at TIMESTAMP,
        repository_id INTEGER REFERENCES repositories(id)
    );
    """
    with engine.connect() as conn:
        try:
            trans = conn.begin()
            conn.execute(text(create_releases_table_sql))
            trans.commit()
            print("Ensured 'releases' table exists")
        except Exception as e:
            trans.rollback()
            print(f"Error creating releases table: {e}")

    # 5. Create deployments table
    print("Checking deployments table...")
    create_deployments_table_sql = """
    CREATE TABLE IF NOT EXISTS deployments (
        id SERIAL PRIMARY KEY,
        github_id VARCHAR UNIQUE,
        environment VARCHAR,
        description VARCHAR,
        state VARCHAR,
        created_at TIMESTAMP,
        updated_at TIMESTAMP,
        repository_id INTEGER REFERENCES repositories(id)
    );
    """
    with engine.connect() as conn:
        try:
            trans = conn.begin()
            conn.execute(text(create_deployments_table_sql))
            trans.commit()
            print("Ensured 'deployments' table exists")
        except Exception as e:
            trans.rollback()
            print(f"Error creating deployments table: {e}")

    # 6. Create activities table
    print("Checking activities table...")
    create_activities_table_sql = """
    CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        github_id VARCHAR UNIQUE,
        type VARCHAR,
        action VARCHAR,
        title VARCHAR,
        description TEXT,
        user_login VARCHAR,
        repository_id INTEGER REFERENCES repositories(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    with engine.connect() as conn:
        try:
            trans = conn.begin()
            conn.execute(text(create_activities_table_sql))
            trans.commit()
            print("Ensured 'activities' table exists")
        except Exception as e:
            trans.rollback()
            print(f"Error creating activities table: {e}")

if __name__ == "__main__":
    fix_schema()
