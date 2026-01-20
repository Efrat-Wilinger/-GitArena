from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.modules.users.dto import UserResponse

class SpaceBase(BaseModel):
    name: str
    description: Optional[str] = None

class SpaceCreate(SpaceBase):
    repository_id: int

class SpaceUpdate(SpaceBase):
    pass

from app.modules.github.dto import RepositoryResponse

class SpaceResponse(SpaceBase):
    id: int
    owner_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    members_count: int = 0
    repositories: List[RepositoryResponse] = []
    
    class Config:
        from_attributes = True

class SpaceMemberResponse(BaseModel):
    id: int
    user: UserResponse
    role: str
    joined_at: datetime
    
    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_commits: int
    total_prs: int
    active_contributors: int
    total_lines_code: int


class LanguageStats(BaseModel):
    name: str
    bytes: int
    percentage: float


class ContributorStats(BaseModel):
    username: str
    avatar_url: Optional[str]
    commits: int
    additions: int
    deletions: int


class ActivityStats(BaseModel):
    date: str
    count: int


class ProjectProgress(BaseModel):
    overall: int
    planning: int
    development: int
    testing: int
    deployment: int


from app.modules.github.dto import ActivityResponse


class SpaceDashboardResponse(BaseModel):
    overview: DashboardStats
    languages: List[LanguageStats]
    leaderboard: List[ContributorStats]
    activity: List[ActivityStats]
    progress: ProjectProgress
    recent_activities: List[ActivityResponse] = []
    is_admin_view: bool = False


