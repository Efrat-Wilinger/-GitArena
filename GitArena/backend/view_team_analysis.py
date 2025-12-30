"""
🔍 סקריפט להצגת ניתוחי הצוות מטבלת ai_feedback
"""

import psycopg2
import json
from datetime import datetime
from tabulate import tabulate

# הגדרות חיבור
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'gitarena',
    'user': 'postgres',
    'password': 'postgres'
}

def connect_db():
    """התחברות למסד הנתונים"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"❌ שגיאה בהתחברות: {e}")
        return None

def show_all_analyses():
    """הצגת כל הניתוחים"""
    conn = connect_db()
    if not conn:
        return
    
    cursor = conn.cursor()
    
    query = """
    SELECT 
        af.id,
        u.username,
        u.email,
        r.name as repo_name,
        af.created_at,
        (af.meta_data->>'performance_score')::float as score,
        af.meta_data->>'is_best_performer' as is_best
    FROM ai_feedback af
    JOIN users u ON u.id = af.user_id
    JOIN repositories r ON r.id = af.repository_id
    WHERE af.feedback_type = 'team_analysis'
    ORDER BY af.created_at DESC;
    """
    
    cursor.execute(query)
    results = cursor.fetchall()
    
    if results:
        print("\n" + "="*80)
        print("📊 כל ניתוחי הצוות")
        print("="*80 + "\n")
        
        headers = ["ID", "Username", "Email", "Repository", "Date", "Score", "Best?"]
        table_data = []
        
        for row in results:
            table_data.append([
                row[0],
                row[1],
                row[2][:30] + "..." if len(row[2]) > 30 else row[2],
                row[3],
                row[4].strftime("%Y-%m-%d %H:%M"),
                f"{row[5]:.2f}",
                "🏆 כן" if row[6] == 'true' else "לא"
            ])
        
        print(tabulate(table_data, headers=headers, tablefmt="grid"))
    else:
        print("\n⚠️  אין ניתוחים בטבלה עדיין")
    
    cursor.close()
    conn.close()

def show_best_performers():
    """הצגת העובדים המצטיינים בלבד"""
    conn = connect_db()
    if not conn:
        return
    
    cursor = conn.cursor()
    
    query = """
    SELECT 
        u.username,
        u.email,
        r.name as repo_name,
        (af.meta_data->>'performance_score')::float as score,
        af.content->>'improvement_suggestions' as suggestions,
        af.created_at
    FROM ai_feedback af
    JOIN users u ON u.id = af.user_id
    JOIN repositories r ON r.id = af.repository_id
    WHERE af.feedback_type = 'team_analysis'
      AND af.meta_data->>'is_best_performer' = 'true'
    ORDER BY (af.meta_data->>'performance_score')::float DESC;
    """
    
    cursor.execute(query)
    results = cursor.fetchall()
    
    if results:
        print("\n" + "="*80)
        print("🏆 העובדים המצטיינים")
        print("="*80 + "\n")
        
        for i, row in enumerate(results, 1):
            print(f"\n{i}. {row[0]} ({row[1]})")
            print(f"   Repository: {row[2]}")
            print(f"   Score: {row[3]:.2f}")
            print(f"   Date: {row[5].strftime('%Y-%m-%d %H:%M')}")
            print(f"   AI Suggestions: {row[4][:100]}..." if len(row[4]) > 100 else f"   AI Suggestions: {row[4]}")
            print("-" * 80)
    else:
        print("\n⚠️  לא נמצאו עובדים מצטיינים")
    
    cursor.close()
    conn.close()

def show_latest_analysis():
    """הצגת הניתוח האחרון"""
    conn = connect_db()
    if not conn:
        return
    
    cursor = conn.cursor()
    
    query = """
    SELECT 
        r.name as repo_name,
        af.content,
        af.created_at
    FROM ai_feedback af
    JOIN repositories r ON r.id = af.repository_id
    WHERE af.feedback_type = 'team_analysis'
    ORDER BY af.created_at DESC
    LIMIT 1;
    """
    
    cursor.execute(query)
    result = cursor.fetchone()
    
    if result:
        print("\n" + "="*80)
        print("🔍 הניתוח האחרון")
        print("="*80 + "\n")
        
        print(f"Repository: {result[0]}")
        print(f"Date: {result[2].strftime('%Y-%m-%d %H:%M')}")
        print("\n" + "-"*80)
        
        content = json.loads(result[1]) if isinstance(result[1], str) else result[1]
        
        print("\n📊 Team Health:")
        print(content.get('team_health', 'N/A'))
        
        print("\n🏆 Top Performer Analysis:")
        print(content.get('top_performer_analysis', 'N/A'))
        
        print("\n🤝 Collaboration Insights:")
        print(content.get('collaboration_insights', 'N/A'))
        
        print("\n💡 Improvement Suggestions:")
        suggestions = content.get('improvement_suggestions', {})
        for email, suggestion in suggestions.items():
            print(f"\n  • {email}:")
            print(f"    {suggestion}")
        
        print("\n" + "="*80)
    else:
        print("\n⚠️  לא נמצא ניתוח")
    
    cursor.close()
    conn.close()

def show_stats():
    """סטטיסטיקות כלליות"""
    conn = connect_db()
    if not conn:
        return
    
    cursor = conn.cursor()
    
    # כמות ניתוחים
    cursor.execute("""
        SELECT COUNT(*) FROM ai_feedback 
        WHERE feedback_type = 'team_analysis'
    """)
    total_analyses = cursor.fetchone()[0]
    
    # כמות עובדים מצטיינים
    cursor.execute("""
        SELECT COUNT(*) FROM ai_feedback 
        WHERE feedback_type = 'team_analysis'
          AND meta_data->>'is_best_performer' = 'true'
    """)
    best_performers = cursor.fetchone()[0]
    
    # ממוצע ציונים
    cursor.execute("""
        SELECT AVG((meta_data->>'performance_score')::float) 
        FROM ai_feedback 
        WHERE feedback_type = 'team_analysis'
    """)
    avg_score = cursor.fetchone()[0]
    
    print("\n" + "="*80)
    print("📈 סטטיסטיקות")
    print("="*80 + "\n")
    print(f"כמות ניתוחים כוללת: {total_analyses}")
    print(f"כמות עובדים מצטיינים: {best_performers}")
    print(f"ציון ממוצע: {avg_score:.2f}" if avg_score else "ציון ממוצע: N/A")
    print("="*80 + "\n")
    
    cursor.close()
    conn.close()

def main():
    """תפריט ראשי"""
    print("\n" + "="*80)
    print("🤖 מערכת ניתוח ביצועי צוות - GPT-4")
    print("="*80)
    
    while True:
        print("\nבחר אופציה:")
        print("1. הצג את כל הניתוחים")
        print("2. הצג עובדים מצטיינים בלבד")
        print("3. הצג את הניתוח האחרון (מפורט)")
        print("4. הצג סטטיסטיקות")
        print("5. יציאה")
        
        choice = input("\nבחירה (1-5): ").strip()
        
        if choice == '1':
            show_all_analyses()
        elif choice == '2':
            show_best_performers()
        elif choice == '3':
            show_latest_analysis()
        elif choice == '4':
            show_stats()
        elif choice == '5':
            print("\n👋 להתראות!")
            break
        else:
            print("\n❌ בחירה לא תקינה")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 להתראות!")
    except Exception as e:
        print(f"\n❌ שגיאה: {e}")
