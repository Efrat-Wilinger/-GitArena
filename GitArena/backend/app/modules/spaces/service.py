from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.modules.spaces.repository import SpaceRepository
from app.modules.spaces.dto import SpaceCreate, SpaceResponse, SpaceDashboardResponse, DashboardStats, LanguageStats, ContributorStats, ActivityStats
from app.modules.github.service import GitHubService
from app.modules.users.repository import UserRepository
from app.shared.models import User, Commit, PullRequest
from app.shared.exceptions import NotFoundException
from typing import List
from datetime import datetime, timedelta

class SpaceService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = SpaceRepository(db)
        self.github_service = GitHubService(db)
        self.user_repository = UserRepository(db)

    async def create_space_with_contributors(self, space_data: SpaceCreate, owner_id: int, access_token: str) -> SpaceResponse:
        # 1. Create Space
        space = self.repository.create_space(space_data, owner_id)
        
        # 2. Link Repository to Space
        repo = self.github_service.repository.get_repository_by_id(space_data.repository_id)
        if repo:
            self.github_service.repository.update_repository(repo, space_id=space.id)
        
        # 3. Fetch Contributors from GitHub
        contributors = await self.github_service.get_contributors(space_data.repository_id, access_token)
        
        # 4. Add Contributors as Members
        for contributor in contributors:
            github_id = str(contributor["id"])
            username = contributor["login"]
            
            # Skip if contributor is the owner
            owner = self.user_repository.get_by_id(owner_id)
            if owner.github_id == github_id:
                continue
                
            # Check if user exists, if not create "Shadow User"
            user = self.user_repository.get_by_github_id(github_id)
            if not user:
                user = User(
                    github_id=github_id,
                    username=username,
                    avatar_url=contributor["avatar_url"],
                    role="member" # Default system role
                )
                self.db.add(user)
                self.db.commit()
                self.db.refresh(user)
            
            # Add to Space
            self.repository.add_member(space.id, user.id, role="viewer")
            
        return SpaceResponse.model_validate(space)

    def get_my_spaces(self, user_id: int) -> List[SpaceResponse]:
        spaces = self.repository.get_user_spaces(user_id)
        return [SpaceResponse.model_validate(s) for s in spaces]

    async def get_dashboard_stats(self, space_id: int, user_id: int, access_token: str) -> SpaceDashboardResponse:
        space = self.repository.get_space_by_id(space_id)
        if not space:
            raise NotFoundException("Space not found")
            
        # Get repository
        repo = space.repositories[0] if space.repositories else None
        if not repo:
             # Return empty stats if no repo linked
             return SpaceDashboardResponse(
                 overview=DashboardStats(total_commits=0, total_prs=0, active_contributors=0, total_lines_code=0),
                 languages=[],
                 leaderboard=[],
                 activity=[]
             )
             
        try:
            # 1. Overview Stats
            print(f"DEBUG: Fetching overview stats for repo {repo.id}")
            total_commits = self.db.query(func.count(Commit.id)).filter(Commit.repository_id == repo.id).scalar() or 0
            
            # Auto-sync if no commits found
            if total_commits == 0:
                print(f"DEBUG: No commits found for repo {repo.id}, syncing from GitHub...")
                try:
                    await self.github_service.sync_commits(repo.id, access_token)
                    # Re-fetch count after sync
                    total_commits = self.db.query(func.count(Commit.id)).filter(Commit.repository_id == repo.id).scalar() or 0
                except Exception as e:
                    print(f"DEBUG: Failed to auto-sync commits: {e}")

            total_prs = self.db.query(func.count(PullRequest.id)).filter(PullRequest.repository_id == repo.id).scalar() or 0
            
            # Active contributors (unique authors in commits)
            active_contributors = self.db.query(func.count(func.distinct(Commit.author_email))).filter(Commit.repository_id == repo.id).scalar() or 0
            
            # Total lines (sum of additions)
            total_lines = self.db.query(func.sum(Commit.additions)).filter(Commit.repository_id == repo.id).scalar() or 0
            
            overview = DashboardStats(
                total_commits=total_commits,
                total_prs=total_prs,
                active_contributors=active_contributors,
                total_lines_code=total_lines
            )
            print(f"DEBUG: Overview stats: {overview}")
            
            # 2. Languages (from GitHub API)
            try:
                print(f"DEBUG: Fetching languages for repo {repo.id}")
                languages_data = await self.github_service.get_languages(repo.id, access_token)
                total_bytes = sum(languages_data.values())
                languages = [
                    LanguageStats(name=lang, bytes=count, percentage=(count / total_bytes) * 100)
                    for lang, count in languages_data.items()
                ]
            except Exception as e:
                print(f"DEBUG: Failed to fetch languages: {e}")
                languages = []
            
            # 3. Leaderboard
            print(f"DEBUG: Fetching leaderboard for repo {repo.id}")
            leaderboard_query = self.db.query(
                Commit.author_name,
                func.count(Commit.id).label("commits"),
                func.sum(Commit.additions).label("additions"),
                func.sum(Commit.deletions).label("deletions")
            ).filter(Commit.repository_id == repo.id).group_by(Commit.author_name).order_by(desc("commits")).limit(10).all()
            
            leaderboard = [
                ContributorStats(
                    username=row.author_name or "Unknown",
                    avatar_url=None, 
                    commits=row.commits,
                    additions=row.additions or 0,
                    deletions=row.deletions or 0
                ) for row in leaderboard_query
            ]
            
            # 4. Activity (Last 30 days)
            print(f"DEBUG: Fetching activity for repo {repo.id}")
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            activity_query = self.db.query(
                func.date(Commit.committed_date).label("date"),
                func.count(Commit.id).label("count")
            ).filter(
                Commit.repository_id == repo.id,
                Commit.committed_date >= thirty_days_ago
            ).group_by(func.date(Commit.committed_date)).all()
            
            activity = [
                ActivityStats(date=str(row.date), count=row.count)
                for row in activity_query
            ]
            
            return SpaceDashboardResponse(
                overview=overview,
                languages=languages,
                leaderboard=leaderboard,
                activity=activity
            )
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"DEBUG: Error in get_dashboard_stats: {e}")
            raise e
