from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.shared.database import get_db
from app.modules.users.controller import get_current_user
from app.modules.users.dto import UserResponse
from .service import GamificationService
from typing import Dict, Any

router = APIRouter(prefix="/gamification", tags=["gamification"])

@router.get("/stats")
async def get_stats(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    service = GamificationService(db)
    return service.get_user_stats(current_user.id)

@router.get("/challenges")
async def get_challenges(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    service = GamificationService(db)
    return service.get_active_challenges(current_user.id)
