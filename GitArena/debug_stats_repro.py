import sys
import os
from sqlalchemy import create_engine, func, or_
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Add backend directory to python path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

# Load env vars explicitly
load_dotenv(os.path.join(os.getcwd(), '.env'))

from app.config.settings import settings
from app.shared.models import User, Commit, Repository, SpaceMember
from app.modules.analytics.service import AnalyticsService

def debug_stats():
    # Setup DB connection
    DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://")
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        print("--- Debugging Stats Logic ---")
        
        # 1. Get a manager user (let's assume the first user is a manager or we list all)
        users = db.query(User).all()
        print(f"Total Users in DB: {len(users)}")
        
        target_user = None
        for u in users:
            print(f"User: {u.username} (ID: {u.id})")
            # Just pick the first one for now, or the one likely to be the user reporting issue
            if not target_user: target_user = u

        if not target_user:
            print("No users found.")
            return

        print(f"\nUsing Target User: {target_user.username} (ID: {target_user.id})")
        
        service = AnalyticsService(db)
        
        # 2. Get space IDs
        space_ids = service._get_user_team_space_ids(target_user.id)
        print(f"Managed Space IDs: {space_ids}")
        
        # 3. Get Repos
        repos = db.query(Repository).filter(Repository.space_id.in_(space_ids)).all()
        repo_ids = [r.id for r in repos]
        print(f"Repo IDs: {repo_ids}")
        
        if not repo_ids:
            print("No repositories found for this user.")
            return
            
        # 4. Get Contributors (mimicking get_manager_team_members)
        contributors = service._get_repository_contributors(repo_ids)
        print(f"\nFound {len(contributors)} contributors:")
        
        for i, contributor in enumerate(contributors):
            name = contributor.get("name") or "Unknown"
            email = contributor.get("email")
            is_reg = contributor.get("is_registered")
            git_names = contributor.get("git_names", [])
            git_emails = contributor.get("git_emails", [])
            
            print(f"\nContributor #{i+1}: {name} (Registered: {is_reg})")
            print(f"  - Git Names: {git_names}")
            print(f"  - Git Emails: {git_emails}")
            
            # 5. Calculate Stats (Exactly as in service)
            emails = [e for e in git_emails if e]
            names = [n for n in git_names if n]
            
            filters = []
            if emails: filters.append(Commit.author_email.in_(emails))
            if names: filters.append(Commit.author_name.in_(names))
            
            if filters:
                query = db.query(func.count(Commit.id)).filter(
                    Commit.repository_id.in_(repo_ids),
                    or_(*filters)
                )
                print(f"  - Query logic: repo_id IN {repo_ids} AND (email IN {emails} OR name IN {names})")
                count = query.scalar() or 0
                print(f"  - Calculated Commits: {count}")
                
                # DEBUG: Run raw query to check content if count is 0 but we expect commits
                if count == 0:
                    print("  ! WARNING: Count is 0. Checking raw commits for this author...")
                    raw_commits = db.query(Commit).filter(
                        Commit.repository_id.in_(repo_ids),
                        or_(*filters)
                    ).limit(5).all()
                    print(f"  - Raw Commits sample: {len(raw_commits)}")
                    for rc in raw_commits:
                         print(f"    - {rc.sha}: {rc.author_name} <{rc.author_email}>")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    debug_stats()
