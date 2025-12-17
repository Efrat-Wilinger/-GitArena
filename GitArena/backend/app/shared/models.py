from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, Boolean, JSON
from sqlalchemy.orm import relationship
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
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    repositories = relationship("Repository", back_populates="user")
    spaces = relationship("Space", back_populates="owner")
    space_memberships = relationship("SpaceMember", back_populates="user")


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
    feedback_type = Column(String)  # code_review, suggestion, insight
    content = Column(Text)
    meta_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
