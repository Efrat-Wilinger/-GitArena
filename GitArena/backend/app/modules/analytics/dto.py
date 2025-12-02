from pydantic import BaseModel
from typing import Dict


class DashboardStats(BaseModel):
    """Dashboard statistics response"""
    total_users: int
    total_commits: int
    tasks_by_status: Dict[str, int]
    tasks_by_assignee: Dict[str, int]
    sprint1_stories_count: int
