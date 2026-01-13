from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.shared.database import get_db
from app.modules.analytics.service import AnalyticsService
from app.modules.analytics.dto import DashboardStats
from app.modules.users.controller import get_current_user
from app.modules.users.dto import UserResponse

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics"""
    service = AnalyticsService(db)
    return service.get_dashboard_stats()


@router.get("/collaboration", response_model=dict)
async def get_team_collaboration(
    project_id: int = None,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get team collaboration network data
    Returns nodes (members) and links (collaborations)
    Optionally filtered by project_id
    """
    service = AnalyticsService(db)
    return service.get_team_collaboration(current_user.id, project_id)


@router.get("/manager-stats", response_model=dict)
async def get_manager_stats(
    project_id: int = None,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get manager dashboard statistics
    """
    service = AnalyticsService(db)
    return service.get_manager_stats(current_user.id, project_id)


@router.get("/manager/activity", response_model=list)
async def get_manager_activity_log(
    type: str = None,
    dateRange: str = "7days",
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get global activity log for manager"""
    service = AnalyticsService(db)
    return service.get_manager_activity_log(current_user.id, {"type": type, "dateRange": dateRange})


@router.get("/manager/team", response_model=list)
async def get_manager_team_members(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get global team members for manager"""
    service = AnalyticsService(db)
    return service.get_manager_team_members(current_user.id)


@router.get("/manager/analytics-report", response_model=dict)
async def get_manager_analytics_report(
    timeRange: str = "30days",
    project_id: int = None,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get global analytics deep dive for manager"""
    service = AnalyticsService(db)
    return service.get_manager_deep_dive_analytics(current_user.id, timeRange, project_id)


@router.get("/team-stats", response_model=dict)
async def get_team_stats(
    project_id: int = None,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get aggregated team statistics for manager dashboard
    Returns total commits, PRs, reviews, and active repos across all team projects
    """
    service = AnalyticsService(db)
    return service.get_team_stats(current_user.id, project_id)
