"""
Script to remove the mock teammate user from the database
"""
import sys
sys.path.append('/app')

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.shared.models import User, SpaceMember, Space, Repository, Commit

# Database connection
DATABASE_URL = "postgresql://postgres:postgres@db:5432/gitarena"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def remove_mock_teammate():
    """Remove the mock teammate and reassign their data"""
    
    # Find the mock teammate
    mock_teammate = db.query(User).filter(User.username == 'mock_teammate').first()
    
    if not mock_teammate:
        print("❌ Mock teammate not found in the database")
        db.close()
        return
    
    print(f"Found mock teammate: {mock_teammate.name} (ID: {mock_teammate.id})")
    
    # Find the main user (first non-mock user)
    main_user = db.query(User).filter(User.username != 'mock_teammate').first()
    
    if not main_user:
        print("❌ No other users found to reassign data to")
        db.close()
        return
    
    print(f"Will reassign data to: {main_user.username} (ID: {main_user.id})")
    
    # 1. Update spaces owned by mock teammate
    owned_spaces = db.query(Space).filter(Space.owner_id == mock_teammate.id).all()
    for space in owned_spaces:
        print(f"  - Transferring ownership of space '{space.name}' to {main_user.username}")
        space.owner_id = main_user.id
    
    # 2. Update repositories owned by mock teammate
    owned_repos = db.query(Repository).filter(Repository.user_id == mock_teammate.id).all()
    for repo in owned_repos:
        print(f"  - Transferring ownership of repository '{repo.name}' to {main_user.username}")
        repo.user_id = main_user.id
    
    # 3. Update commits authored by mock teammate
    mock_commits = db.query(Commit).filter(
        (Commit.author_email == mock_teammate.email) | 
        (Commit.author_name == mock_teammate.name)
    ).all()
    
    if mock_commits:
        print(f"  - Updating {len(mock_commits)} commits to show as from {main_user.name}")
        for commit in mock_commits:
            commit.author_name = main_user.name or main_user.username
            commit.author_email = main_user.email or f'{main_user.username}@example.com'
    
    # 4. Delete space memberships
    memberships = db.query(SpaceMember).filter(SpaceMember.user_id == mock_teammate.id).all()
    for membership in memberships:
        print(f"  - Removing membership from space ID {membership.space_id}")
        db.delete(membership)
    
    # 5. Finally, delete the mock user
    print(f"  - Deleting user '{mock_teammate.name}'")
    db.delete(mock_teammate)
    
    # Commit all changes
    try:
        db.commit()
        print("✅ Successfully removed mock teammate and reassigned all data!")
        print(f"\nAll mock teammate's data has been transferred to: {main_user.username}")
    except Exception as e:
        db.rollback()
        print(f"❌ Error occurred: {e}")
        print("Changes have been rolled back")
    finally:
        db.close()

if __name__ == '__main__':
    print("=" * 60)
    print("Removing Mock Teammate from Database")
    print("=" * 60)
    print()
    
    # Ask for confirmation
    confirm = input("This will delete the 'Mock Teammate' user and reassign their data. Continue? (yes/no): ")
    
    if confirm.lower() in ['yes', 'y']:
        remove_mock_teammate()
    else:
        print("❌ Operation cancelled")
