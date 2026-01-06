import sys
from pathlib import Path
import asyncio

# Add 'backend' to sys.path
current_dir = Path(__file__).resolve().parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

# Import specific modules to patch configuration
from app.config.settings import settings

print(f"Loaded Settings. DATABASE_URL host suffix: ...@{settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else 'UNKNOWN'}")

# Patch DATABASE_URL for local execution
patched_url = settings.DATABASE_URL
if "@db:" in patched_url:
    print("Patching DATABASE_URL: replacing 'db' with 'localhost'")
    patched_url = patched_url.replace("@db:", "@localhost:")
elif "localhost" not in patched_url and "127.0.0.1" not in patched_url:
     # Fallback: if we can't detect 'db', maybe we need to force localhost if it looks like a standard postgres url
     print("Warning: URL doesn't look like docker internal 'db', but continuing with it.")

# Manually create engine and session to ensure we use the patched URL
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine(patched_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Import models service
from app.modules.analytics.service import AnalyticsService
from app.shared.models import User, Space, Repository

async def debug_analytics():
    db = SessionLocal()
    try:
        print("Attempting database connection...")
        # Get first user
        user = db.query(User).first()
        if not user:
            print("No users found")
            return

        print(f"Debugging for user: {user.username} (ID: {user.id})")
        
        service = AnalyticsService(db)
        
        # Check Spaces
        space_ids = service._get_user_team_space_ids(user.id)
        print(f"Space IDs: {space_ids}")
        
        spaces = db.query(Space).filter(Space.id.in_(space_ids)).all() if space_ids else []
        for s in spaces:
            print(f"Space: {s.name} (ID: {s.id})")
            for r in s.repositories:
                print(f"  - Repo: {r.name} (ID: {r.id})")
                
        # Check Manager Stats
        print("\n--- Manager Stats ---")
        stats = service.get_manager_stats(user.id)
        # Handle dict response
        if isinstance(stats, dict):
            print(f"Activity (This Week): {len(stats.get('activity', []))} days")
            print(f"Recent Commits: {len(stats.get('recentCommits', []))}")
            print(f"PR Stats: {stats.get('prStats')}")
        else:
             print(f"Stats result is not a dict: {type(stats)}")
        
        # Check Deep Dive
        print("\n--- Analytics Report (Deep Dive) ---")
        report = service.get_manager_deep_dive_analytics(user.id, timeRange="30days")
        trend = report.get('commitTrend', [])
        print(f"Commit Trend Points: {len(trend)}")
        if trend:
            print(f"First point: {trend[0]}")
            print(f"Last point: {trend[-1]}")
            
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(debug_analytics())
