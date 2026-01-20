import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

load_dotenv('.env', override=True)
DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:newpassword123@127.0.0.1:5435/gitarena")

from app.shared.models import User, Repository

def main():
    engine = create_engine(DB_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    user = db.query(User).filter(User.username == "Efrat-Wilinger").first()
    if not user:
        print("User not found")
        return
        
    repos = db.query(Repository).filter(Repository.user_id == user.id).all()
    print(f"Total repos for {user.username}: {len(repos)}")
    
    unlinked = [r for r in repos if r.space_id is None]
    linked = [r for r in repos if r.space_id is not None]
    
    print(f"Linked: {len(linked)}")
    print(f"Unlinked: {len(unlinked)}")
    
    if unlinked:
        print("\nUnlinked Repos:")
        for r in unlinked:
            print(f"  - {r.full_name} (ID: {r.id})")
    
    if linked:
        print("\nLinked Repos Sample:")
        for r in linked[:5]:
            print(f"  - {r.full_name} (Linked to Space ID: {r.space_id})")

if __name__ == "__main__":
    main()
