from sqlalchemy.orm import Session
from app.modules.users.repository import UserRepository
from typing import Optional
import httpx
from app.config.settings import settings
from app.shared.exceptions import NotFoundException
from app.shared.models import Repository, Commit, PullRequest, Issue
from sqlalchemy import func
from app.modules.users.dto import UserCreate, UserResponse, UserProfileStats
import logging

logger = logging.getLogger(__name__)


class UserService:
    def __init__(self, db: Session):
        self.repository = UserRepository(db)
        self.db = db
    
    def get_user_by_id(self, user_id: int) -> UserResponse:
        """Get user by ID with stats"""
        user = self.repository.get_by_id(user_id)
        if not user:
            raise NotFoundException("User not found")
        
        response = UserResponse.model_validate(user)
        
        # Calculate Stats
        # 1. Repositories
        total_repos = self.db.query(func.count(Repository.id)).filter(Repository.user_id == user.id).scalar() or 0
        
        # 2. Commits (Match by email or name - best effort)
        # Assuming user.email is populated from GitHub
        total_commits = 0
        if user.email:
             total_commits = self.db.query(func.count(Commit.id)).filter(
                 (Commit.author_email == user.email) | 
                 (Commit.author_name == user.username) | 
                 (Commit.author_name == user.name)
             ).scalar() or 0
        else:
             total_commits = self.db.query(func.count(Commit.id)).filter(
                 (Commit.author_name == user.username) | 
                 (Commit.author_name == user.name)
             ).scalar() or 0

        # 3. PRs (Match by username as 'author' in PR table is github login)
        total_prs = self.db.query(func.count(PullRequest.id)).filter(PullRequest.author == user.username).scalar() or 0
        
        # 4. Issues
        total_issues = self.db.query(func.count(Issue.id)).filter(Issue.author == user.username).scalar() or 0
        
        response.stats = UserProfileStats(
            total_repositories=total_repos,
            total_commits=total_commits,
            total_prs=total_prs,
            total_issues=total_issues
        )
        
        return response
    
    async def get_github_user_info(self, access_token: str) -> dict:
        """Fetch user info from GitHub API"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.github.com/user",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json"
                }
            )
            response.raise_for_status()
            return response.json()
    
    def create_or_update_user(self, github_user: dict, access_token: str) -> UserResponse:
        """Create or update user from GitHub data"""
        logger.info(f"USER_SERVICE: create_or_update_user for github_id={github_user.get('id')}")
        existing_user = self.repository.get_by_github_id(str(github_user["id"]))

        
        user_data = UserCreate(
            github_id=str(github_user["id"]),
            github_login=github_user["login"],
            username=github_user["login"],
            email=github_user.get("email"),
            name=github_user.get("name"),
            avatar_url=github_user.get("avatar_url"),
            access_token=access_token,
            bio=github_user.get("bio"),
            location=github_user.get("location"),
            company=github_user.get("company"),
            blog=github_user.get("blog"),
            twitter_username=github_user.get("twitter_username")
        )
        
        if existing_user:
            logger.info(f"USER_SERVICE: Updating existing user id={existing_user.id}")
            user = self.repository.update(
                existing_user,
                username=user_data.username,
                github_login=user_data.github_login,
                email=user_data.email,
                name=user_data.name,
                avatar_url=user_data.avatar_url,
                access_token=access_token,
                bio=user_data.bio,
                location=user_data.location,
                company=user_data.company,
                blog=user_data.blog,
                twitter_username=user_data.twitter_username
            )
        else:
            logger.info("USER_SERVICE: Creating new user")
            user = self.repository.create(user_data)
        
        logger.info(f"USER_SERVICE: Success for user_id={user.id}")
        return UserResponse.model_validate(user)

    
    def get_user_dashboard_stats(self, user_id: int) -> "UserDashboardResponse":
        """Get aggregated dashboard stats for a user"""
        from app.modules.users.dashboard_dto import (
            UserDashboardResponse, LanguageStats, CommitStats, 
            PRStats, RepoStats, ActivityStats
        )
        from sqlalchemy import desc
        from datetime import datetime, timedelta

        user = self.get_user_by_id(user_id)
        
        # 1. Top Repositories (by stars, then updated_at)
        repos = self.db.query(Repository).filter(
            Repository.user_id == user.id
        ).order_by(desc(Repository.stargazers_count), desc(Repository.updated_at)).limit(3).all()
        
        top_repos_data = []
        for repo in repos:
            # Simple trend mock or calculation? Let's use mock for now or calculate based on recent activity?
            # Let's verify if we can query recent activity for this repo
            recent_commits_count = self.db.query(func.count(Commit.id)).filter(
                Commit.repository_id == repo.id,
                Commit.committed_date >= datetime.utcnow() - timedelta(days=7)
            ).scalar()
            trend = f"+{recent_commits_count}" if recent_commits_count > 0 else "0"
            
            top_repos_data.append(RepoStats(
                name=repo.name,
                stars=repo.stargazers_count,
                language=repo.language or "Unknown",
                trend=trend
            ))

        # 2. Recent Commits (Global for user)
        # Find commits by author email or name
        commits_query = self.db.query(Commit, Repository).join(Repository).filter(
            (Commit.author_email == user.email) | (Commit.author_name == user.username)
        ).order_by(desc(Commit.committed_date)).limit(5).all()
        
        recent_commits_data = []
        for commit, repo in commits_query:
            # Format time diff
            diff = datetime.utcnow() - commit.committed_date
            if diff.days > 0:
                time_str = f"{diff.days}d ago"
            elif diff.seconds > 3600:
                time_str = f"{diff.seconds // 3600}h ago"
            else:
                time_str = f"{diff.seconds // 60}m ago"
                
            recent_commits_data.append(CommitStats(
                message=commit.message,
                repo=repo.name,
                time=time_str,
                additions=commit.additions,
                deletions=commit.deletions
            ))

        # 3. Language Distribution (Aggregate from all user repos)
        # Verify if we have language data. GitHub API returns map per repo.
        # We stored primary language in Repository table.
        # For better accuracy we would need a separate table for repo languages, but let's use primary for now.
        lang_counts = self.db.query(
            Repository.language, func.count(Repository.id)
        ).filter(
            Repository.user_id == user.id,
            Repository.language.isnot(None)
        ).group_by(Repository.language).all()
        
        total_repos_count = sum(c for _, c in lang_counts)
        language_data = []
        COLORS = ['bg-blue-500', 'bg-blue-400', 'bg-blue-600', 'bg-indigo-500', 'bg-sky-500']
        
        for i, (lang, count) in enumerate(lang_counts):
            percentage = (count / total_repos_count * 100) if total_repos_count > 0 else 0
            language_data.append(LanguageStats(
                name=lang,
                percentage=round(percentage, 1),
                color=COLORS[i % len(COLORS)]
            ))
            
        # 4. PR Status
        open_prs = self.db.query(func.count(PullRequest.id)).filter(PullRequest.author == user.username, PullRequest.state == 'open').scalar() or 0
        merged_prs = self.db.query(func.count(PullRequest.id)).filter(PullRequest.author == user.username, PullRequest.state == 'closed', PullRequest.merged_at.isnot(None)).scalar() or 0
        closed_prs = self.db.query(func.count(PullRequest.id)).filter(PullRequest.author == user.username, PullRequest.state == 'closed', PullRequest.merged_at.is_(None)).scalar() or 0
        
        pr_status_data = [
            PRStats(label='Open', count=open_prs, color='text-blue-400', bgColor='bg-blue-500/10'),
            PRStats(label='Merged', count=merged_prs, color='text-green-400', bgColor='bg-green-500/10'), # Changed color to green for merged
            PRStats(label='Closed', count=closed_prs, color='text-slate-400', bgColor='bg-slate-500/10'),
        ]

        # 5. Weekly Activity (last 7 days commit counts)
        weekly_activity = []
        today = datetime.utcnow().date()
        # Ensure we align with Monday-Sunday or just last 7 days? Frontend expects 7 values.
        # Let's do last 7 days ending today.
        for i in range(6, -1, -1):
            date = today - timedelta(days=i)
            # Count commits for this day
            count = self.db.query(func.count(Commit.id)).filter(
                (Commit.author_email == user.email) | (Commit.author_name == user.username),
                func.date(Commit.committed_date) == date
            ).scalar() or 0
            weekly_activity.append(count)

        # 6. Heatmap Data (last 365 days)
        # Optimize: Group by date query
        year_ago = today - timedelta(days=365)
        heatmap_query = self.db.query(
            func.date(Commit.committed_date).label('date'),
            func.count(Commit.id).label('count')
        ).filter(
            (Commit.author_email == user.email) | (Commit.author_name == user.username),
            Commit.committed_date >= year_ago
        ).group_by(func.date(Commit.committed_date)).all()
        
        heatmap_data = []
        # Convert query result to map for easy lookup
        heatmap_map = {str(row.date): row.count for row in heatmap_query}
        
        # We need to fill in zeros? Or frontend handles sparse data? Frontend handles it if we pass array of days.
        # Actually standard heatmap usually expects sparse data or full data depending on implementation.
        # Our ContributionHeatmap component expects array of ContributionDay.
        
        # Let's iterate and build
        current = year_ago
        while current <= today:
            d_str = str(current)
            count = heatmap_map.get(d_str, 0)
            level = 0
            if count > 0:
                if count < 3: level = 1
                elif count < 6: level = 2
                elif count < 10: level = 3
                else: level = 4
            
            # To reduce payload size, maybe only send days with > 0? 
            # Frontend generates sample data if empty, but if we provide data, does it merge?
            # Looking at frontend code: "const contributions = data || generateSampleData();"
            # So we should provide full data or at least enough.
            
            heatmap_data.append(ActivityStats(
                date=d_str,
                count=count,
                level=level
            ))
            current += timedelta(days=1)
            
        return UserDashboardResponse(
            languages=language_data,
            recent_commits=recent_commits_data,
            pr_status=pr_status_data,
            top_repos=top_repos_data,
            weekly_activity=weekly_activity,
            heatmap_data=heatmap_data
        )

    async def sync_all_user_projects(self, user_id: int, access_token: str) -> dict:
        """Sync all projects for a user"""
        from app.modules.spaces.service import SpaceService
        
        space_service = SpaceService(self.db)
        spaces = space_service.get_my_spaces(user_id)
        
        results = {
            "total_synced": 0,
            "failed": 0,
            "errors": []
        }
        
        for space in spaces:
            try:
                # We reuse the sync_project_data logic but maybe less verbose or optimized
                # For now let's just trigger it seriously.
                # Note: This might be slow if many projects. Ideally use background tasks.
                role = space_service.get_user_role_in_project(space.id, user_id)
                if role in ['manager', 'owner']: # Only sync if manager/owner? Or everyone?
                    await space_service.sync_project_data(space.id, user_id, access_token)
                    results["total_synced"] += 1
            except Exception as e:
                results["failed"] += 1
                logger.error(f"Failed to sync space {space.id}: {e}")
                results["errors"].append(str(e))
                
        return results
