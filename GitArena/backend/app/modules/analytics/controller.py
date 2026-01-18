from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.shared.database import get_db
from app.modules.analytics.service import AnalyticsService
from app.modules.analytics.dto import DashboardStats, QuestCreate, QuestResponse
from app.modules.users.controller import get_current_user
from app.modules.users.dto import UserResponse
from app.shared.models import Quest
from typing import List, Optional

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
    project_id: int = None,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get global team members for manager"""
    service = AnalyticsService(db)
    return service.get_manager_team_members(current_user.id, project_id)


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


# Quest Endpoints
@router.post("/quests", response_model=QuestResponse)
async def create_quest(
    quest_in: QuestCreate,
    project_id: Optional[int] = None,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new team quest"""
    # Allow all authenticated users to create quests
    db_quest = Quest(
        **quest_in.model_dump(),
        project_id=project_id
    )
    db.add(db_quest)
    db.commit()
    db.refresh(db_quest)
    return db_quest


@router.get("/quests", response_model=List[QuestResponse])
async def get_quests(
    project_id: Optional[int] = None,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all quests for a project (or all if no project specified)"""
    query = db.query(Quest)
    if project_id:
        query = query.filter(Quest.project_id == project_id)
    return query.all()


@router.delete("/quests/{quest_id}")
async def delete_quest(
    quest_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a quest"""
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can delete quests")
        
    db_quest = db.query(Quest).filter(Quest.id == quest_id).first()
    if not db_quest:
        raise HTTPException(status_code=404, detail="Quest not found")
        
    db.delete(db_quest)
    db.commit()
    return {"status": "success"}


# Leaderboard Endpoint
@router.get("/leaderboard")
async def get_leaderboard(
    project_id: Optional[int] = None,
    period: str = "all-time",
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get team leaderboard rankings"""
    service = AnalyticsService(db)
    return service.get_leaderboard(current_user.id, project_id, period)


@router.get("/bottlenecks")
async def get_bottlenecks(
    project_id: Optional[int] = None,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get development bottlenecks and alerts"""
    service = AnalyticsService(db)
    return service.get_bottlenecks(current_user.id, project_id)


@router.get("/knowledge-base")
async def get_knowledge_base_metrics(
    project_id: Optional[int] = None,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get documentation health analysis"""
    service = AnalyticsService(db)
    return service.get_knowledge_base_metrics(current_user.id, project_id)


@router.get("/capacity")
async def get_team_capacity(
    project_id: Optional[int] = None,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get team capacity planning metrics"""
    service = AnalyticsService(db)
    return service.get_team_capacity(current_user.id, project_id)
