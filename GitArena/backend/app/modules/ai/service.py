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
            # Fallback to mock data if no API key
            return [
                {
                    "type": "warning",
                    "title": "Burnout Risk Alert",
                    "description": "Unusual activity detected: 40% of commits were made between 22:00-02:00 this week.",
                    "metric": "High Risk",
                    "trend": "up"
                },
                {
                    "type": "info",
                    "title": "Knowledge Silo",
                    "description": "You are the sole contributor to the 'Authentication' module. Recommend code sharing.",
                    "metric": "Auth.py",
                    "trend": None
                },
                {
                    "type": "positive",
                    "title": "High Impact", 
                    "description": "Your code retention rate is 85%, significantly higher than the team average of 60%.",
                    "metric": "Top 5%",
                    "trend": "up"
                },
                {
                    "type": "positive",
                    "title": "Rapid Resolver",
                    "description": "You fix bugs in Python repositories 30% faster than the team baseline.",
                    "metric": "-1.2 hrs",
                    "trend": "up"
                }
            ]

        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        
        # 1. Gather data (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        # Use repository's db session to be safe
        db = getattr(self, 'db', None) or self.repository.db
        
        # Get user info for matching commits
        from app.shared.models import User
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return [{"type": "info", "title": "Welcome!", "description": "Start contributing to see your AI-powered insights here.", "metric": "0", "trend": None}]
        
        # Query commits by matching author email or name
        commits = db.query(Commit).filter(
            (Commit.author_email == user.email) | 
            (Commit.author_name == user.username) |
            (Commit.author_name == user.name),
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
            print(f"AI Insights Error: {e}")
            return [
                {
                    "type": "warning",
                    "title": "Burnout Risk Alert",
                    "description": "Unusual activity detected: 40% of commits were made between 22:00-02:00 this week.",
                    "metric": "High Risk",
                    "trend": "up"
                },
                {
                    "type": "info",
                    "title": "Knowledge Silo",
                    "description": "You are the sole contributor to the 'Authentication' module. Recommend code sharing.",
                    "metric": "Auth.py",
                    "trend": None
                },
                {
                    "type": "positive",
                    "title": "High Impact", 
                    "description": "Your code retention rate is 85%, significantly higher than the team average of 60%.",
                    "metric": "Top 5%",
                    "trend": "up"
                },
                {
                    "type": "positive",
                    "title": "Rapid Resolver",
                    "description": "You fix bugs in Python repositories 30% faster than the team baseline.",
                    "metric": "-1.2 hrs",
                    "trend": "up"
                }
            ]

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
    
    async def auto_analyze_activity(self, user_id: int, repository_id: int, activity_type: str, activity_data: dict):
        """
        ניתוח אוטומטי של כל פעילות חדשה שמגיעה למערכת
        
        Args:
            user_id: מזהה המשתמש
            repository_id: מזהה הריפוזיטורי
            activity_type: סוג הפעילות (commit, pull_request, review)
            activity_data: נתוני הפעילות
        
        Returns:
            dict: תוצאות הניתוח
        """
        from datetime import datetime, timedelta
        from app.shared.models import Commit, PullRequest, Review, User, AIFeedback
        from sqlalchemy import func
        import json
        from openai import AsyncOpenAI
        
        # Get user
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"error": "User not found"}
        
        # Gather recent activity for context (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        # Count recent activity
        recent_commits = self.db.query(func.count(Commit.id)).filter(
            Commit.repository_id == repository_id,
            Commit.author_email == user.email,
            Commit.committed_date >= thirty_days_ago
        ).scalar() or 0
        
        recent_prs = self.db.query(func.count(PullRequest.id)).filter(
            PullRequest.repository_id == repository_id,
            PullRequest.author == user.github_login,
            PullRequest.created_at >= thirty_days_ago
        ).scalar() or 0
        
        recent_reviews = self.db.query(func.count(Review.id)).join(PullRequest).filter(
            PullRequest.repository_id == repository_id,
            Review.reviewer == user.github_login,
            Review.submitted_at >= thirty_days_ago
        ).scalar() or 0
        
        # Calculate metrics based on recent activity
        # 1. Code Quality Score
        if activity_type == "pull_request":
            merge_success = 1 if activity_data.get("merged", False) else 0
            code_quality_score = 85.0 + (merge_success * 10)  # Base 85, +10 if merged
        else:
            code_quality_score = 75.0  # Default for commits and reviews
        
        # 2. Code Volume
        code_volume = 0
        if activity_type == "commit":
            code_volume = activity_data.get("additions", 0) + activity_data.get("deletions", 0)
        elif activity_type == "pull_request":
            code_volume = activity_data.get("additions", 0) + activity_data.get("deletions", 0)
        
        # 3. Effort Score (based on recent activity)
        total_activity = recent_commits + recent_prs * 2 + recent_reviews
        effort_score = min((total_activity / 20) * 100, 100)  # Max 20 activities = 100%
        
        # 4. Velocity Score (activity frequency)
        activity_per_week = (recent_commits + recent_prs + recent_reviews) / 4.3  # 30 days ≈ 4.3 weeks
        velocity_score = min((activity_per_week / 10) * 100, 100)  # 10 activities/week = 100%
        
        # 5. Consistency Score
        consistency_score = min(velocity_score * 0.85, 100)  # Simplified
        
        # Generate AI insights for this specific activity
        ai_insight = ""
        if settings.OPENAI_API_KEY:
            try:
                client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
                
                activity_summary = f"""
Activity Type: {activity_type}
User: {user.name or user.username} ({user.email})
Recent Stats (30 days):
- Commits: {recent_commits}
- PRs: {recent_prs}
- Reviews: {recent_reviews}

Current Activity Details:
{json.dumps(activity_data, indent=2)}
"""
                
                prompt = f"""{activity_summary}

Provide a brief, encouraging insight about this developer's recent activity.
Focus on:
1. What they're doing well
2. One specific suggestion for improvement
3. Recognition of their contribution

Keep it concise (2-3 sentences) and motivating. Use Hebrew if helpful.
Return ONLY the insight text, no JSON or formatting."""
                
                response = await client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are a supportive engineering manager providing real-time feedback to developers."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=200
                )
                
                ai_insight = response.choices[0].message.content.strip()
                
            except Exception as e:
                print(f"AI Insight Error: {e}")
                ai_insight = f"Great {activity_type}! Keep up the excellent work."
        else:
            ai_insight = f"Excellent {activity_type}! Your contribution is valued."
        
        # Determine improvement areas and strengths
        improvement_areas = []
        strengths = []
        
        if recent_commits < 5:
            improvement_areas.append("Consider increasing commit frequency")
        if recent_reviews < 3:
            improvement_areas.append("Participate more in code reviews")
        
        if recent_commits >= 15:
            strengths.append("Highly active contributor")
        if recent_reviews >= 10:
            strengths.append("Active code reviewer")
        if activity_type == "review":
            strengths.append("Collaborative team player")
        
        # Create feedback content
        feedback_content = json.dumps({
            "analysis_type": "auto_activity",
            "activity_type": activity_type,
            "activity_data": activity_data,
            "recent_activity": {
                "commits": recent_commits,
                "prs": recent_prs,
                "reviews": recent_reviews
            },
            "ai_insight": ai_insight,
            "analyzed_at": datetime.utcnow().isoformat()
        })
        
        # Save to ai_feedback table
        try:
            feedback = AIFeedback(
                user_id=user_id,
                repository_id=repository_id,
                feedback_type="auto_analysis",
                content=feedback_content,
                meta_data={
                    "activity_type": activity_type,
                    "timestamp": datetime.utcnow().isoformat()
                },
                code_quality_score=round(code_quality_score, 2),
                code_volume=code_volume,
                effort_score=round(effort_score, 2),
                velocity_score=round(velocity_score, 2),
                consistency_score=round(consistency_score, 2),
                improvement_areas=improvement_areas,
                strengths=strengths
            )
            self.db.add(feedback)
            self.db.commit()
            
            return {
                "success": True,
                "insight": ai_insight,
                "metrics": {
                    "code_quality_score": round(code_quality_score, 2),
                    "code_volume": code_volume,
                    "effort_score": round(effort_score, 2),
                    "velocity_score": round(velocity_score, 2),
                    "consistency_score": round(consistency_score, 2)
                }
            }
        except Exception as e:
            self.db.rollback()
            print(f"Error saving auto analysis: {e}")
            return {"error": str(e)}

    
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
                
                # Calculate advanced metrics
                # 1. Code Quality Score (based on PR merge rate and review approvals)
                total_prs = stats["prs_created"] or 1
                merge_rate = (stats["prs_merged"] / total_prs) * 100 if total_prs > 0 else 0
                total_reviews = stats["reviews_given"] or 1
                approval_rate = (stats["reviews_approved"] / total_reviews) * 100 if total_reviews > 0 else 0
                code_quality_score = (merge_rate * 0.6 + approval_rate * 0.4)
                
                # 2. Code Volume (total lines changed)
                code_volume = stats["additions"] + stats["deletions"]
                
                # 3. Effort Score (based on commits, PRs, and code volume)
                commit_effort = min((stats["commits"] / 50) * 100, 100)  # Max 50 commits = 100%
                pr_effort = min((stats["prs_created"] / 20) * 100, 100)  # Max 20 PRs = 100%
                volume_effort = min((code_volume / 5000) * 100, 100)  # Max 5000 lines = 100%
                effort_score = (commit_effort * 0.4 + pr_effort * 0.3 + volume_effort * 0.3)
                
                # 4. Velocity Score (commits per week)
                commits_per_week = stats["commits"] / 13  # 90 days ≈ 13 weeks
                velocity_score = min((commits_per_week / 5) * 100, 100)  # 5 commits/week = 100%
                
                # 5. Consistency Score (based on even distribution)
                # Higher score if work is distributed evenly
                # This is a simplified calculation - in real scenario we'd check commit dates
                consistency_score = min(velocity_score * 0.9, 100)  # Simplified for now
                
                # Extract improvement areas and strengths from AI insights
                improvement_areas = []
                strengths = []
                
                # Parse dev_suggestions to extract areas
                if isinstance(dev_suggestions, str):
                    # Simple heuristic: look for positive and negative keywords
                    if merge_rate < 60:
                        improvement_areas.append("PR merge rate needs improvement")
                    if stats["reviews_given"] < 5:
                        improvement_areas.append("Increase code review participation")
                    if commits_per_week < 2:
                        improvement_areas.append("Boost commit frequency")
                    
                    if merge_rate >= 80:
                        strengths.append("Excellent PR merge rate")
                    if stats["reviews_given"] >= 10:
                        strengths.append("Active code reviewer")
                    if stats == best_performer:
                        strengths.append("Top team performer")
                
                feedback_content = json.dumps({
                    "analysis_type": "team_performance",
                    "period": "90_days",
                    "stats": stats,
                    "rank": "best_performer" if stats == best_performer else "team_member",
                    "improvement_suggestions": dev_suggestions,
                    "team_health": ai_insights.get("team_health", ""),
                    "collaboration_insights": ai_insights.get("collaboration_insights", ""),
                    "metrics": {
                        "code_quality_score": round(code_quality_score, 2),
                        "code_volume": code_volume,
                        "effort_score": round(effort_score, 2),
                        "velocity_score": round(velocity_score, 2),
                        "consistency_score": round(consistency_score, 2)
                    }
                })
                
                # Create feedback entry with all new fields
                feedback = AIFeedback(
                    user_id=user.id,
                    repository_id=repository_id,
                    feedback_type="team_analysis",
                    content=feedback_content,
                    meta_data={
                        "performance_score": stats["performance_score"],
                        "is_best_performer": stats == best_performer,
                        "analysis_date": datetime.utcnow().isoformat()
                    },
                    # New performance metrics
                    code_quality_score=round(code_quality_score, 2),
                    code_volume=code_volume,
                    effort_score=round(effort_score, 2),
                    velocity_score=round(velocity_score, 2),
                    consistency_score=round(consistency_score, 2),
                    improvement_areas=improvement_areas,
                    strengths=strengths
                )
                self.db.add(feedback)
        
        # Commit all feedbacks
        try:
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            print(f"Error saving feedback: {e}")
        
        return result
