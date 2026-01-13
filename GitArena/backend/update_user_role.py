"""
Update user role to manager
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.config.settings import settings

def update_user_role():
    """Update user role to manager"""
    print("🔄 Updating user role...")
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        # Get current user - using partial match since we saw 'tzurde' in output
        result = conn.execute(text("SELECT id, username, role FROM users WHERE username LIKE 'tzurde%'"))
        user = result.first()
        
        if user:
            print(f"📊 Current user: {user.username}, role: {user.role}")
            
            # Update to manager
            conn.execute(text("UPDATE users SET role = 'manager' WHERE id = :user_id"), {"user_id": user.id})
            conn.commit()
            print(f"✅ Updated user role to 'manager'")
            
            # Also update project membership
            conn.execute(text("""
                UPDATE space_members 
                SET role = 'manager' 
                WHERE user_id = :user_id
            """), {"user_id": user.id})
            conn.commit()
            print(f"✅ Updated project membership to 'manager'")
        else:
            print("❌ User not found")

if __name__ == "__main__":
    try:
        update_user_role()
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
