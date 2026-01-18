import sys
import os
from sqlalchemy import create_engine, func, or_
from sqlalchemy.orm import sessionmaker

# Handle Path: If running in Docker (root contains app/), add current dir.
# If running locally (root contains backend/), add backend/.
if os.path.exists('app') and os.path.isdir('app'):
    sys.path.append(os.getcwd())
elif os.path.exists('backend'):
    sys.path.append(os.path.join(os.getcwd(), 'backend'))

# No load_dotenv needed in Docker as env vars are set
from app.config.settings import settings
from app.shared.models import User, Commit, Repository, SpaceMember
from app.modules.analytics.service import AnalyticsService

def debug_stats():
    # Setup DB connection
    # Ensure psycopg2 driver is used
    DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://")
    print(f"Connecting to DB: {DATABASE_URL.split('@')[-1]}") # Print host only for security
    
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        print("--- Debugging Stats Logic (Docker) ---")
        
        # 1. Get a manager user
        users = db.query(User).all()
        print(f"Total Users in DB: {len(users)}")
        
        target_user = None
        # Try to find 'Efrat' or any user with spaces
        for u in users:
            # print(f"User: {u.username} (ID: {u.id})")
            if u.space_memberships or u.spaces:
                target_user = u
                break
        
        if not target_user and users:
            target_user = users[0]

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
            print(f"  - Identities: Names={git_names}, Emails={git_emails}")
            
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
                count = query.scalar() or 0
                print(f"  - Calculated Commits: {count}")
                
                if count == 0:
                    print(f"  ! ZERO COMMITS FOUND. Debugging...")
                    # Check if searching by one of them works
                    if names and len(names) > 0:
                        test_name = names[0]
                        c_name = db.query(func.count(Commit.id)).filter(Commit.repository_id.in_(repo_ids), Commit.author_name == test_name).scalar()
                        print(f"    - Only Name '{test_name}': {c_name}")
                    
                    if emails and len(emails) > 0:
                        test_email = emails[0]
                        c_email = db.query(func.count(Commit.id)).filter(Commit.repository_id.in_(repo_ids), Commit.author_email == test_email).scalar()
                        print(f"    - Only Email '{test_email}': {c_email}")
                        
                    # Check case sensitivity
                    # print("    - Checking ILIKE for first name...")
    
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    debug_stats()
