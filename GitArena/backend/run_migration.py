"""
🔧 סקריפט להרצת migration ועדכון טבלת ai_feedback
"""
import sys
from sqlalchemy import create_engine, text, inspect
from app.config.settings import settings

def run_migration():
    """הרץ migration ידנית"""
    print("🔄 Starting migration...")
    
    engine = create_engine(settings.DATABASE_URL)
    
    # רשימת העמודות שצריך להוסיף
    new_columns = [
        ("code_quality_score", "FLOAT"),
        ("code_volume", "INTEGER"),
        ("effort_score", "FLOAT"),
        ("velocity_score", "FLOAT"),
        ("consistency_score", "FLOAT"),
        ("improvement_areas", "JSON"),
        ("strengths", "JSON")
    ]
    
    with engine.connect() as conn:
        # בדוק אילו עמודות כבר קיימות
        inspector = inspect(engine)
        existing_columns = [col['name'] for col in inspector.get_columns('ai_feedback')]
        
        print(f"📊 Existing columns in ai_feedback: {existing_columns}")
        
        # הוסף רק עמודות שלא קיימות
        for col_name, col_type in new_columns:
            if col_name not in existing_columns:
                print(f"➕ Adding column: {col_name} ({col_type})")
                try:
                    if col_type == "JSON":
                        conn.execute(text(f"ALTER TABLE ai_feedback ADD COLUMN {col_name} JSON"))
                    else:
                        conn.execute(text(f"ALTER TABLE ai_feedback ADD COLUMN {col_name} {col_type}"))
                    conn.commit()
                    print(f"   ✅ Added {col_name}")
                except Exception as e:
                    print(f"   ⚠️  Column {col_name} might already exist: {e}")
            else:
                print(f"   ⏭️  Column {col_name} already exists, skipping")
        
        print("\n✅ Migration completed successfully!")
        
        # הצג את כל העמודות
        inspector = inspect(engine)
        final_columns = [col['name'] for col in inspector.get_columns('ai_feedback')]
        print(f"\n📋 Final columns in ai_feedback:")
        for col in final_columns:
            print(f"   - {col}")

if __name__ == "__main__":
    try:
        run_migration()
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
