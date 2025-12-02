from fastapi import APIRouter, Depends, HTTPException
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
