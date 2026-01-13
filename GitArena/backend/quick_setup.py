"""
🚀 Quick Setup - Run This Once
"""
import subprocess
import sys
import time

def run_step(step_name, command, cwd="."):
    """Run a single step"""
    print(f"\n{'='*60}")
    print(f"  {step_name}")
    print(f"{'='*60}\n")
    
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=120
        )
        
        print(result.stdout)
        if result.stderr:
            print("Warnings/Errors:", result.stderr)
        
        if result.returncode == 0:
            print(f"✅ {step_name} - Success!")
            return True
        else:
            print(f"⚠️  {step_name} - Warning (but continuing...)")
            return False
    except Exception as e:
        print(f"❌ {step_name} - Error: {e}")
        return False

def main():
    print("""
    ╔══════════════════════════════════════╗
    ║   AI Performance Quick Setup 🚀      ║
    ╚══════════════════════════════════════╝
    """)
    
    backend_dir = "."
    
    # Step 1: Migration
    print("\n[Step 1/2] Running database migration...")
    success1 = run_step(
        "Database Migration",
        f"{sys.executable} run_migration.py",
        backend_dir
    )
    
    time.sleep(2)
    
    # Step 2: Generate insights
    print("\n[Step 2/2] Generating AI insights...")
    success2 = run_step(
        "AI Insights Generation",
        f"{sys.executable} generate_ai_insights.py",
        backend_dir
    )
    
    # Summary
    print("\n" + "="*60)
    print("  SETUP SUMMARY")
    print("="*60)
    print(f"Migration:        {'✅ Success' if success1 else '❌ Failed'}")
    print(f"Insights:         {'✅ Success' if success2 else '❌ Failed'}")
    print("="*60)
    
    if success1:
        print("""
        ✅ Setup Complete!
        
        Next steps:
        1. Make sure your backend is running
        2. Start frontend: cd frontend && npm run dev
        3. Open: http://localhost:5173
        4. Go to Dashboard - you'll see the metrics!
        """)
    else:
        print("""
        ⚠️  Setup incomplete. Check errors above.
        """)

if __name__ == "__main__":
    main()
