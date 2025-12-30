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


@router.get("/repository/{repository_id}/team-analysis")
async def get_repository_team_analysis(
    repository_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze all team members' performance in a repository
    Returns detailed analysis with best performer, insights, and improvement suggestions
    Results are automatically saved to ai_feedback table
    """
    service = AIService(db)
    return await service.analyze_repository_team(repository_id)


@router.get("/feedback/history")
async def get_feedback_history(
    repository_id: int = Query(None),
    user_id: int = Query(None),
    limit: int = Query(10, ge=1, le=100),
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get history of all AI feedback/analyses
    Can filter by repository_id and user_id
    Returns all saved analyses from ai_feedback table
    """
    from app.shared.models import AIFeedback, User, Repository
    from sqlalchemy import desc
    
    query = db.query(AIFeedback).filter(AIFeedback.feedback_type == 'team_analysis')
    
    if repository_id:
        query = query.filter(AIFeedback.repository_id == repository_id)
    
    if user_id:
        query = query.filter(AIFeedback.user_id == user_id)
    
    feedbacks = query.order_by(desc(AIFeedback.created_at)).limit(limit).all()
    
    # Format results
    results = []
    for feedback in feedbacks:
        user = db.query(User).filter(User.id == feedback.user_id).first()
        repo = db.query(Repository).filter(Repository.id == feedback.repository_id).first()
        
        results.append({
            "id": feedback.id,
            "user": {
                "id": user.id if user else None,
                "username": user.username if user else None,
                "email": user.email if user else None
            },
            "repository": {
                "id": repo.id if repo else None,
                "name": repo.name if repo else None
            },
            "content": feedback.content,
            "meta_data": feedback.meta_data,
            "created_at": feedback.created_at.isoformat() if feedback.created_at else None
        })
    
    return {
        "total": len(results),
        "analyses": results
    }


@router.post("/repository/{repository_id}/auto-analyze")
async def auto_analyze_repository(
    repository_id: int,
    force: bool = Query(False),
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Auto-analyze repository team if no recent analysis exists
    If force=True, will run analysis even if recent one exists
    """
    from app.shared.models import AIFeedback
    from datetime import datetime, timedelta
    from sqlalchemy import desc
    
    service = AIService(db)
    
    if not force:
        # Check if analysis was run in last 24 hours
        one_day_ago = datetime.utcnow() - timedelta(days=1)
        recent_analysis = db.query(AIFeedback).filter(
            AIFeedback.repository_id == repository_id,
            AIFeedback.feedback_type == 'team_analysis',
            AIFeedback.created_at >= one_day_ago
        ).order_by(desc(AIFeedback.created_at)).first()
        
        if recent_analysis:
            return {
                "status": "skipped",
                "message": "Recent analysis exists (less than 24 hours old)",
                "last_analysis": recent_analysis.created_at.isoformat()
            }
    
    # Run new analysis
    result = await service.analyze_repository_team(repository_id)
    
    return {
        "status": "completed",
        "message": "New analysis completed successfully",
        "data": result
    }
