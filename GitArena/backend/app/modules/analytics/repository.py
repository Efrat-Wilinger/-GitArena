from sqlalchemy.orm import Session
from app.shared.models import AnalyticsActivity, AnalyticsQuality, AnalyticsCollaboration


class AnalyticsRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def create_activity_metric(self, **kwargs):
        """Create activity metric"""
        metric = AnalyticsActivity(**kwargs)
        self.db.add(metric)
        self.db.commit()
        self.db.refresh(metric)
        return metric
    
    def create_quality_metric(self, **kwargs):
        """Create quality metric"""
        metric = AnalyticsQuality(**kwargs)
        self.db.add(metric)
        self.db.commit()
        self.db.refresh(metric)
        return metric
    
    def create_collaboration_metric(self, **kwargs):
        """Create collaboration metric"""
        metric = AnalyticsCollaboration(**kwargs)
        self.db.add(metric)
        self.db.commit()
        self.db.refresh(metric)
        return metric
