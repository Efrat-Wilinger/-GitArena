"""
Test sync for a single repository to see what error occurs
"""
import asyncio
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.orm import Session
from app.shared.database import get_db
from app.modules.github.service import GitHubService
from app.modules.users.repository import UserRepository
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

async def test_sync():
    print("🔍 Testing repository sync...\n")
    
    # Get database session
    db = next(get_db())
    
    try:
        # Get user with access token
        user_repo = UserRepository(db)
        user = user_repo.get_by_id(1)  # User ID 1 (Efrat-Wilinger)
        
        if not user:
            print("❌ User not found!")
            return
        
        if not user.access_token:
            print("❌ User has no access token!")
            print("   Please re-authenticate via GitHub OAuth")
            return
        
        print(f"✅ Found user: {user.username}")
        print(f"✅ Access token exists: {user.access_token[:20]}...")
        
        # Try to sync repositories
        print(f"\n📦 Attempting to sync repositories from GitHub...")
        github_service = GitHubService(db)
        
        try:
            repos = await github_service.sync_repositories(user.id, user.access_token)
            print(f"✅ Successfully synced {len(repos)} repositories!")
            
            for repo in repos[:5]:  # Show first 5
                print(f"   - {repo.name}")
            
        except Exception as e:
            print(f"❌ Sync failed with error:")
            print(f"   {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            return
        
        # Now try to sync commits for first repo
        if repos:
            first_repo = repos[0]
            print(f"\n💾 Attempting to sync commits for: {first_repo.name}")
            
            try:
                commits = await github_service.sync_commits(first_repo.id, user.access_token)
                print(f"✅ Successfully synced {len(commits)} commits!")
                
                if commits:
                    print(f"   Latest commit: {commits[0].message[:50]}...")
                
            except Exception as e:
                print(f"❌ Commit sync failed:")
                print(f"   {type(e).__name__}: {str(e)}")
                import traceback
                traceback.print_exc()
        
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_sync())
