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

def check_data():
    print(f"🔍 Checking database contents...\n")
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            # Check users
            result = conn.execute(text("SELECT COUNT(*) FROM users"))
            user_count = result.scalar()
            print(f"👥 Users: {user_count}")
            
            if user_count > 0:
                result = conn.execute(text("SELECT id, username, email FROM users LIMIT 5"))
                for row in result:
                    print(f"   - User {row[0]}: {row[1]} ({row[2]})")
            
            # Check repositories
            result = conn.execute(text("SELECT COUNT(*) FROM repositories"))
            repo_count = result.scalar()
            print(f"\n📦 Repositories: {repo_count}")
            
            if repo_count > 0:
                result = conn.execute(text("SELECT id, name, user_id FROM repositories LIMIT 5"))
                for row in result:
                    print(f"   - Repo {row[0]}: {row[1]} (User: {row[2]})")
            
            # Check commits
            result = conn.execute(text("SELECT COUNT(*) FROM commits"))
            commit_count = result.scalar()
            print(f"\n💾 Commits: {commit_count}")
            
            if commit_count > 0:
                result = conn.execute(text("SELECT id, message, author_name FROM commits LIMIT 5"))
                for row in result:
                    msg = row[1][:50] + "..." if len(row[1]) > 50 else row[1]
                    print(f"   - Commit {row[0]}: {msg} (by {row[2]})")
            
            # Check spaces (projects)
            result = conn.execute(text("SELECT COUNT(*) FROM spaces"))
            space_count = result.scalar()
            print(f"\n🏢 Projects (Spaces): {space_count}")
            
            if space_count > 0:
                result = conn.execute(text("SELECT id, name, owner_id FROM spaces LIMIT 5"))
                for row in result:
                    print(f"   - Project {row[0]}: {row[1]} (Owner: {row[2]})")
            
            # Check pull requests
            result = conn.execute(text("SELECT COUNT(*) FROM pull_requests"))
            pr_count = result.scalar()
            print(f"\n🔀 Pull Requests: {pr_count}")
            
            # Summary
            print(f"\n{'='*50}")
            print(f"📊 SUMMARY:")
            print(f"   Total Users: {user_count}")
            print(f"   Total Repositories: {repo_count}")
            print(f"   Total Commits: {commit_count}")
            print(f"   Total Projects: {space_count}")
            print(f"   Total PRs: {pr_count}")
            print(f"{'='*50}")
            
            if repo_count == 0:
                print(f"\n⚠️  No repositories found!")
                print(f"   Action: Click 'Sync Repositories' in the app")
            
            if space_count == 0:
                print(f"\n⚠️  No projects found!")
                print(f"   Action: Create a project from your repositories")

    except Exception as e:
        print(f"❌ Error checking data: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_data()
