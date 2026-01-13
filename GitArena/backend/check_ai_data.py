import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import pathlib

# Load environment variables
current_dir = pathlib.Path(__file__).parent.absolute()
env_path = current_dir.parent / ".env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

def check_ai_data():
    print("🤖 Checking AI Feedback Data...\n")
    
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        # Check ai_feedback table
        result = conn.execute(text("SELECT COUNT(*) FROM ai_feedback"))
        ai_count = result.scalar()
        
        print(f"📊 Total AI Feedback Entries: {ai_count}")
        
        if ai_count > 0:
            # Get recent AI feedback
            result = conn.execute(text("""
                SELECT 
                    id,
                    user_id,
                    feedback_type,
                    code_quality_score,
                    effort_score,
                    velocity_score,
                    created_at
                FROM ai_feedback
                ORDER BY created_at DESC
                LIMIT 10
            """))
            
            print(f"\n{'='*80}")
            print(f"Recent AI Analyses:")
            print(f"{'='*80}")
            
            for row in result:
                ai_id, user_id, fb_type, quality, effort, velocity, created = row
                print(f"\nID: {ai_id} | User: {user_id} | Type: {fb_type}")
                print(f"  Quality: {quality} | Effort: {effort} | Velocity: {velocity}")
                print(f"  Created: {created}")
        else:
            print("\n⚠️  No AI feedback found yet!")
            print("\n💡 To generate AI insights:")
            print("   1. Make sure OPENAI_API_KEY is set in .env")
            print("   2. Go to Profile page - AI Insights should appear")
            print("   3. Or trigger team analysis via API")

if __name__ == "__main__":
    check_ai_data()
