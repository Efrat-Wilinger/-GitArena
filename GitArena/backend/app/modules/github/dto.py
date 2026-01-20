from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RepositoryBase(BaseModel):
    name: Optional[str] = None
    full_name: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    language: Optional[str] = None
    stargazers_count: int = 0
    forks_count: int = 0


class RepositoryCreate(RepositoryBase):
    github_id: str
    user_id: int


class RepositoryResponse(RepositoryBase):
    id: int
    github_id: Optional[str] = None
    is_synced: bool = False
    last_synced_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    name: Optional[str] = None
    full_name: Optional[str] = None
    url: Optional[str] = None
    
    class Config:
        from_attributes = True


class CommitBase(BaseModel):
    sha: str
    message: str
    author_name: str
    author_email: str
    committed_date: datetime
    additions: int = 0
    deletions: int = 0
    files_changed: int = 0
    diff_data: Optional[list] = None


class CommitCreate(CommitBase):
    repository_id: int


class CommitResponse(CommitBase):
    id: int
    repository_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class PullRequestBase(BaseModel):
    github_id: str
    number: int
    title: str
    description: Optional[str] = None
    state: str
    author: str
    created_at: datetime
    closed_at: Optional[datetime] = None
    merged_at: Optional[datetime] = None


class PullRequestCreate(PullRequestBase):
    repository_id: int


class PullRequestResponse(PullRequestBase):
    id: int
    repository_id: int
    updated_at: datetime
    
    class Config:
        from_attributes = True


class IssueBase(BaseModel):
    github_id: str
    number: int
    title: str
    body: Optional[str] = None
    state: str
    author: str
    created_at: datetime
    closed_at: Optional[datetime] = None


class IssueCreate(IssueBase):
    repository_id: int


class IssueResponse(IssueBase):
    id: int
    repository_id: int
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ReleaseBase(BaseModel):
    github_id: str
    tag_name: str
    name: Optional[str] = None
    body: Optional[str] = None
    draft: bool = False
    prerelease: bool = False
    created_at: datetime
    published_at: Optional[datetime] = None


class ReleaseCreate(ReleaseBase):
    repository_id: int


class ReleaseResponse(ReleaseBase):
    id: int
    repository_id: int
    
    class Config:
        from_attributes = True


class DeploymentBase(BaseModel):
    github_id: str
    environment: str
    description: Optional[str] = None
    state: str
    created_at: datetime
    updated_at: datetime


class DeploymentCreate(DeploymentBase):
    repository_id: int


class DeploymentResponse(DeploymentBase):
    id: int
    repository_id: int
    
    class Config:
        from_attributes = True


class ActivityBase(BaseModel):
    github_id: str
    type: str
    action: str
    title: str
    description: Optional[str] = None
    user_login: str
    created_at: datetime


class ActivityCreate(ActivityBase):
    repository_id: int


class ActivityResponse(ActivityBase):
    id: int
    repository_id: int
    
    class Config:
        from_attributes = True
