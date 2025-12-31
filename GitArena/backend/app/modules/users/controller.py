from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.shared.database import get_db
from app.modules.users.service import UserService
from app.modules.users.dto import UserResponse
from app.shared.security import verify_token
from fastapi.security import HTTPBearer
from fastapi.security.http import HTTPAuthorizationCredentials

router = APIRouter(prefix="/users", tags=["users"])
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> UserResponse:
    """Get current authenticated user"""
    payload = verify_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    service = UserService(db)
    return service.get_user_by_id(int(user_id))


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: UserResponse = Depends(get_current_user)
):
    """Get current user profile"""
    return current_user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get user by ID"""
    service = UserService(db)
    return service.get_user_by_id(user_id)


@router.get("/dashboard/stats", response_model=None)
async def get_user_dashboard(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get dashboard analytics for the current user"""
    from app.modules.users.dashboard_dto import UserDashboardResponse
    service = UserService(db)
    return service.get_user_dashboard_stats(current_user.id)


@router.post("/sync-projects", response_model=dict)
async def sync_all_projects(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Sync all user projects from GitHub"""
    if not current_user.access_token:
         raise HTTPException(status_code=400, detail="User not connected to GitHub")
         
    service = UserService(db)
    return await service.sync_all_user_projects(current_user.id, current_user.access_token)
