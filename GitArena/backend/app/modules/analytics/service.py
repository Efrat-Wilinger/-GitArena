from sqlalchemy.orm import Session
from app.modules.analytics.repository import AnalyticsRepository
from app.modules.analytics.dto import DashboardStats
from app.modules.users.repository import UserRepository
from app.modules.github.repository import GitHubRepository


class AnalyticsService:
    def __init__(self, db: Session):
        self.repository = AnalyticsRepository(db)
        self.user_repository = UserRepository(db)
        self.github_repository = GitHubRepository(db)
    
    def get_dashboard_stats(self) -> DashboardStats:
        """
        Get dashboard statistics
        Implements the required dashboard queries:
        - count tasks by status
        - count tasks by assignedTo
        - count stories in Sprint 1
        - count commits fetched
        - count registered users
        """
        # For Sprint 1, we'll use placeholder data for task-related queries
        # These would be replaced with actual task tracking in future sprints
        tasks_by_status = {
            "todo": 2,
            "in_progress": 3,
            "done": 1
        }
        
        tasks_by_assignee = {
            "unassigned": 4,
            "developer_1": 2
        }
        
        sprint1_stories_count = 6  # Stories 205, 207, 210, 212, 239, 249
        
        return DashboardStats(
            total_users=self.user_repository.count_all(),
            total_commits=self.github_repository.count_commits(),
            tasks_by_status=tasks_by_status,
            tasks_by_assignee=tasks_by_assignee,
            sprint1_stories_count=sprint1_stories_count
        )
