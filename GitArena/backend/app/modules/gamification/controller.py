from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.shared.database import get_db
from app.modules.gamification.service import GamificationService
from app.modules.users.controller import get_current_user
from app.shared.models import User

router = APIRouter(
    prefix="/gamification",
    tags=["Gamification"]
)

@router.get("/stats")
def get_gamification_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = GamificationService(db)
    stats = service.get_user_stats(current_user.id)
    achievements = service.get_user_achievements(current_user.id)
    
    return {
        "level": stats.level,
        "xp": stats.xp,
        "totalXp": stats.xp,
        "nextLevelXp": stats.level * 1000, # Simple formula: level * 1000
        "streak": stats.streak,
        "achievements": [str(a.id) for a in achievements],
        "skills": {
            "Python": stats.xp // 2, # Mock distribution for now
            "TypeScript": stats.xp // 2
        }
    }

@router.get("/challenges")
def get_challenges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = GamificationService(db)
    return service.get_active_challenges(current_user.id)
