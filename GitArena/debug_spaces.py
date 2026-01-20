import sys
import os

# Add backend directory to python path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from dotenv import load_dotenv
load_dotenv() # Force load .env from CWD

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.shared.database import Base
from app.shared.models import User, Space, SpaceMember
from app.config.settings import settings

print(f"DEBUG: Using DATABASE_URL={settings.DATABASE_URL}")

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

print("-" * 50)
print("DEBUG: Users")
users = db.query(User).all()
for u in users:
    print(f"User: {u.id} | {u.username} | {u.email} | GithubID: {u.github_id}")

print("-" * 50)
print("DEBUG: Spaces")
spaces = db.query(Space).all()
for s in spaces:
    print(f"Space: {s.id} | Name: {s.name} | OwnerID: {s.owner_id}")

print("-" * 50)
print("DEBUG: Space Members")
members = db.query(SpaceMember).all()
for m in members:
    print(f"Member: Space {m.space_id} | User {m.user_id} | Role {m.role}")

print("-" * 50)
db.close()
