from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str = "member"
    bio: Optional[str] = None
    location: Optional[str] = None
    company: Optional[str] = None
    blog: Optional[str] = None
    twitter_username: Optional[str] = None


class UserCreate(UserBase):
    github_id: str
    access_token: Optional[str] = None


    class Config:
        from_attributes = True


class UserProfileStats(BaseModel):
    total_repositories: int = 0
    total_commits: int = 0
    total_prs: int = 0
    total_issues: int = 0


class UserResponse(UserBase):
    id: int
    github_id: str
    created_at: datetime
    stats: Optional[UserProfileStats] = None
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
