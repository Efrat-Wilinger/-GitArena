"""
📊 סקריפט להרצת ניתוח AI על כל הריפוזיטורים
ומילוי טבלת ai_feedback עם מדדי ביצועים
"""
import asyncio
import sys
from sqlalchemy.orm import Session
from app.shared.database import SessionLocal
from app.modules.ai.service import AIService
from app.shared.models import Repository, User, AIFeedback
from datetime import datetime

async def run_analysis_for_all_repos():
    """הרץ ניתוח על כל הריפוזיטורים שיש להם נתונים"""
    db: Session = SessionLocal()
    
    try:
        print("🔍 Searching for repositories with data...")
        
        # מצא את כל הריפוזיטורים
        repositories = db.query(Repository).all()
        
        if not repositories:
            print("❌ No repositories found in database")
            return
        
        print(f"📚 Found {len(repositories)} repositories\n")
        
        ai_service = AIService(db)
        total_analyzed = 0
        
        for repo in repositories:
            print(f"\n{'='*60}")
            print(f"📁 Repository: {repo.name} (ID: {repo.id})")
            print(f"{'='*60}")
            
            try:
                # הרץ ניתוח
                result = await ai_service.analyze_repository_team(repo.id)
                
                if result and 'developer_stats' in result:
                    num_devs = len(result['developer_stats'])
                    print(f"✅ Analysis completed for {num_devs} developers")
                    
                    # הצג מדדים של כל מפתח
                    for email, stats in result['developer_stats'].items():
                        print(f"\n   👤 {stats.get('name', 'Unknown')} ({email})")
                        print(f"      Commits: {stats.get('commits', 0)}")
                        print(f"      PRs: {stats.get('prs_created', 0)}")
                        print(f"      Reviews: {stats.get('reviews_given', 0)}")
                        print(f"      Performance Score: {stats.get('performance_score', 0)}")
                    
                    total_analyzed += num_devs
                else:
                    print(f"⚠️  No developer stats found")
                    
            except Exception as e:
                print(f"❌ Error analyzing repository {repo.name}: {e}")
                continue
        
        print(f"\n{'='*60}")
        print(f"✅ SUMMARY: Analyzed {total_analyzed} developers across {len(repositories)} repositories")
        print(f"{'='*60}\n")
        
        # הצג דוגמה מהנתונים שנשמרו
        print("📊 Sample of saved AI feedback:")
        recent_feedback = db.query(AIFeedback).filter(
            AIFeedback.feedback_type.in_(['team_analysis', 'auto_analysis'])
        ).order_by(AIFeedback.created_at.desc()).limit(5).all()
        
        for i, fb in enumerate(recent_feedback, 1):
            user = db.query(User).filter(User.id == fb.user_id).first()
            print(f"\n{i}. User: {user.username if user else 'Unknown'}")
            print(f"   Type: {fb.feedback_type}")
            print(f"   Code Quality: {fb.code_quality_score}")
            print(f"   Effort Score: {fb.effort_score}")
            print(f"   Velocity Score: {fb.velocity_score}")
            print(f"   Created: {fb.created_at}")
        
    except Exception as e:
        print(f"❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

def main():
    print("🚀 Starting AI Analysis...")
    print(f"⏰ Time: {datetime.now()}\n")
    
    # הרץ את הניתוח
    asyncio.run(run_analysis_for_all_repos())
    
    print("\n✅ Done!")

if __name__ == "__main__":
    main()
