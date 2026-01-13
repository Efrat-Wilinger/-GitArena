from pydantic import BaseModel
from typing import Dict, Optional, List
from datetime import datetime


class DashboardStats(BaseModel):
    """Dashboard statistics response"""
    total_users: int
    total_commits: int
    tasks_by_status: Dict[str, int]
    tasks_by_assignee: Dict[str, int]
    sprint1_stories_count: int


class QuestBase(BaseModel):
    title: str
    description: Optional[str] = None
    target: int
    metric: str
    reward: Optional[str] = None


class QuestCreate(QuestBase):
    pass


class QuestResponse(QuestBase):
    id: int
    project_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class LeaderboardEntry(BaseModel):
    """Individual leaderboard entry"""
    rank: int
    name: str
    avatar_url: Optional[str] = None
    commits: int
    prs: int
    reviews: int
    total_score: int
    
    class Config:
        from_attributes = True


class LeaderboardResponse(BaseModel):
    """Leaderboard response with top contributors"""
    entries: List[LeaderboardEntry]
    period: str = "all-time"  # "week", "month", "all-time"


class BottleneckAlert(BaseModel):
    """Alert for a detected development bottleneck"""
    id: str
    type: str # e.g., "stuck_pr", "long_review"
    severity: str # "high", "medium", "low"
    title: str
    description: str
    repository: str
    url: Optional[str] = None
    created_at: datetime
    metadata: Optional[Dict] = None

    class Config:
        from_attributes = True


class BottleneckResponse(BaseModel):
    alerts: List[BottleneckAlert]
    total_high_severity: int
    total_medium_severity: int


class KnowledgeBaseMetrics(BaseModel):
    """Metrics regarding documentation health"""
    health_score: int # 0-100
    last_update: Optional[datetime]
    readme_exists: bool
    contributing_exists: bool
    documentation_ratio: float # Percentage of commits touching docs
    recent_updates_count: int
    
    class Config:
        from_attributes = True


class MemberLoad(BaseModel):
    user_id: int
    username: str
    avatar_url: Optional[str] = None
    velocity: float # Daily commit average
    status: str # "Overloaded", "Optimal", "Underutilized"

class TeamCapacityResponse(BaseModel):
    total_capacity_score: int
    active_members_count: int
    average_velocity: float
    predicted_sprint_output: int # Estimated commits for next 2 weeks
    sprint_risk: str # "Low", "Medium", "High"
    member_loads: List[MemberLoad]
