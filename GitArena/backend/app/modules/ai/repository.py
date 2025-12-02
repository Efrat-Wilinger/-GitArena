from sqlalchemy.orm import Session
from app.shared.models import AIFeedback


class AIRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def create_feedback(self, **kwargs) -> AIFeedback:
        """Store AI feedback"""
        feedback = AIFeedback(**kwargs)
        self.db.add(feedback)
        self.db.commit()
        self.db.refresh(feedback)
        return feedback
