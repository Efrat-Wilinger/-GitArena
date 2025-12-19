from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.modules.spaces.repository import SpaceRepository
from app.modules.spaces.dto import SpaceCreate, SpaceResponse, SpaceDashboardResponse, DashboardStats, LanguageStats, ContributorStats, ActivityStats, ProjectProgress
from app.modules.github.service import GitHubService
from app.modules.users.repository import UserRepository
from app.shared.models import User, Commit, PullRequest, Issue, Release, Deployment, Activity
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
                    await self.github_service.sync_pull_requests(repo.id, access_token) # Trigger PR sync too
                    await self.github_service.sync_releases(repo.id, access_token) # Trigger Release sync
                    await self.github_service.sync_deployments(repo.id, access_token) # Trigger Deployment sync
                    await self.github_service.sync_activities(repo.id, access_token) # Refresh activity feed
                    
                    # Re-fetch count after sync
                    total_commits = self.db.query(func.count(Commit.id)).filter(Commit.repository_id == repo.id).scalar() or 0
                except Exception as e:
                    print(f"DEBUG: Failed to auto-sync commits: {e}")

            # Count PRs from database as we now sync them
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
            # Group by author email to handle name variations, but select name and avatar too.
            # Limitation: This simple grouping might pick an arbitrary name if they changed it, but good enough for now.
            # We'll fetch the most recent commit for each author to get the latest avatar? 
            # Or just group by author_name for simplicity as before, but we need to fetch the avatar_url. 
            # Since we don't store avatar_url in Commit yet (my bad in implementation plan check), we need to fetch it from GitHub users or cache it.
            # WAIT, I see User model has avatar_url, but Commit table does NOT have avatar_url column in the model I saw earlier.
            # Let's check `Commit` model again. It has `author_email`.
            
            # Strategy: Get top contributors by stats, then for each one, try to find a User in our DB with that email (if they logged in) 
            # OR use the `avatar_url` from the last commit if we were storing it.
            # I didn't add avatar_url to Commit model in the previous step.
            # Let's just return None for now but fetch real stats.
            
            leaderboard_query = self.db.query(
                Commit.author_name,
                func.count(Commit.id).label("commits"),
                func.sum(Commit.additions).label("additions"),
                func.sum(Commit.deletions).label("deletions")
            ).filter(Commit.repository_id == repo.id).group_by(Commit.author_name).order_by(desc("commits")).limit(10).all()
            
            leaderboard = [
                ContributorStats(
                    username=row.author_name or "Unknown",
                    avatar_url=None, # Tuple index 5 if I add it, but for now None. Frontend shows initial/color if None.
                    commits=row.commits,
                    additions=row.additions or 0,
                    deletions=row.deletions or 0
                ) for row in leaderboard_query
            ]
            
            # 4. Activity (Last 30 days)
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
            
            # 5. Project Progress (Real Logic)
            # Planning: Based on Issues (Closed / Total)
            # Sync issues first
            try:
                # Only sync if we suspect data is stale or on explicit request? 
                # For now let's sync if total issues is 0 same as commits, or maybe always sync for freshness?
                # Let's sync if < 10 seconds since last sync? No, keep it simple. Sync always for now or use the "total=0" trigger.
                # Actually, let's behave like commits.
                pass 
            except:
                pass

            # We need to import Issue model at top first, let's assume I did or I will.
            # Wait, I need to add Issue import to top of this file first.
            # But let's write the query assuming it's imported.
            
            # Sync Issues dynamically
            try:
                await self.github_service.sync_issues(repo.id, access_token)
            except Exception as e:
                print(f"DEBUG: Failed to sync issues: {e}")

            total_issues = self.db.query(func.count(Issue.id)).filter(Issue.repository_id == repo.id).scalar() or 0
            closed_issues = self.db.query(func.count(Issue.id)).filter(Issue.repository_id == repo.id, Issue.state == 'closed').scalar() or 0
            planning_progress = int((closed_issues / total_issues * 100)) if total_issues > 0 else 0
            
            # Development: Based on PRs (Merged or Closed / Total)
            # PRs are already synced above
            merged_prs = self.db.query(func.count(PullRequest.id)).filter(PullRequest.repository_id == repo.id, PullRequest.state == 'closed').scalar() or 0 # Using 'closed' as proxy for merged/completed for now
            development_progress = int((merged_prs / total_prs * 100)) if total_prs > 0 else 0
            
            # Testing logic (still mock for now but looking for releases as proxy)
            total_releases = self.db.query(func.count(Release.id)).filter(Release.repository_id == repo.id).scalar() or 0
            testing_progress = min(100, total_releases * 25) # Mock: Each release adds 25% testing confidence?
            
            # Deployment: Based on real deployments
            total_deployments = self.db.query(func.count(Deployment.id)).filter(Deployment.repository_id == repo.id).scalar() or 0
            active_deployments = self.db.query(func.count(Deployment.id)).filter(Deployment.repository_id == repo.id, Deployment.state != 'failed').scalar() or 0
            deployment_progress = 100 if active_deployments > 0 else 0
            
            overall_progress = int((planning_progress + development_progress + testing_progress + deployment_progress) / 4)
            
            project_progress = ProjectProgress(
                overall=overall_progress,
                planning=planning_progress,
                development=development_progress,
                testing=testing_progress,
                deployment=deployment_progress
            )

            # 6. Recent Activities
            activities_query = self.db.query(Activity).filter(Activity.repository_id == repo.id).order_by(Activity.created_at.desc()).limit(20).all()
            recent_activities = [ActivityResponse.model_validate(act) for act in activities_query]

            return SpaceDashboardResponse(
                overview=overview,
                languages=languages,
                leaderboard=leaderboard,
                activity=activity,
                progress=project_progress,
                recent_activities=recent_activities
            )
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"DEBUG: Error in get_dashboard_stats: {e}")
            raise e
