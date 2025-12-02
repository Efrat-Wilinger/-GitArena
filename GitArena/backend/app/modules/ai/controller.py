from fastapi import APIRouter, Depends
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
