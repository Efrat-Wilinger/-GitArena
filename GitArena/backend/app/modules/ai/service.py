from sqlalchemy.orm import Session
from app.modules.ai.repository import AIRepository
from app.modules.ai.dto import AIFeedbackResponse
from app.config.settings import settings
from typing import Optional


class AIService:
    def __init__(self, db: Session):
        self.db = db
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
        
        # Use repository's db session to be safe
        db = getattr(self, 'db', None) or self.repository.db
        
        commits = db.query(Commit).filter(
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
    
    async def analyze_repository_team(self, repository_id: int) -> dict:
        """
        Analyze all team members' performance in a repository
        Returns analysis with best performer, insights, and improvement points
        Saves results to ai_feedback table
        """
        from datetime import datetime, timedelta
        from app.shared.models import Commit, PullRequest, Review, User, Repository, AIFeedback
        from sqlalchemy import func
        import json
        from openai import AsyncOpenAI
        
        # Get repository
        repository = self.db.query(Repository).filter(Repository.id == repository_id).first()
        if not repository:
            return {"error": "Repository not found"}
        
        # Analyze activity from the last 90 days
        ninety_days_ago = datetime.utcnow() - timedelta(days=90)
        
        # Gather commits by author
        commits = self.db.query(Commit).filter(
            Commit.repository_id == repository_id,
            Commit.committed_date >= ninety_days_ago
        ).all()
        
        # Gather PRs
        prs = self.db.query(PullRequest).filter(
            PullRequest.repository_id == repository_id,
            PullRequest.created_at >= ninety_days_ago
        ).all()
        
        # Gather reviews
        reviews = self.db.query(Review).filter(
            Review.submitted_at >= ninety_days_ago
        ).join(PullRequest).filter(PullRequest.repository_id == repository_id).all()
        
        # Aggregate statistics by developer
        developer_stats = {}
        
        # Process commits
        for commit in commits:
            email = commit.author_email
            if email not in developer_stats:
                developer_stats[email] = {
                    "name": commit.author_name,
                    "email": email,
                    "commits": 0,
                    "additions": 0,
                    "deletions": 0,
                    "files_changed": 0,
                    "prs_created": 0,
                    "prs_merged": 0,
                    "reviews_given": 0,
                    "reviews_approved": 0
                }
            
            developer_stats[email]["commits"] += 1
            developer_stats[email]["additions"] += commit.additions or 0
            developer_stats[email]["deletions"] += commit.deletions or 0
            developer_stats[email]["files_changed"] += commit.files_changed or 0
        
        # Process PRs
        for pr in prs:
            # Map by author (username)
            author_key = None
            for key, stats in developer_stats.items():
                if stats["name"] == pr.author or stats["email"].split("@")[0] == pr.author:
                    author_key = key
                    break
            
            if author_key:
                developer_stats[author_key]["prs_created"] += 1
                if pr.state == "merged":
                    developer_stats[author_key]["prs_merged"] += 1
        
        # Process reviews
        for review in reviews:
            reviewer_key = None
            for key, stats in developer_stats.items():
                if stats["name"] == review.reviewer or stats["email"].split("@")[0] == review.reviewer:
                    reviewer_key = key
                    break
            
            if reviewer_key:
                developer_stats[reviewer_key]["reviews_given"] += 1
                if review.state == "approved":
                    developer_stats[reviewer_key]["reviews_approved"] += 1
        
        # Calculate performance scores
        for email, stats in developer_stats.items():
            # Weighted score calculation
            score = (
                stats["commits"] * 1.0 +
                stats["prs_merged"] * 3.0 +
                stats["reviews_given"] * 2.0 +
                (stats["additions"] + stats["deletions"]) * 0.001
            )
            stats["performance_score"] = round(score, 2)
        
        # Find best performer
        best_performer = max(developer_stats.values(), key=lambda x: x["performance_score"]) if developer_stats else None
        
        # Generate AI insights using OpenAI
        analysis_data = {
            "repository": repository.name,
            "period": "Last 90 days",
            "total_developers": len(developer_stats),
            "best_performer": best_performer,
            "all_stats": developer_stats
        }
        
        ai_insights = {}
        if settings.OPENAI_API_KEY and developer_stats:
            try:
                client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
                
                # Create summary for AI
                summary = f"""
Repository: {repository.name}
Period: Last 90 days
Number of Developers: {len(developer_stats)}

Developer Statistics:
"""
                for email, stats in developer_stats.items():
                    summary += f"\n{stats['name']} ({email}):\n"
                    summary += f"  - Commits: {stats['commits']}\n"
                    summary += f"  - PRs Created: {stats['prs_created']}, Merged: {stats['prs_merged']}\n"
                    summary += f"  - Reviews Given: {stats['reviews_given']}, Approved: {stats['reviews_approved']}\n"
                    summary += f"  - Code Changes: +{stats['additions']} / -{stats['deletions']}\n"
                    summary += f"  - Performance Score: {stats['performance_score']}\n"
                
                prompt = f"""{summary}

Analyze this team's performance with deep insights and provide:

1. **Overall Team Health Assessment**: Evaluate the team's productivity, collaboration quality, and development velocity. Consider the distribution of work and engagement levels.

2. **Top Performer Analysis**: Identify why the top performer excels. Analyze their contribution patterns, collaboration style, code quality indicators, and leadership in code reviews.

3. **Specific Improvement Suggestions**: For EACH developer listed above, provide 2-3 concrete, actionable recommendations tailored to their specific metrics and patterns. Be constructive and specific.

4. **Team Collaboration Insights**: Analyze code review patterns, PR collaboration, knowledge sharing, and team dynamics. Identify strengths and areas for improvement.

Return ONLY valid JSON with this exact structure (use Hebrew for descriptions if helpful):
{{
  "team_health": "Comprehensive team health assessment (3-4 sentences)",
  "top_performer_analysis": "Detailed analysis of why the top performer excels (3-4 sentences with specific metrics)",
  "improvement_suggestions": {{
    "developer_email_1": "Specific actionable suggestions (2-3 concrete points)",
    "developer_email_2": "Specific actionable suggestions (2-3 concrete points)"
  }},
  "collaboration_insights": "Team dynamics and collaboration analysis (3-4 sentences)"
}}
"""
                
                response = await client.chat.completions.create(
                    model="gpt-4",  # שודרג ל-GPT-4!
                    messages=[
                        {"role": "system", "content": "You are an expert engineering manager and data analyst specializing in developer performance analytics. Provide deep, actionable insights based on quantitative data. Be specific, constructive, and data-driven. Use professional language and focus on growth opportunities."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3
                )
                
                content = response.choices[0].message.content
                if content.startswith("```json"):
                    content = content.replace("```json", "").replace("```", "").strip()
                
                ai_insights = json.loads(content)
                
            except Exception as e:
                print(f"AI Analysis Error: {e}")
                ai_insights = {
                    "team_health": "Analysis in progress",
                    "top_performer_analysis": "Data being processed",
                    "improvement_suggestions": {},
                    "collaboration_insights": "Check back soon for insights"
                }
        else:
            ai_insights = {
                "team_health": "OpenAI API key not configured or no developer data available",
                "top_performer_analysis": "N/A",
                "improvement_suggestions": {},
                "collaboration_insights": "N/A"
            }
        
        # Prepare final result
        result = {
            "repository_id": repository_id,
            "repository_name": repository.name,
            "analysis_period": "90 days",
            "analyzed_at": datetime.utcnow().isoformat(),
            "developer_stats": developer_stats,
            "best_performer": best_performer,
            "ai_insights": ai_insights
        }
        
        # Save to ai_feedback table for each developer
        for email, stats in developer_stats.items():
            # Find user by email
            user = self.db.query(User).filter(User.email == email).first()
            
            if user:
                # Check if developer-specific suggestions exist
                dev_suggestions = ai_insights.get("improvement_suggestions", {}).get(email, "Continue your great work!")
                
                feedback_content = json.dumps({
                    "analysis_type": "team_performance",
                    "period": "90_days",
                    "stats": stats,
                    "rank": "best_performer" if stats == best_performer else "team_member",
                    "improvement_suggestions": dev_suggestions,
                    "team_health": ai_insights.get("team_health", ""),
                    "collaboration_insights": ai_insights.get("collaboration_insights", "")
                })
                
                # Create feedback entry
                feedback = AIFeedback(
                    user_id=user.id,
                    repository_id=repository_id,
                    feedback_type="team_analysis",
                    content=feedback_content,
                    meta_data={
                        "performance_score": stats["performance_score"],
                        "is_best_performer": stats == best_performer,
                        "analysis_date": datetime.utcnow().isoformat()
                    }
                )
                self.db.add(feedback)
        
        # Commit all feedbacks
        try:
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            print(f"Error saving feedback: {e}")
        
        return result
