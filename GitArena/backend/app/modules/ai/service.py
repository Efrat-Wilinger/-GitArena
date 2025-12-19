from sqlalchemy.orm import Session
from app.modules.ai.repository import AIRepository
from app.modules.ai.dto import AIFeedbackResponse
from app.config.settings import settings
from typing import Optional


class AIService:
    def __init__(self, db: Session):
        self.repository = AIRepository(db)
    
    async def generate_insights(self, user_id: int) -> list:
        """
        Generate AI insights based on user developer activity
        """
        import json
        from openai import AsyncOpenAI
        from datetime import datetime, timedelta
        from app.shared.models import Commit, PullRequest
        
        if not settings.OPENAI_API_KEY:
            # Fallback to mock data if no API key
            return [
                {"type": "info", "title": "Developer Pulse", "description": "You are maintaining a steady pace of contributions.", "metric": "Stable", "trend": "up"}
            ]

        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        
        # 1. Gather data (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        commits = self.db.query(Commit).filter(
            Commit.repository.has(user_id=user_id),
            Commit.committed_date >= thirty_days_ago
        ).limit(50).all()
        
        if not commits:
            return [{"type": "info", "title": "Welcome!", "description": "Start contributing to see your AI-powered insights here.", "metric": "0", "trend": None}]

        # 2. Prepare context
        activity_summary = f"User has {len(commits)} commits in the last 30 days. "
        recent_messages = "\n".join([c.message for c in commits[:10]])
        
        prompt = f"""
Analyze this developer's activity and provide 3-4 professional, data-driven insights.
Activity Summary: {activity_summary}
Recent Commit Messages:
{recent_messages}

Return ONLY a JSON list of objects with this format:
[
  {{
    "type": "positive" | "warning" | "info",
    "title": "Short catchy title",
    "description": "Insight description (1 sentence)",
    "metric": "Relevant metric (e.g. 92% or 4.2h)",
    "trend": "up" | "down" | null
  }}
]
"""

        try:
            response = await client.chat.completions.create(
                model="gpt-4o-mini", # Using mini for efficiency
                messages=[
                    {"role": "system", "content": "You are an expert engineering manager and data analyst."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"} if "gpt-4o" in settings.OPENAI_MODEL else None
            )
            
            content = response.choices[0].message.content
            # Some models wrap in ```json ... ```
            if content.startswith("```json"):
                content = content.replace("```json", "").replace("```", "").strip()
            
            data = json.loads(content)
            # If the response is wrapped in an object like {"insights": [...]}
            if isinstance(data, dict) and "insights" in data:
                return data["insights"]
            return data if isinstance(data, list) else [data]
            
        except Exception as e:
            print(f"AI Insights Error: {e}")
            return [{"type": "info", "title": "Analysis Pending", "description": "We are processing your activity. Check back soon.", "metric": "N/A", "trend": None}]

    async def generate_code_review(self, code: str, context: Optional[str] = None) -> AIFeedbackResponse:
        """
        Generate AI code review feedback using OpenAI
        """
        from openai import AsyncOpenAI
        
        if not settings.OPENAI_API_KEY:
            return AIFeedbackResponse(
                feedback="OpenAI API key missing. Please configure it in settings.",
                confidence=0.0
            )

        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        
        prompt = f"""
Review the following code and provide constructive feedback.
Context: {context if context else 'No additional context provided.'}

Code:
```
{code}
```

Focus on: code quality, performance, security, and best practices.
Keep it concise.
"""

        try:
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert senior software engineer and security auditor."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2
            )
            
            return AIFeedbackResponse(
                feedback=response.choices[0].message.content,
                confidence=0.9
            )
        except Exception as e:
            return AIFeedbackResponse(
                feedback=f"Failed to generate review: {str(e)}",
                confidence=0.0
            )
    
    async def generate_embeddings(self, text: str) -> list:
        """
        Generate embeddings for text
        Placeholder implementation for Sprint 1
        """
        # TODO: Integrate with OpenAI embeddings API
        return []
    
    def store_feedback(self, user_id: int, feedback_type: str, content: str, **kwargs):
        """Store AI feedback in database"""
        return self.repository.create_feedback(
            user_id=user_id,
            feedback_type=feedback_type,
            content=content,
            **kwargs
        )
