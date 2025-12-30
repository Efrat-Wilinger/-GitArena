from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.shared.database import get_db
from app.modules.spaces.service import SpaceService
from app.modules.spaces.dto import SpaceCreate, SpaceResponse, SpaceDashboardResponse
from app.modules.users.controller import get_current_user
from app.modules.users.dto import UserResponse
from app.modules.users.repository import UserRepository
from typing import List

router = APIRouter(prefix="/spaces", tags=["spaces"])

@router.post("/", response_model=SpaceResponse)
async def create_space(
    space_data: SpaceCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new space and auto-invite contributors"""
    service = SpaceService(db)
    user_repo = UserRepository(db)
    user = user_repo.get_by_id(current_user.id)
    
    if not user or not user.access_token:
        raise HTTPException(status_code=400, detail="User not connected to GitHub")
        
    return await service.create_space_with_contributors(space_data, current_user.id, user.access_token)

@router.get("/", response_model=List[SpaceResponse])
def get_my_spaces(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all spaces the user owns or is a member of"""
    service = SpaceService(db)
    return service.get_my_spaces(current_user.id)

@router.get("/{space_id}/dashboard", response_model=SpaceDashboardResponse)
async def get_space_dashboard(
    space_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard analytics for a space"""
    service = SpaceService(db)
    user_repo = UserRepository(db)
    user = user_repo.get_by_id(current_user.id)
    
    if not user or not user.access_token:
        raise HTTPException(status_code=400, detail="User not connected to GitHub")
        
    return await service.get_dashboard_stats(space_id, current_user.id, user.access_token)


@router.get("/{space_id}/my-role")
async def get_my_role_in_project(
    space_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's role in a specific project"""
    service = SpaceService(db)
    role = service.get_user_role_in_project(space_id, current_user.id)
    return {"role": role, "space_id": space_id}


@router.get("/projects/{project_id}/members")
async def get_project_members(
    project_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all members of a project"""
    service = SpaceService(db)
    return service.get_project_members(project_id)


@router.post("/projects/{project_id}/members")
async def add_project_member(
    project_id: int,
    username: str,
    role: str = "member",
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a member to the project (manager only)"""
    service = SpaceService(db)
    return await service.add_member(project_id, username, role, current_user.id)


@router.delete("/projects/{project_id}/members/{user_id}")
async def remove_project_member(
    project_id: int,
    user_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a member from the project (manager only)"""
    service = SpaceService(db)
    return await service.remove_member(project_id, user_id, current_user.id)


@router.get("/projects/{project_id}/activity")
async def get_project_activity(
    project_id: int,
    type_filter: str = Query(None),
    date_range: str = Query("7days"),
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get project activity log"""
    service = SpaceService(db)
    return service.get_activity_log(project_id, type_filter, date_range)


@router.get("/projects/{project_id}/analytics")
async def get_project_analytics(
    project_id: int,
    time_range: str = Query("30days"),
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get project analytics and metrics"""
    service = SpaceService(db)
    return service.get_analytics(project_id, time_range)
