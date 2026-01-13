"""
Script to fix NULL created_at values in the users table.

This script updates any user records where created_at is NULL
to set it to the current timestamp.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os
from datetime import datetime

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/gitarena")

def fix_user_created_at():
    """Update NULL created_at values in users table"""
    
    # Create engine and session
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Check how many users have NULL created_at
        result = session.execute(
            text("SELECT COUNT(*) FROM users WHERE created_at IS NULL")
        )
        null_count = result.scalar()
        
        print(f"Found {null_count} users with NULL created_at")
        
        if null_count == 0:
            print("✓ All users have created_at values. No action needed.")
            return
        
        # Update NULL created_at to current timestamp
        result = session.execute(
            text("""
                UPDATE users 
                SET created_at = NOW() 
                WHERE created_at IS NULL
            """)
        )
        
        session.commit()
        
        print(f"✓ Updated {result.rowcount} user records with current timestamp")
        
        # Also update updated_at if it's NULL
        result = session.execute(
            text("SELECT COUNT(*) FROM users WHERE updated_at IS NULL")
        )
        null_updated_count = result.scalar()
        
        if null_updated_count > 0:
            print(f"Found {null_updated_count} users with NULL updated_at")
            result = session.execute(
                text("""
                    UPDATE users 
                    SET updated_at = NOW() 
                    WHERE updated_at IS NULL
                """)
            )
            session.commit()
            print(f"✓ Updated {result.rowcount} user records with current timestamp for updated_at")
        
    except Exception as e:
        print(f"✗ Error: {e}")
        session.rollback()
        raise
    finally:
        session.close()

if __name__ == "__main__":
    print("Fixing NULL created_at values in users table...")
    fix_user_created_at()
    print("\n✓ Done!")
