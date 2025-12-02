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
