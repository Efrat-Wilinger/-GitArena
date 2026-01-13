import sys
import os
sys.path.append(os.getcwd())
from app.shared.database import SessionLocal
from app.shared.models import User

db = SessionLocal()
try:
    users = db.query(User).all()
    print(f"Found {len(users)} users.")
    for user in users:
        token_status = "PRESENT" if user.access_token else "MISSING"
        # Print a masked version if present to verify it looks like a token
        masked_token = f"{user.access_token[:4]}...{user.access_token[-4:]}" if user.access_token else "N/A"
        print(f"User: {user.username} (ID: {user.id}) - GitHub Token: {token_status} ({masked_token})")
        print(f"      GitHub ID: {user.github_id}, Login: {user.github_login}")

except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
