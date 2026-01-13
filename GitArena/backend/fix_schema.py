import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.shared.database import SessionLocal
from sqlalchemy import text

def fix_schema():
    db = SessionLocal()
    print("\n--- FIXING SCHEMA ---\n")
    
    # Columns to add to 'repositories' table
    # format: (column_name, type_def)
    columns_to_add = [
        ('language', 'VARCHAR'),
        ('stargazers_count', 'INTEGER DEFAULT 0'),
        ('forks_count', 'INTEGER DEFAULT 0')
    ]
    
    for col_name, col_type in columns_to_add:
        try:
            print(f"Adding column '{col_name}'...")
            db.execute(text(f"ALTER TABLE repositories ADD COLUMN IF NOT EXISTS {col_name} {col_type}"))
            db.commit()
            print("  Done.")
        except Exception as e:
            print(f"  Error adding {col_name}: {e}")
            db.rollback()

    db.close()
    print("\nSchema fix completed.")

if __name__ == "__main__":
    fix_schema()
