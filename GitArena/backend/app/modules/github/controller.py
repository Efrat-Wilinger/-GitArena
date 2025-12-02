from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.shared.database import get_db
from app.modules.github.service import GitHubService
from app.modules.github.dto import RepositoryResponse, CommitResponse
from app.modules.users.controller import get_current_user
from app.modules.users.dto import UserResponse
from app.modules.users.repository import UserRepository
from typing import List

router = APIRouter(prefix="/github", tags=["github"])


@router.get("/repos", response_model=List[RepositoryResponse])
async def get_repositories(
    sync: bool = Query(False, description="Sync repositories from GitHub"),
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user repositories, optionally sync from GitHub"""
    service = GitHubService(db)
    
    if sync:
        # Get user's access token
        user_repo = UserRepository(db)
        user = user_repo.get_by_id(current_user.id)
        if user and user.access_token:
            return await service.sync_repositories(current_user.id, user.access_token)
    
    return service.get_user_repositories(current_user.id)


@router.get("/repos/{repo_id}/commits", response_model=List[CommitResponse])
async def get_commits(
    repo_id: int,
    sync: bool = Query(False, description="Sync commits from GitHub"),
    limit: int = Query(50, ge=1, le=100),
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get repository commits, optionally sync from GitHub"""
    service = GitHubService(db)
    
    if sync:
        # Get user's access token
        user_repo = UserRepository(db)
        user = user_repo.get_by_id(current_user.id)
        if user and user.access_token:
            return await service.sync_commits(repo_id, user.access_token)
    
    return service.get_repository_commits(repo_id, limit)


@router.get("/repos/{repo_id}/tree")
async def get_repository_tree(
    repo_id: int,
    path: str = Query(None),
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get repository file tree"""
    service = GitHubService(db)
    user_repo = UserRepository(db)
    user = user_repo.get_by_id(current_user.id)
    
    if not user or not user.access_token:
        raise HTTPException(status_code=400, detail="User not connected to GitHub")
        
    return await service.get_repository_tree(repo_id, user.access_token, path)


@router.get("/repos/{repo_id}/commits/path")
async def get_commit_for_path(
    repo_id: int,
    path: str,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get last commit for a specific file path"""
    service = GitHubService(db)
    user_repo = UserRepository(db)
    user = user_repo.get_by_id(current_user.id)
    
    if not user or not user.access_token:
        raise HTTPException(status_code=400, detail="User not connected to GitHub")
        
    return await service.get_last_commit_for_path(repo_id, user.access_token, path)
