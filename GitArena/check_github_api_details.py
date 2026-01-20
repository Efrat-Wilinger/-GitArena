import os
import httpx
import logging
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv('.env', override=True)

# We need the user's token from the DB to test what GitHub sees
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from app.shared.models import User

DB_URL = "postgresql://postgres:newpassword123@127.0.0.1:5435/gitarena"

async def check_scopes():
    engine = create_engine(DB_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    user = db.query(User).filter(User.username == "Efrat-Wilinger").first()
    
    if not user or not user.access_token:
        print("User or token not found in DB")
        return

    async with httpx.AsyncClient() as client:
        # 1. Check User Info & Scopes
        resp = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {user.access_token}"}
        )
        scopes = resp.headers.get("X-OAuth-Scopes", "")
        print(f"User: {resp.json().get('login')}")
        print(f"Scopes: {scopes}")
        
        # 2. Check Orgs
        orgs_resp = await client.get(
            "https://api.github.com/user/orgs",
            headers={"Authorization": f"Bearer {user.access_token}"}
        )
        orgs = [o["login"] for o in orgs_resp.json()] if orgs_resp.status_code == 200 else []
        print(f"Organizations: {orgs}")
        
        # 3. Fetch Repos (Detailed count)
        repos_resp = await client.get(
            "https://api.github.com/user/repos",
            headers={"Authorization": f"Bearer {user.access_token}"},
            params={"per_page": 100, "affiliation": "owner,collaborator,organization_member"}
        )
        repos = repos_resp.json()
        print(f"Total Repos Accessible via current token: {len(repos)}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(check_scopes())
