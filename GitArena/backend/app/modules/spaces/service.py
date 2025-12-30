from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.modules.spaces.repository import SpaceRepository
from app.modules.spaces.dto import SpaceCreate, SpaceResponse, SpaceDashboardResponse, DashboardStats, LanguageStats, ContributorStats, ActivityStats, ProjectProgress
from app.modules.github.service import GitHubService
from app.modules.github.dto import ActivityResponse
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

    def get_user_role_in_project(self, space_id: int, user_id: int) -> str:
        """Get user's role in a specific project. Returns 'manager' or 'member'"""
        from app.shared.models import SpaceMember
        
        space = self.repository.get_space_by_id(space_id)
        if not space:
            raise NotFoundException("Space not found")
        
        # Check if user is owner
        if space.owner_id == user_id:
            return "manager"
        
        # Check user's role in space_members
        user_member = self.db.query(SpaceMember).filter(
            SpaceMember.space_id == space_id,
            SpaceMember.user_id == user_id
        ).first()
        
        if not user_member:
            raise NotFoundException("Not a member of this project")
        
        # If role is 'admin' or 'manager', return 'manager', otherwise 'member'
        if user_member.role in ['admin', 'manager']:
            return "manager"
        else:
            return "member"


    async def get_dashboard_stats(self, space_id: int, user_id: int, access_token: str) -> SpaceDashboardResponse:
        from app.shared.models import SpaceMember
        
        space = self.repository.get_space_by_id(space_id)
        if not space:
            raise NotFoundException("Space not found")
        
        # Check user's role in this project
        user_member = self.db.query(SpaceMember).filter(
            SpaceMember.space_id == space_id,
            SpaceMember.user_id == user_id
        ).first()
        
        is_owner = space.owner_id == user_id
        
        if not user_member and not is_owner:
            raise NotFoundException("Not a member of this project")
        
        is_admin = is_owner or (user_member and user_member.role == 'admin')
            
        # Get repository
        repo = space.repositories[0] if space.repositories else None
        if not repo:
             return SpaceDashboardResponse(
                 overview=DashboardStats(total_commits=0, total_prs=0, active_contributors=0, total_lines_code=0),
                 languages=[],
                 leaderboard=[],
                 activity=[],
                 is_admin_view=is_admin
             )
             
        try:
            # 1. Overview Stats
            print(f"DEBUG: Fetching overview stats for repo {repo.id}")
            total_commits = self.db.query(func.count(Commit.id)).filter(Commit.repository_id == repo.id).scalar() or 0
            
            if total_commits == 0:
                print(f"DEBUG: No commits found for repo {repo.id}, attempting sync from GitHub...")
                try:
                    await self.github_service.sync_commits(repo.id, access_token)
                    await self.github_service.sync_pull_requests(repo.id, access_token)
                    await self.github_service.sync_releases(repo.id, access_token)
                    await self.github_service.sync_deployments(repo.id, access_token)
                    await self.github_service.sync_activities(repo.id, access_token)
                    
                    total_commits = self.db.query(func.count(Commit.id)).filter(Commit.repository_id == repo.id).scalar() or 0
                    print(f"DEBUG: After sync, total_commits = {total_commits}")
                except Exception as e:
                    print(f"DEBUG: Failed to auto-sync commits (non-critical, using local data): {e}")
                    # Continue with empty data instead of failing

            total_prs = self.db.query(func.count(PullRequest.id)).filter(PullRequest.repository_id == repo.id).scalar() or 0
            active_contributors = self.db.query(func.count(func.distinct(Commit.author_email))).filter(Commit.repository_id == repo.id).scalar() or 0
            total_lines = self.db.query(func.sum(Commit.additions)).filter(Commit.repository_id == repo.id).scalar() or 0
            
            overview = DashboardStats(
                total_commits=total_commits,
                total_prs=total_prs,
                active_contributors=active_contributors,
                total_lines_code=total_lines
            )
            print(f"DEBUG: Overview stats: {overview}")
            
            # 2. Languages
            try:
                print(f"DEBUG: Fetching languages for repo {repo.id}")
                languages_data = await self.github_service.get_languages(repo.id, access_token)
                total_bytes = sum(languages_data.values())
                languages = [
                    LanguageStats(name=lang, bytes=count, percentage=(count / total_bytes) * 100)
                    for lang, count in languages_data.items()
                ]
            except Exception as e:
                print(f"DEBUG: Failed to fetch languages (non-critical): {e}")
                # Don't fail dashboard if GitHub repo doesn't exist
                languages = []
            
            
            # 3. Leaderboard - ROLE-BASED
            print(f"DEBUG: Fetching leaderboard for repo {repo.id}, is_admin={is_admin}")
            
            if is_admin:
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
            else:
                current_user = self.user_repository.get_by_id(user_id)
                if current_user:
                    user_stats = self.db.query(
                        func.count(Commit.id).label("commits"),
                        func.sum(Commit.additions).label("additions"),
                        func.sum(Commit.deletions).label("deletions")
                    ).filter(
                        Commit.repository_id == repo.id
                    ).filter(
                        (Commit.author_email == current_user.email) | 
                        (Commit.author_name == current_user.username) |
                        (Commit.author_name == current_user.name)
                    ).first()
                    
                    if user_stats and user_stats.commits > 0:
                        leaderboard = [
                            ContributorStats(
                                username=current_user.username or current_user.name or "You",
                                avatar_url=current_user.avatar_url,
                                commits=user_stats.commits or 0,
                                additions=user_stats.additions or 0,
                                deletions=user_stats.deletions or 0
                            )
                        ]
                    else:
                        leaderboard = []
                else:
                    leaderboard = []
            
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
                recent_activities=recent_activities,
                is_admin_view=is_admin
            )
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"DEBUG: Error in get_dashboard_stats: {e}")
            raise e
    def get_project_members(self, project_id: int) -> List[dict]:
        """Get members of a project with user details and stats"""
        members = self.repository.get_members(project_id)
        result = []
        for m in members:
            user = m.user
            # Fetch some stats for the user in this project
            repo_ids = [r.id for r in m.space.repositories]
            commit_count = self.db.query(func.count(Commit.id)).filter(
                Commit.repository_id.in_(repo_ids),
                Commit.author_email == user.email if user.email else Commit.author_name == user.username
            ).scalar() or 0
            
            result.append({
                "id": str(user.id),
                "username": user.username,
                "name": user.name or user.username,
                "email": user.email,
                "avatar_url": user.avatar_url,
                "role": m.role,
                "joined_at": m.created_at.isoformat(),
                "stats": {
                    "commits": commit_count,
                    "prs": 0, # To be implemented
                    "reviews": 0
                }
            })
        return result

    async def add_member(self, project_id: int, username: str, role: str, owner_id: int):
        """Add a member to project by username (only owner can add)"""
        space = self.repository.get_space_by_id(project_id)
        if not space or space.owner_id != owner_id:
            raise NotFoundException("Project not found or unauthorized")
            
        user = self.user_repository.get_by_username(username)
        if not user:
            # Maybe they exist by GitHub ID or something? 
            # For simplicity, let's assume they must exist in our system first.
            raise NotFoundException(f"User {username} not found")
            
        return self.repository.add_member(project_id, user.id, role)

    async def remove_member(self, project_id: int, user_id: int, owner_id: int):
        """Remove a member from project (only owner can remove)"""
        space = self.repository.get_space_by_id(project_id)
        if not space or space.owner_id != owner_id:
            raise NotFoundException("Project not found or unauthorized")
            
        return self.repository.remove_member(project_id, user_id)

    def get_activity_log(self, project_id: int, type_filter: str = None, date_range: str = "7days") -> List[dict]:
        """Get project-wide activity log"""
        space = self.repository.get_space_by_id(project_id)
        if not space:
            return []
            
        repo_ids = [r.id for r in space.repositories]
        query = self.db.query(Activity).filter(Activity.repository_id.in_(repo_ids))
        
        if type_filter:
            query = query.filter(Activity.type == type_filter)
            
        # Simplified date range
        days = 7
        if "30" in str(date_range): days = 30
        elif "90" in str(date_range): days = 90
        
        start_date = datetime.utcnow() - timedelta(days=days)
        query = query.filter(Activity.created_at >= start_date)
        
        activities = query.order_by(Activity.created_at.desc()).limit(100).all()
        
        return [
            {
                "id": str(act.id),
                "type": act.type.lower(),
                "actor": {
                    "name": act.user_login,
                    "avatar": None # We could fetch from User table if linked
                },
                "action": act.action,
                "target": act.title,
                "timestamp": act.created_at.isoformat(),
                "metadata": {"description": act.description}
            } for act in activities
        ]

    def get_analytics(self, project_id: int, time_range: str = "30days") -> dict:
        """Get high-level project analytics"""
        space = self.repository.get_space_by_id(project_id)
        if not space:
            return {}
            
        repo_ids = [r.id for r in space.repositories]
        
        # 1. Commit Trend
        days = 30
        if "7" in str(time_range): days = 7
        elif "90" in str(time_range): days = 90
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        trend_query = self.db.query(
            func.date(Commit.committed_date).label("date"),
            func.count(Commit.id).label("count")
        ).filter(
            Commit.repository_id.in_(repo_ids),
            Commit.committed_date >= start_date
        ).group_by(func.date(Commit.committed_date)).all()
        
        commit_trend = [{"date": str(row.date), "count": row.count} for row in trend_query]
        
        # 2. Language Distribution (Aggregate from all repos)
        lang_distribution = []
        # For simplicity, just use the main repo language for now or aggregate
        # Let's skip complex aggregation for now and return something useful
        
        # 3. Team Metrics
        total_commits = self.db.query(func.count(Commit.id)).filter(Commit.repository_id.in_(repo_ids)).scalar() or 0
        total_prs = self.db.query(func.count(PullRequest.id)).filter(PullRequest.repository_id.in_(repo_ids)).scalar() or 0
        
        return {
            "commitTrend": commit_trend,
            "languageDistribution": [], # Frontend can fetch per repo
            "teamMetrics": {
                "totalCommits": total_commits,
                "totalPRs": total_prs,
                "avgReviewTime": 4.5 # Mock for now
            }
        }
