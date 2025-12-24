from pydantic import BaseModel
from typing import List, Optional

class LanguageStats(BaseModel):
    name: str
    percentage: float
    color: str

class CommitStats(BaseModel):
    message: str
    repo: str
    time: str
    additions: int
    deletions: int

class PRStats(BaseModel):
    label: str
    count: int
    color: str
    bgColor: str

class RepoStats(BaseModel):
    name: str
    stars: int
    language: Optional[str] = None
    trend: str

class ActivityStats(BaseModel):
    date: str
    count: int
    level: int

class UserDashboardResponse(BaseModel):
    languages: List[LanguageStats]
    recent_commits: List[CommitStats]
    pr_status: List[PRStats]
    top_repos: List[RepoStats]
    weekly_activity: List[int] # simple array of counts for last 7 days
    heatmap_data: List[ActivityStats]
