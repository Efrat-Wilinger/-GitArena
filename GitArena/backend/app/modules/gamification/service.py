from sqlalchemy.orm import Session
from sqlalchemy import func
from app.shared.models import GamificationStats, Achievement, UserAchievement, User, Commit, PullRequest, Review
from datetime import datetime, timedelta

class GamificationService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_stats(self, user_id: int):
        stats = self.db.query(GamificationStats).filter(GamificationStats.user_id == user_id).first()
        if not stats:
            stats = self._create_initial_stats(user_id)
        
        # Calculate real-time stats if needed
        self._calculate_xp_from_activity(user_id, stats)
        
        return stats

    def _create_initial_stats(self, user_id: int):
        stats = GamificationStats(user_id=user_id, xp=0, level=1, streak=0)
        self.db.add(stats)
        
        # Check and seed achievements if needed
        self._seed_default_achievements()
        
        self.db.commit()
        self.db.refresh(stats)
        return stats

    def _seed_default_achievements(self):
        # Check if achievements exist
        count = self.db.query(Achievement).count()
        if count == 0:
            defaults = [
                {"id": 1, "title": "Early Adopter", "description": "Joined GitArena", "icon": "🚀", "xp_reward": 100},
                {"id": 2, "title": "Commit Master", "description": "100+ commits", "icon": "⚡", "xp_reward": 500},
                {"id": 3, "title": "Code Reviewer", "description": "50+ reviews", "icon": "👀", "xp_reward": 300},
                {"id": 4, "title": "Team Player", "description": "10+ collaborators", "icon": "🤝", "xp_reward": 200},
                {"id": 5, "title": "Streak Master", "description": "30-day streak", "icon": "🔥", "xp_reward": 1000},
                {"id": 6, "title": "Repository King", "description": "20+ repos", "icon": "👑", "xp_reward": 400}
            ]
            for ach in defaults:
                # Use specific IDs to match frontend logic temporarily
                db_ach = Achievement(
                    id=ach["id"],
                    title=ach["title"],
                    description=ach["description"],
                    icon=ach["icon"],
                    xp_reward=ach["xp_reward"],
                    condition_type="manual",
                    condition_value=0
                )
                self.db.add(db_ach)
            self.db.commit() # Commit seeding

    def _calculate_xp_from_activity(self, user_id: int, stats: GamificationStats):
        # Count commits
        commit_count = self.db.query(func.count(Commit.id)).\
            join(User, User.name == Commit.author_name).\
            filter(User.id == user_id).scalar() or 0
            
        # Count PRs
        pr_count = self.db.query(func.count(PullRequest.id)).\
            join(User, User.username == PullRequest.author).\
            filter(User.id == user_id).scalar() or 0
            
        # Count Reviews
        review_count = self.db.query(func.count(Review.id)).\
            join(User, User.username == Review.reviewer).\
            filter(User.id == user_id).scalar() or 0

        # Calculate XP: 10 per commit, 50 per PR, 30 per review
        total_xp = (commit_count * 10) + (pr_count * 50) + (review_count * 30)
        
        # Update stats
        stats.xp = total_xp
        stats.level = int(total_xp / 1000) + 1
        
        self.db.commit()
        
    def get_active_challenges(self, user_id: int):
        # Return all challenges (simple implementation for now)
        # In a real scenario, we would filter by active dates or user assignment
        # For now return empty list if table doesn't exist or is empty, 
        # effectively removing mock data.
        return []

    def get_user_achievements(self, user_id: int):
        return self.db.query(Achievement).\
            join(UserAchievement).\
            filter(UserAchievement.user_id == user_id).all()
