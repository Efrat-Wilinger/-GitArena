from app.shared.database import SessionLocal
from app.shared.models import Commit, Repository, Space, SpaceMember, User

db = SessionLocal()

print("--- Debugging Data ---")

# 1. Check Users
user = db.query(User).first()
if user:
    print(f"User: {user.username} (ID: {user.id})")
else:
    print("No users found!")

# 2. Check Spaces for User
if user:
    memberships = db.query(SpaceMember).filter(SpaceMember.user_id == user.id).all()
    print(f"User is member of {len(memberships)} spaces.")
    space_ids = [m.space_id for m in memberships]
    
    owned = db.query(Space).filter(Space.owner_id == user.id).all()
    print(f"User owns {len(owned)} spaces.")
    for s in owned:
        space_ids.append(s.id)
    
    space_ids = list(set(space_ids))
    print(f"Total Space IDs: {space_ids}")

    # 3. Check Repositories in these spaces
    repos = db.query(Repository).filter(Repository.space_id.in_(space_ids)).all()
    print(f"Found {len(repos)} repositories in these spaces.")
    repo_ids = [r.id for r in repos]
    print(f"Repo IDs: {repo_ids}")

    # 4. Check Commits in these repositories
    if repo_ids:
        commit_count = db.query(Commit).filter(Commit.repository_id.in_(repo_ids)).count()
        print(f"Total commits in user's scope: {commit_count}")
        
        # Check recent commits
        from datetime import datetime, timedelta
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent = db.query(Commit).filter(
            Commit.repository_id.in_(repo_ids),
            Commit.committed_date >= thirty_days_ago
        ).count()
        print(f"Commits in last 30 days: {recent}")
        
        # Check sample commit date
        last_commit = db.query(Commit).filter(Commit.repository_id.in_(repo_ids)).order_by(Commit.committed_date.desc()).first()
        if last_commit:
            print(f"Last commit date: {last_commit.committed_date}")
    else:
        print("No repositories found in user's spaces.")

print("--- End Debug ---")
