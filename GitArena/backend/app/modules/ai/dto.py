from pydantic import BaseModel
from typing import Optional


class AIFeedbackRequest(BaseModel):
    """Request for AI feedback"""
    content: str
    context: Optional[str] = None


class AIFeedbackResponse(BaseModel):
    """AI feedback response"""
    feedback: str
    confidence: float
