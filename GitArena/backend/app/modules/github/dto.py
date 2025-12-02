from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RepositoryBase(BaseModel):
    name: str
    full_name: str
    description: Optional[str] = None
    url: str


class RepositoryCreate(RepositoryBase):
    github_id: str
    user_id: int


class RepositoryResponse(RepositoryBase):
    id: int
    github_id: str
    is_synced: bool
    last_synced_at: Optional[datetime] = None
    created_at: datetime
    
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


class CommitCreate(CommitBase):
    repository_id: int


class CommitResponse(CommitBase):
    id: int
    repository_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
