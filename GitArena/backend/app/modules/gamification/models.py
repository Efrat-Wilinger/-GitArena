from sqlalchemy import Column, Integer, String, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from app.shared.database import Base

class UserStats(Base):
    __tablename__ = "user_gamification_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    total_xp = Column(Integer, default=0)
    streak_days = Column(Integer, default=0)
    last_activity_date = Column(String, nullable=True)
    
    # JSON field for skill levels: {"TypeScript": 1200, "Python": 800, ...}
    skills_xp = Column(JSON, default=dict)
    
    # JSON field for achievements: ["first_commit", "pr_master", ...]
    achievements = Column(JSON, default=list)
    
    user = relationship("User")

class Challenge(Base):
    __tablename__ = "challenges"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    type = Column(String) # e.g., "commit_count", "pr_count"
    target_value = Column(Integer)
    reward_xp = Column(Integer)
    reward_title = Column(String, nullable=True)

class UserChallenge(Base):
    __tablename__ = "user_challenges"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    challenge_id = Column(Integer, ForeignKey("challenges.id"))
    current_value = Column(Integer, default=0)
    is_completed = Column(Integer, default=0) # 0 or 1
