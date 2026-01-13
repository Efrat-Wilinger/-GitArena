from pydantic import BaseModel
from typing import Dict, Optional
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
