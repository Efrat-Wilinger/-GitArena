from sqlalchemy.orm import Session
from .models import UserStats, Challenge, UserChallenge
from app.modules.github.repository import GitHubRepository
from typing import Dict, Any, List

class GamificationService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_stats(self, user_id: int) -> Dict[str, Any]:
        stats = self.db.query(UserStats).filter(UserStats.user_id == user_id).first()
        if not stats:
            stats = UserStats(user_id=user_id, level=1, xp=0, total_xp=0)
            self.db.add(stats)
            self.db.commit()
            self.db.refresh(stats)
            
        return {
            "level": stats.level,
            "xp": stats.xp,
            "totalXp": stats.total_xp,
            "nextLevelXp": stats.level * 1000, # Simplified level formula
            "skills": stats.skills_xp or {},
            "achievements": stats.achievements or [],
            "streak": stats.streak_days
        }

    def update_stats_from_activity(self, user_id: int, activity_type: str, metadata: Dict[str, Any] = None):
        """Award XP based on activity type"""
        stats = self.db.query(UserStats).filter(UserStats.user_id == user_id).first()
        if not stats:
            return
            
        xp_gain = 0
        if activity_type == "commit":
            xp_gain = 10
        elif activity_type == "pr":
            xp_gain = 50
        elif activity_type == "review":
            xp_gain = 30
            
        stats.xp += xp_gain
        stats.total_xp += xp_gain
        
        # Level up logic
        next_level_xp = stats.level * 1000
        if stats.xp >= next_level_xp:
            stats.xp -= next_level_xp
            stats.level += 1
            
        # Update skills XP
        if metadata and "languages" in metadata:
            skills = stats.skills_xp or {}
            for lang in metadata["languages"]:
                skills[lang] = skills.get(lang, 0) + (xp_gain // len(metadata["languages"]))
            stats.skills_xp = skills
            
        self.db.commit()
    
    def get_active_challenges(self, user_id: int) -> List[Dict[str, Any]]:
        # This would normally query UserChallenge
        # For now, return some default ones
        return [
            {
                "id": 1,
                "title": "Initial 10 Commits",
                "progress": 7,
                "total": 10,
                "reward": "500 XP",
                "active": True
            }
        ]
