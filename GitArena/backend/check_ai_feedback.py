"""
סקריפט פשוט לבדיקת טבלת ai_feedback
"""

import psycopg2
import json
from datetime import datetime

# התחבר ל-PostgreSQL
try:
    conn = psycopg2.connect(
        host='localhost',
        port=5432,
        database='gitarena',
        user='postgres',
        password='postgres'
    )
    print("✅ התחברות למסד הנתונים הצליחה!\n")
    
    cursor = conn.cursor()
    
    # ספור כמה רשומות יש
    cursor.execute("""
        SELECT COUNT(*) FROM ai_feedback 
        WHERE feedback_type = 'team_analysis'
    """)
    count = cursor.fetchone()[0]
    
    print("="*80)
    print(f"📊 כמות ניתוחי צוות בטבלה: {count}")
    print("="*80)
    
    if count == 0:
        print("\n⚠️  הטבלה ריקה! עדיין לא הרצת ניתוח.")
        print("\n📝 כדי למלא את הטבלה:")
        print("1. עבור ל-http://localhost:3000")
        print("2. לחץ על Repositories")
        print("3. לחץ על כפתור 🤖 TEAM")
        print("4. לחץ Generate Analysis")
        print("5. המתן 20-40 שניות")
        print("6. הרץ סקריפט זה שוב!\n")
    else:
        # הצג את הניתוחים
        cursor.execute("""
            SELECT 
                af.id,
                u.username,
                u.email,
                r.name as repo_name,
                af.content,
                af.meta_data,
                af.created_at
            FROM ai_feedback af
            LEFT JOIN users u ON u.id = af.user_id
            LEFT JOIN repositories r ON r.id = af.repository_id
            WHERE af.feedback_type = 'team_analysis'
            ORDER BY af.created_at DESC
            LIMIT 10
        """)
        
        results = cursor.fetchall()
        
        print(f"\n📋 מציג {min(count, 10)} ניתוחים אחרונים:\n")
        
        for i, row in enumerate(results, 1):
            print(f"\n{'='*80}")
            print(f"ניתוח #{i}")
            print(f"{'='*80}")
            print(f"ID: {row[0]}")
            print(f"Username: {row[1] or 'N/A'}")
            print(f"Email: {row[2] or 'N/A'}")
            print(f"Repository: {row[3] or 'N/A'}")
            print(f"תאריך: {row[6]}")
            
            # Parse content
            content = json.loads(row[4]) if isinstance(row[4], str) else row[4]
            meta_data = json.loads(row[5]) if isinstance(row[5], str) else row[5]
            
            # הצג מידע חשוב
            print(f"\n📊 סטטיסטיקות:")
            if 'stats' in content:
                stats = content['stats']
                print(f"  • Commits: {stats.get('commits', 'N/A')}")
                print(f"  • PRs Created: {stats.get('prs_created', 'N/A')}")
                print(f"  • PRs Merged: {stats.get('prs_merged', 'N/A')}")
                print(f"  • Reviews Given: {stats.get('reviews_given', 'N/A')}")
                print(f"  • Performance Score: {stats.get('performance_score', 'N/A')}")
            
            # האם זה העובד המצטיין?
            is_best = meta_data.get('is_best_performer', False)
            print(f"\n🏆 עובד מצטיין: {'כן! 🎉' if is_best else 'לא'}")
            
            # המלצות
            if 'improvement_suggestions' in content:
                suggestions = content['improvement_suggestions']
                print(f"\n💡 המלצות לשיפור:")
                if isinstance(suggestions, str):
                    print(f"  {suggestions[:150]}...")
                else:
                    print(f"  {str(suggestions)[:150]}...")
        
        print(f"\n{'='*80}")
        print(f"✅ הטבלה מתמלאת כמו שצריך!")
        print(f"{'='*80}\n")
    
    cursor.close()
    conn.close()
    
except psycopg2.OperationalError as e:
    print(f"❌ שגיאת חיבור: {e}")
    print("\n💡 ודא ש-Docker רץ:")
    print("   docker-compose ps")
    print("\n   אם DB לא רץ:")
    print("   docker-compose up -d db")
    
except Exception as e:
    print(f"❌ שגיאה: {e}")
    import traceback
    traceback.print_exc()
