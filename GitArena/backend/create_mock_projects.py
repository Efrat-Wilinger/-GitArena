"""
Script to create mock projects with different role permissions
"""
import sys
sys.path.append('/app')

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.shared.models import Space, SpaceMember, Repository, Commit, User
from datetime import datetime, timedelta
import random

# Database connection
DATABASE_URL = "postgresql://postgres:postgres@db:5432/gitarena"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def create_mock_projects():
    # Get the current user (first user in DB)
    current_user = db.query(User).first()
    if not current_user:
        print("No users found! Please login first.")
        return
    
    print(f"Creating projects for user: {current_user.username} (ID: {current_user.id})")
    
    # Create a second mock user for the team
    mock_teammate = db.query(User).filter(User.username == 'mock_teammate').first()
    if not mock_teammate:
        mock_teammate = User(
            github_id='mock_123456',
            username='mock_teammate',
            email='teammate@example.com',
            name='Mock Teammate',
            avatar_url='https://avatars.githubusercontent.com/u/123456',
            role='member'
        )
        db.add(mock_teammate)
        db.commit()
        db.refresh(mock_teammate)
    
    # PROJECT 1: User is ADMIN/MANAGER
    print("\n=== Creating Project 1: User as Admin ===")
    project1 = Space(
        name='GitArena Dashboard',
        description='Main dashboard application - You are the project manager',
        owner_id=current_user.id,
        created_at=datetime.utcnow() - timedelta(days=30),
        updated_at=datetime.utcnow()
    )
    db.add(project1)
    db.commit()
    db.refresh(project1)
    
    # Add current user as admin (owner is automatically admin, but let's add the record)
    member1_admin = SpaceMember(
        space_id=project1.id,
        user_id=current_user.id,
        role='admin',
        created_at=datetime.utcnow() - timedelta(days=30)
    )
    db.add(member1_admin)
    
    # Add mock teammate as regular member
    member1_regular = SpaceMember(
        space_id=project1.id,
        user_id=mock_teammate.id,
        role='member',
        created_at=datetime.utcnow() - timedelta(days=25)
    )
    db.add(member1_regular)
    
    # Create mock repository for project 1
    repo1 = Repository(
        github_id='repo_001',
        name='gitarena-dashboard',
        full_name='yourorg/gitarena-dashboard',
        description='Dashboard repository',
        url='https://github.com/yourorg/gitarena-dashboard',
        space_id=project1.id,
        user_id=current_user.id,
        created_at=datetime.utcnow() - timedelta(days=30)
    )
    db.add(repo1)
    db.commit()
    db.refresh(repo1)
    
    # Add mock commits for project 1
    for i in range(15):
        days_ago = random.randint(1, 30)
        commit = Commit(
            sha=f'mock_commit_1_{i}',
            message=f'Add feature #{i}',
            author_name=current_user.name or current_user.username,
            author_email=current_user.email or f'{current_user.username}@example.com',
            committed_date=datetime.utcnow() - timedelta(days=days_ago),
            additions=random.randint(10, 200),
            deletions=random.randint(5, 100),
            repository_id=repo1.id
        )
        db.add(commit)
    
    # Add commits from teammate
    for i in range(8):
        days_ago = random.randint(1, 25)
        commit = Commit(
            sha=f'mock_commit_teammate_1_{i}',
            message=f'Fix bug #{i}',
            author_name=mock_teammate.name,
            author_email=mock_teammate.email,
            committed_date=datetime.utcnow() - timedelta(days=days_ago),
            additions=random.randint(5, 150),
            deletions=random.randint(2, 80),
            repository_id=repo1.id
        )
        db.add(commit)
    
    print(f"✓ Created project: {project1.name} (ID: {project1.id})")
    print(f"  - You are: ADMIN")
    print(f"  - Added 15 commits from you")
    print(f"  - Added 8 commits from teammate")
    
    # PROJECT 2: User is REGULAR MEMBER
    print("\n=== Creating Project 2: User as Regular Member ===")
    project2 = Space(
        name='Analytics Engine',
        description='Analytics processing engine - You are a team member',
        owner_id=mock_teammate.id,  # Teammate is the owner
        created_at=datetime.utcnow() - timedelta(days=45),
        updated_at=datetime.utcnow()
    )
    db.add(project2)
    db.commit()
    db.refresh(project2)
    
    # Add mock teammate as admin (owner)
    member2_admin = SpaceMember(
        space_id=project2.id,
        user_id=mock_teammate.id,
        role='admin',
        created_at=datetime.utcnow() - timedelta(days=45)
    )
    db.add(member2_admin)
    
    # Add current user as regular member
    member2_regular = SpaceMember(
        space_id=project2.id,
        user_id=current_user.id,
        role='member',  # Regular member role
        created_at=datetime.utcnow() - timedelta(days=40)
    )
    db.add(member2_regular)
    
    # Create mock repository for project 2
    repo2 = Repository(
        github_id='repo_002',
        name='analytics-engine',
        full_name='yourorg/analytics-engine',
        description='Analytics repository',
        url='https://github.com/yourorg/analytics-engine',
        space_id=project2.id,
        user_id=mock_teammate.id,
        created_at=datetime.utcnow() - timedelta(days=45)
    )
    db.add(repo2)
    db.commit()
    db.refresh(repo2)
    
    # Add mock commits for project 2
    # Your commits (you're just a member)
    for i in range(6):
        days_ago = random.randint(1, 40)
        commit = Commit(
            sha=f'mock_commit_2_{i}',
            message=f'Implement analytics feature #{i}',
            author_name=current_user.name or current_user.username,
            author_email=current_user.email or f'{current_user.username}@example.com',
            committed_date=datetime.utcnow() - timedelta(days=days_ago),
            additions=random.randint(10, 180),
            deletions=random.randint(5, 90),
            repository_id=repo2.id
        )
        db.add(commit)
    
    # Teammate's commits (they're the owner/admin)
    for i in range(20):
        days_ago = random.randint(1, 45)
        commit = Commit(
            sha=f'mock_commit_teammate_2_{i}',
            message=f'Core engine work #{i}',
            author_name=mock_teammate.name,
            author_email=mock_teammate.email,
            committed_date=datetime.utcnow() - timedelta(days=days_ago),
            additions=random.randint(20, 300),
            deletions=random.randint(10, 150),
            repository_id=repo2.id
        )
        db.add(commit)
    
    print(f"✓ Created project: {project2.name} (ID: {project2.id})")
    print(f"  - You are: REGULAR MEMBER")
    print(f"  - Added 6 commits from you")
    print(f"  - Added 20 commits from admin")
    
    # Commit all changes
    db.commit()
    
    print("\n✅ Successfully created 2 mock projects!")
    print(f"\nProject 1 (ID {project1.id}): {project1.name} - YOU ARE ADMIN")
    print(f"Project 2 (ID {project2.id}): {project2.name} - YOU ARE MEMBER")
    
    db.close()

if __name__ == '__main__':
    create_mock_projects()
