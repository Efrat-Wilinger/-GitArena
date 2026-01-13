"""
Test if AI is working by calling the insights endpoint
"""
import asyncio
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.orm import Session
from app.shared.database import get_db
from app.modules.ai.service import AIService
from app.config.settings import settings
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

async def test_ai():
    print("🤖 Testing AI Functionality...\n")
    
    # Check if OpenAI API key is set
    if not settings.OPENAI_API_KEY:
        print("❌ OPENAI_API_KEY is NOT set!")
        print("   AI will use fallback/mock data")
        print("\n💡 To enable real AI:")
        print("   1. Get an OpenAI API key from https://platform.openai.com/api-keys")
        print("   2. Add to .env file: OPENAI_API_KEY=sk-...")
        print("   3. Restart the backend server")
        has_key = False
    else:
        print(f"✅ OPENAI_API_KEY is set: {settings.OPENAI_API_KEY[:20]}...")
        print(f"✅ Model: {settings.OPENAI_MODEL}")
        has_key = True
    
    # Get database session
    db = next(get_db())
    
    try:
        # Test AI Insights for user 1
        print(f"\n🔍 Testing AI Insights for User ID 1...")
        ai_service = AIService(db)
        
        insights = await ai_service.generate_insights(user_id=1)
        
        print(f"\n✅ AI Insights generated successfully!")
        print(f"   Number of insights: {len(insights)}")
        
        for i, insight in enumerate(insights, 1):
            print(f"\n   Insight {i}:")
            print(f"      Type: {insight.get('type', 'N/A')}")
            print(f"      Title: {insight.get('title', 'N/A')}")
            print(f"      Description: {insight.get('description', 'N/A')[:60]}...")
            if insight.get('metric'):
                print(f"      Metric: {insight.get('metric')}")
        
        if has_key:
            print(f"\n🎉 AI is working with OpenAI API!")
        else:
            print(f"\n⚠️  AI is working with fallback data (no API key)")
        
        print(f"\n📍 Where to see this in the app:")
        print(f"   1. Go to http://localhost:3000")
        print(f"   2. Login and go to Profile page")
        print(f"   3. Look for 'AI Insights' section with 🤖 icon")
        
    except Exception as e:
        print(f"\n❌ AI test failed:")
        print(f"   {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_ai())
