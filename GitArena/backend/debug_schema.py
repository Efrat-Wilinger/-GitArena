import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.shared.database import SessionLocal
from sqlalchemy import text

def check_schema():
    db = SessionLocal()
    print("\n--- SCHEMA CHECK (v2) ---\n")
    
    tables = ['repositories', 'spaces']
    
    for table in tables:
        print(f"checking table: {table}")
        try:
            result = db.execute(text(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table}'"))
            columns = sorted([row[0] for row in result])
            print(f"Columns in '{table}':")
            for col in columns:
                print(f"  - {col}")
        except Exception as e:
            print(f"  Error checking schema for {table}: {e}")
        print("-" * 20)
            
    db.close()

if __name__ == "__main__":
    check_schema()
