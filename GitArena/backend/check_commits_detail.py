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
if not DATABASE_URL:
    print("❌ DATABASE_URL not found")
    sys.exit(1)

def detailed_check():
    output_lines = []
    def log(msg):
        print(msg)
        output_lines.append(msg)
    
    log(f"🔍 Detailed Repository & Commit Analysis\n")
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            # Get all repositories with commit counts
            query = text("""
                SELECT 
                    r.id,
                    r.name,
                    r.full_name,
                    r.user_id,
                    r.is_synced,
                    r.last_synced_at,
                    COUNT(c.id) as commit_count
                FROM repositories r
                LEFT JOIN commits c ON c.repository_id = r.id
                GROUP BY r.id, r.name, r.full_name, r.user_id, r.is_synced, r.last_synced_at
                ORDER BY commit_count DESC, r.name
            """)
            
            result = conn.execute(query)
            repos = result.fetchall()
            
            log(f"{'='*80}")
            log(f"{'Repo ID':<8} {'Name':<30} {'Commits':<10} {'Synced?':<10} {'Last Sync'}")
            log(f"{'='*80}")
            
            total_commits = 0
            repos_with_commits = 0
            
            for row in repos:
                repo_id, name, full_name, user_id, is_synced, last_sync, commit_count = row
                total_commits += commit_count
                if commit_count > 0:
                    repos_with_commits += 1
                
                sync_status = "✅ Yes" if is_synced else "❌ No"
                last_sync_str = str(last_sync)[:19] if last_sync else "Never"
                
                log(f"{repo_id:<8} {name[:28]:<30} {commit_count:<10} {sync_status:<10} {last_sync_str}")
            
            log(f"{'='*80}")
            log(f"\n📊 SUMMARY:")
            log(f"   Total Repositories: {len(repos)}")
            log(f"   Repositories with commits: {repos_with_commits}")
            log(f"   Repositories without commits: {len(repos) - repos_with_commits}")
            log(f"   Total Commits: {total_commits}")
            
            if total_commits == 0:
                log(f"\n⚠️  NO COMMITS FOUND IN DATABASE!")
                log(f"\n💡 SOLUTION:")
                log(f"   1. Make sure backend server is running with updated code")
                log(f"   2. Go to the app and click 'Sync All Stats' or 'Sync Repositories'")
                log(f"   3. This will fetch commits from GitHub for each repository")
            elif repos_with_commits < len(repos):
                log(f"\n⚠️  Some repositories have no commits!")
                log(f"   Try syncing again to fetch all data from GitHub")
            
            # Check spaces
            result = conn.execute(text("SELECT COUNT(*) FROM spaces"))
            space_count = result.scalar()
            log(f"\n🏢 Projects (Spaces): {space_count}")
            
            if space_count > 0:
                result = conn.execute(text("""
                    SELECT s.id, s.name, COUNT(r.id) as repo_count
                    FROM spaces s
                    LEFT JOIN repositories r ON r.space_id = s.id
                    GROUP BY s.id, s.name
                """))
                for row in result:
                    log(f"   - Project '{row[1]}' has {row[2]} repositories")
        
        # Save to file
        with open("db_analysis_report.txt", "w", encoding="utf-8") as f:
            f.write("\n".join(output_lines))
        log(f"\n✅ Report saved to: db_analysis_report.txt")

    except Exception as e:
        log(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    detailed_check()
