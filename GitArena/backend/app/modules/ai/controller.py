from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.shared.database import get_db
from app.modules.ai.service import AIService
from app.modules.ai.dto import AIFeedbackRequest, AIFeedbackResponse
from app.modules.users.controller import get_current_user
from app.modules.users.dto import UserResponse

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/code-review", response_model=AIFeedbackResponse)
async def get_code_review(
    request: AIFeedbackRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI code review feedback (placeholder)"""
    service = AIService(db)
    return await service.generate_code_review(request.content, request.context)


@router.get("/insights")
async def get_insights(
    user_id: int = Query(None),
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-generated insights for user or team"""
    service = AIService(db)
    target_user_id = user_id if user_id else current_user.id
    return await service.generate_insights(target_user_id)
