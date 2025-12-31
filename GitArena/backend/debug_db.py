import os
from dotenv import load_dotenv

# Load env vars first
load_dotenv(r"C:\הנדסת תוכנה פרויקט\GitArena\.env")
# Ensure DATABASE_URL is set for pydantic validation
if not os.getenv("DATABASE_URL"):
    os.environ["DATABASE_URL"] = "postgresql://postgres:postgres@localhost:5432/gitarena"

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
# Import models after env is set
from app.shared.models import User, Space, SpaceMember

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL")
if "db" in DATABASE_URL and "localhost" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("@db", "@localhost")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    # 1. Get current user (assuming ID 1 or the most recent one)
    users = db.query(User).all()
    print(f"Total Users: {len(users)}")
    for u in users:
        print(f"User: {u.id} - {u.username} (GitHub ID: {u.github_id})")

    # 2. Get Spaces
    spaces = db.query(Space).all()
    print(f"\nTotal Spaces: {len(spaces)}")
    for s in spaces:
        member_count = db.query(SpaceMember).filter(SpaceMember.space_id == s.id).count()
        print(f"Space: {s.id} - {s.name} (Owner: {s.owner_id}) - Members: {member_count}")
        
    # 3. List Members for a Space (e.g., first one)
    if spaces:
        s = spaces[0]
        members = db.query(SpaceMember).filter(SpaceMember.space_id == s.id).all()
        print(f"\nMembers in Space {s.name}:")
        for m in members:
            u = db.query(User).filter(User.id == m.user_id).first()
            print(f" - {u.username} (Role: {m.role})")

except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
