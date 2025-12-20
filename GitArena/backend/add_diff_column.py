from app.shared.database import engine
from sqlalchemy import text

def add_diff_data_column():
    print("Checking for diff_data column in commits table...")
    with engine.connect() as conn:
        try:
            # Check if column exists
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='commits' AND column_name='diff_data';"))
            if not result.fetchone():
                print("Column 'diff_data' not found. Adding it...")
                conn.execute(text("ALTER TABLE commits ADD COLUMN diff_data JSONB;"))
                conn.commit()
                print("Successfully added 'diff_data' column to 'commits' table.")
            else:
                print("Column 'diff_data' already exists.")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    add_diff_data_column()
