
import sys
import os

# Add backend directory to python path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.config.settings import settings
from app.shared.database import Base
from app.shared.models import User, Commit

# Setup DB connection
DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def debug_user_stats():
    print("--- Debugging User Stats for 'Adi' ---")
    
    # 1. Find User
    users = db.query(User).filter(User.username.ilike('%Adi%') | User.name.ilike('%Adi%')).all()
    
    if not users:
        print("No user found matching 'Adi'")
        return

    for user in users:
        print(f"\nUser Found: ID={user.id}, Username='{user.username}', Name='{user.name}', Email='{user.email}', GitHubLogin='{user.github_login}'")
        
        # 2. Check Commits that MIGHT match
        # We'll search commits for anything looking like Adi
        potential_commits = db.query(Commit).filter(
            Commit.author_name.ilike(f'%{user.username}%') | 
            Commit.author_name.ilike(f'%{user.name}%') |
            Commit.author_name.ilike('%Adi%')
        ).limit(10).all()
        
        print(f"Potential Commits found: {len(potential_commits)}")
        for c in potential_commits:
            print(f"  - Commit {c.sha[:7]}: AuthorName='{c.author_name}', AuthorEmail='{c.author_email}'")
            
            # Check exact match failure
            match_email = (c.author_email == user.email)
            match_username = (c.author_name == user.username)
            match_name = (c.author_name == user.name)
            
            print(f"    Matches: Email={match_email}, Username={match_username}, Name={match_name}")

if __name__ == "__main__":
    try:
        debug_user_stats()
    finally:
        db.close()
