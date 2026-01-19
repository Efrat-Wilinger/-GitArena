from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, Boolean, JSON, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from app.shared.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(String, unique=True, index=True)
    github_login = Column(String, unique=True, index=True, nullable=True)  # GitHub username for easier lookup
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    avatar_url = Column(String, nullable=True)
    name = Column(String, nullable=True)
    role = Column(String, default="member")  # member (employee/developer), admin (can manage teams)
    access_token = Column(String, nullable=True)
    
    # Detailed Profile Info
    bio = Column(String, nullable=True)
    location = Column(String, nullable=True)
    company = Column(String, nullable=True)
    blog = Column(String, nullable=True)
    twitter_username = Column(String, nullable=True)
    
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    
    repositories = relationship("Repository", back_populates="user")
    spaces = relationship("Space", back_populates="owner")
    space_memberships = relationship("SpaceMember", back_populates="user")
    
    gamification_stats = relationship("GamificationStats", uselist=False, back_populates="user")
    achievements = relationship("UserAchievement", back_populates="user")


class Space(Base):
    __tablename__ = "spaces"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    owner = relationship("User", back_populates="spaces")
    repositories = relationship("Repository", back_populates="space")
    members = relationship("SpaceMember", back_populates="space")


class SpaceMember(Base):
    __tablename__ = "space_members"
    
    id = Column(Integer, primary_key=True, index=True)
    space_id = Column(Integer, ForeignKey("spaces.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    role = Column(String, default="member")  # admin (team owner/manager), member (regular team member), viewer (read-only)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    space = relationship("Space", back_populates="members")
    user = relationship("User", back_populates="space_memberships")


class Repository(Base):
    __tablename__ = "repositories"
    
    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    full_name = Column(String)
    description = Column(Text, nullable=True)
    url = Column(String)
    language = Column(String, nullable=True)
    stargazers_count = Column(Integer, default=0)
    forks_count = Column(Integer, default=0)
    user_id = Column(Integer, ForeignKey("users.id"))
    space_id = Column(Integer, ForeignKey("spaces.id"), nullable=True)
    is_synced = Column(Boolean, default=False)
    last_synced_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="repositories")
    space = relationship("Space", back_populates="repositories")
    commits = relationship("Commit", back_populates="repository")
    pull_requests = relationship("PullRequest", back_populates="repository")
    issues = relationship("Issue", back_populates="repository")
    releases = relationship("Release", back_populates="repository")
    deployments = relationship("Deployment", back_populates="repository")


class Commit(Base):
    __tablename__ = "commits"
    
    id = Column(Integer, primary_key=True, index=True)
    sha = Column(String, unique=True, index=True)
    message = Column(Text)
    author_name = Column(String)
    author_email = Column(String)
    committed_date = Column(DateTime)
    repository_id = Column(Integer, ForeignKey("repositories.id"))
    additions = Column(Integer, default=0)
    deletions = Column(Integer, default=0)
    files_changed = Column(Integer, default=0)
    diff_data = Column(JSON, nullable=True)  # Detailed file changes (patch, etc)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    repository = relationship("Repository", back_populates="commits")


class PullRequest(Base):
    __tablename__ = "pull_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(String, unique=True, index=True)
    number = Column(Integer)
    title = Column(String)
    description = Column(Text, nullable=True)
    state = Column(String)  # open, closed, merged
    author = Column(String)
    repository_id = Column(Integer, ForeignKey("repositories.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    closed_at = Column(DateTime, nullable=True)
    merged_at = Column(DateTime, nullable=True)
    
    repository = relationship("Repository", back_populates="pull_requests")
    reviews = relationship("Review", back_populates="pull_request")


class Issue(Base):
    __tablename__ = "issues"
    
    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(String, unique=True, index=True)
    number = Column(Integer)
    title = Column(String)
    body = Column(Text, nullable=True)
    state = Column(String)  # open, closed
    author = Column(String)
    repository_id = Column(Integer, ForeignKey("repositories.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    closed_at = Column(DateTime, nullable=True)
    
    repository = relationship("Repository", back_populates="issues")


class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(String, unique=True, index=True)
    pull_request_id = Column(Integer, ForeignKey("pull_requests.id"))
    reviewer = Column(String)
    state = Column(String)  # approved, changes_requested, commented
    body = Column(Text, nullable=True)
    submitted_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    pull_request = relationship("PullRequest", back_populates="reviews")


class AnalyticsActivity(Base):
    __tablename__ = "analytics_activity"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    repository_id = Column(Integer, ForeignKey("repositories.id"), nullable=True)
    metric_name = Column(String)  # commits_count, prs_opened, reviews_given
    metric_value = Column(Float)
    period_start = Column(DateTime)
    period_end = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)


class AnalyticsQuality(Base):
    __tablename__ = "analytics_quality"
    
    id = Column(Integer, primary_key=True, index=True)
    repository_id = Column(Integer, ForeignKey("repositories.id"))
    metric_name = Column(String)  # code_quality_score, test_coverage, bug_density
    metric_value = Column(Float)
    period_start = Column(DateTime)
    period_end = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)


class AnalyticsCollaboration(Base):
    __tablename__ = "analytics_collaboration"
    
    id = Column(Integer, primary_key=True, index=True)
    repository_id = Column(Integer, ForeignKey("repositories.id"))
    metric_name = Column(String)  # avg_review_time, pr_merge_rate, collaboration_score
    metric_value = Column(Float)
    period_start = Column(DateTime)
    period_end = Column(DateTime)
    meta_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AIFeedback(Base):
    __tablename__ = "ai_feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    repository_id = Column(Integer, ForeignKey("repositories.id"), nullable=True)
    commit_id = Column(Integer, ForeignKey("commits.id"), nullable=True)
    feedback_type = Column(String)  # code_review, suggestion, insight, team_analysis, auto_analysis
    content = Column(Text)
    meta_data = Column(JSON, nullable=True)
    
    # Performance Metrics - מדדי ביצועים מתקדמים
    code_quality_score = Column(Float, nullable=True)  # ציון איכות קוד (0-100)
    code_volume = Column(Integer, nullable=True)  # כמות קוד (שורות)
    effort_score = Column(Float, nullable=True)  # ציון השקעה (0-100)
    velocity_score = Column(Float, nullable=True)  # ציון מהירות (0-100)
    consistency_score = Column(Float, nullable=True)  # ציון קביעות (0-100)
    
    # Qualitative Analysis - ניתוח איכותי
    improvement_areas = Column(JSON, nullable=True)  # רשימת תחומים לשיפור
    strengths = Column(JSON, nullable=True)  # רשימת חוזקות
    
    created_at = Column(DateTime, default=datetime.utcnow)


class Release(Base):
    __tablename__ = "releases"
    
    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(String, unique=True, index=True)
    tag_name = Column(String)
    name = Column(String, nullable=True)
    body = Column(Text, nullable=True)
    draft = Column(Boolean, default=False)
    prerelease = Column(Boolean, default=False)
    created_at = Column(DateTime)
    published_at = Column(DateTime, nullable=True)
    repository_id = Column(Integer, ForeignKey("repositories.id"))
    
    repository = relationship("Repository", back_populates="releases")


class Deployment(Base):
    __tablename__ = "deployments"
    
    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(String, unique=True, index=True)
    environment = Column(String)
    description = Column(String, nullable=True)
    state = Column(String)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    repository_id = Column(Integer, ForeignKey("repositories.id"))
    
    repository = relationship("Repository", back_populates="deployments")


class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(String, unique=True, index=True)
    type = Column(String)  # commit, pr, issue, release, deployment
    action = Column(String)  # created, merged, closed, etc.
    title = Column(String)
    description = Column(Text, nullable=True)
    user_login = Column(String)
    repository_id = Column(Integer, ForeignKey("repositories.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    repository = relationship("Repository")


class Quest(Base):
    __tablename__ = "quests"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    target = Column(Integer)
    metric = Column(String)  # commits, prs, issues, reviews
    reward = Column(String, nullable=True)
    project_id = Column(Integer, ForeignKey("spaces.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Space")


class GamificationStats(Base):
    __tablename__ = "gamification_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    streak = Column(Integer, default=0)
    last_activity_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="gamification_stats")


class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, unique=True)
    description = Column(String)
    icon = Column(String)
    xp_reward = Column(Integer)
    condition_type = Column(String)  # commits_count, prs_merged, etc.
    condition_value = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    achievement_id = Column(Integer, ForeignKey("achievements.id"))
    unlocked_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement")
