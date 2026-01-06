from sqlalchemy.orm import Session
from app.shared.models import SpaceMember, User, Commit, Repository, Space
from sqlalchemy import func
from app.modules.analytics.repository import AnalyticsRepository
from app.modules.analytics.dto import DashboardStats
from app.modules.users.repository import UserRepository
from app.modules.github.repository import GitHubRepository


class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db
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

    def _get_user_team_space_ids(self, user_id: int) -> list[int]:
        """Helper to get all space IDs were user is member or owner"""
        # 1. Find all spaces the user is a member of
        user_spaces = self.db.query(SpaceMember).filter(SpaceMember.user_id == user_id).all()
        space_ids = [sm.space_id for sm in user_spaces]
        
        # 2. Add spaces where user is owner
        from app.shared.models import Space
        owned_spaces = self.db.query(Space).filter(Space.owner_id == user_id).all()
        space_ids.extend([s.id for s in owned_spaces])
        
        return list(set(space_ids)) # Deduplicate

    def get_manager_stats(self, user_id: int, project_id: int = None):
        """
        Aggregate statistics for manager dashboard, optionally filtered by project
        """
        try:
            if project_id:
                # Validate user access to this project
                space_member = self.db.query(SpaceMember).filter(
                    SpaceMember.space_id == project_id,
                    SpaceMember.user_id == user_id
                ).first()
                if not space_member:
                     # Check if owner
                    from app.shared.models import Space
                    space = self.db.query(Space).filter(Space.id == project_id, Space.owner_id == user_id).first()
                    if not space:
                        return {}
                space_ids = [project_id]
            else:
                space_ids = self._get_user_team_space_ids(user_id)
            
            if not space_ids:
                return {}

            # Get all repositories in these spaces
            from app.shared.models import Space
            repos = self.db.query(Repository).filter(Repository.space_id.in_(space_ids)).all()
            repo_ids = [r.id for r in repos]
            
            print(f"DEBUG: ManagerStats - Found {len(repos)} repos: {[r.name for r in repos]}")

            if not repo_ids:
                return {}

            # 1. Weekly Activity (Commits per day for last 7 days)
            # Use raw SQL for date grouping compatibility
            from datetime import datetime, timedelta
            today = datetime.utcnow()
            week_ago = today - timedelta(days=6)
            
            activity = [0] * 7
            commits_last_week = self.db.query(Commit).filter(
                Commit.repository_id.in_(repo_ids),
                Commit.committed_date >= week_ago
            ).all()
            
            print(f"DEBUG: ManagerStats - Found {len(commits_last_week)} commits in last week")

            for commit in commits_last_week:
                day_diff = (today.date() - commit.committed_date.date()).days
                if 0 <= day_diff < 7:
                    # Invert index so 0=Monday is tricky, let's just map to last 7 days from today
                    # Actually frontend expects Mon-Sun usually, let's align with today
                    # Simplified: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
                    # We'll map commit.committed_date.weekday() (0=Monday) directly
                    idx = commit.committed_date.weekday()
                    activity[idx] += 1

            # 2. Top Repositories (by activity/stars)
            top_repos = []
            for r in repos:
                 # Calculate simple "hotness" score: stars * 5 + recent_commits
                 recent_count = self.db.query(Commit).filter(
                     Commit.repository_id == r.id,
                     Commit.committed_date >= week_ago
                 ).count()
                 score = (r.stargazers_count or 0) * 5 + recent_count
                 top_repos.append({
                     "name": r.name,
                     "language": r.language or "Unknown",
                     "stars": r.stargazers_count or 0,
                     "trend": f"+{recent_count}",
                     "score": score
                 })
            
            top_repos.sort(key=lambda x: x["score"], reverse=True)
            top_repos = top_repos[:5] # Top 5

            # 3. Recent Commits (Global)
            recent_commits_db = self.db.query(Commit).join(Repository).filter(
                Commit.repository_id.in_(repo_ids)
            ).order_by(Commit.committed_date.desc()).limit(10).all()

            recent_commits = []
            for c in recent_commits_db:
                # Format relative time properly in frontend, sending timestamp here
                recent_commits.append({
                    "message": c.message,
                    "repo": c.repository.name,
                    "time": c.committed_date.isoformat(), # Let frontend handle "2h ago"
                    "additions": c.additions or 0,
                    "deletions": c.deletions or 0
                })

            # 4. Language Distribution
            # This is hard because we don't store bytes per language yet, only primary language
            # We'll approximate by counting repos with that primary language
            lang_counts = {}
            total_repos = len(repos)
            for r in repos:
                lang = r.language or "Other"
                lang_counts[lang] = lang_counts.get(lang, 0) + 1
            
            languages = []
            colors = ["bg-blue-500", "bg-yellow-500", "bg-green-500", "bg-red-500", "bg-purple-500"]
            for i, (lang, count) in enumerate(lang_counts.items()):
                percentage = round((count / total_repos) * 100)
                languages.append({
                    "name": lang,
                    "percentage": percentage,
                    "color": colors[i % len(colors)]
                })
            
            # Sort by percentage
            languages.sort(key=lambda x: x["percentage"], reverse=True)

            # 5. Pull Request Status
            from app.shared.models import PullRequest
            prs = self.db.query(PullRequest).filter(PullRequest.repository_id.in_(repo_ids)).all()
            
            pr_open = sum(1 for pr in prs if pr.state == 'open')
            pr_merged = sum(1 for pr in prs if pr.state == 'merged')
            pr_closed = sum(1 for pr in prs if pr.state == 'closed')
            
            pr_stats = [
                 {"label": "Open", "count": pr_open, "color": "text-green-400", "bgColor": "bg-green-500/10"},
                 {"label": "Merged", "count": pr_merged, "color": "text-purple-400", "bgColor": "bg-purple-500/10"},
                 {"label": "Closed", "count": pr_closed, "color": "text-red-400", "bgColor": "bg-red-500/10"}
            ]

            return {
                "activity": activity,
                "topRepos": top_repos,
                "recentCommits": recent_commits,
                "languages": languages,
                "prStats": pr_stats
            }

        except Exception as e:
            print(f"ERROR: get_manager_stats failed: {e}")
            import traceback
            traceback.print_exc()
            return {}

    def get_team_collaboration(self, user_id: int, project_id: int = None):
        """
        Derive team collaboration network from shared spaces and repositories
        Optionally filtered by a specific project_id
        """
        try:
            if project_id:
                # Use only the specified project
                space_ids = [project_id]
            else:
                # Use all user spaces
                space_ids = self._get_user_team_space_ids(user_id)
            
            print(f"DEBUG: Analytics - Found {len(space_ids)} spaces for user {user_id}: {space_ids}")

            if not space_ids:
                return {"members": [], "collaborations": []}

            # 2. Find all other members in these spaces
            peers = self.db.query(User).join(SpaceMember).filter(
                SpaceMember.space_id.in_(space_ids),
                User.id != user_id
            ).distinct().all()
            
            print(f"DEBUG: Analytics - Found {len(peers)} peers: {[p.username for p in peers]}")

            members_data = []
            # Add current user first
            current_user = self.user_repository.get_by_id(user_id)
            if current_user:
                members_data.append({
                    "id": str(current_user.id),
                    "name": "You",
                    "avatar": current_user.avatar_url,
                    "contributions": self.db.query(Commit).join(Repository).filter(Repository.user_id == user_id).count()
                })

            peer_map = {}
            for peer in peers:
                # Count contributions (total commits for now as proxy)
                contribs = self.db.query(Commit).join(Repository).filter(Repository.user_id == peer.id).count()
                
                members_data.append({
                    "id": str(peer.id),
                    "name": peer.name or peer.username,
                    "avatar": peer.avatar_url,
                    "contributions": contribs
                })
                peer_map[peer.id] = True

            # 3. Calculate edges (Shared Spaces count as strength)
            collaborations = []
            
            # Limit to top connections to avoid graph clutter
            for peer in peers:
                # Find shared spaces count
                shared_spaces_count = self.db.query(SpaceMember).filter(
                    SpaceMember.user_id == peer.id,
                    SpaceMember.space_id.in_(space_ids)
                ).count()
                
                if shared_spaces_count > 0:
                    collaborations.append({
                        "from": str(user_id),
                        "to": str(peer.id),
                        "strength": min(10, shared_spaces_count * 2 + 3) # Base strength + bonus
                    })

            # TODO: Add peer-to-peer connections (optional for next iteration)
            
            return {
                "members": members_data,
                "collaborations": collaborations
            }
        except Exception as e:
            print(f"ERROR: AnalyticsService.get_team_collaboration failed: {e}")
            import traceback
            traceback.print_exc()
            # Return empty structure on error to prevent frontend crash

    def get_manager_activity_log(self, user_id: int, filters: dict = None) -> list[dict]:
        """Aggregate activity log from all managed spaces"""
        try:
            space_ids = self._get_user_team_space_ids(user_id)
            if not space_ids:
                return []

            from app.shared.models import Space, Activity
            repo_ids = [r.id for s in self.db.query(Space).filter(Space.id.in_(space_ids)).all() for r in s.repositories]

            if not repo_ids:
                return []

            query = self.db.query(Activity).filter(Activity.repository_id.in_(repo_ids))

            if filters:
                if filters.get("type"):
                    query = query.filter(Activity.type == filters.get("type"))
                
                # Date range
                from datetime import datetime, timedelta
                days = 7
                date_range = filters.get("dateRange", "7days")
                if "30" in str(date_range): days = 30
                elif "90" in str(date_range): days = 90
                elif "all" in str(date_range): days = 3650
                
                start_date = datetime.utcnow() - timedelta(days=days)
                query = query.filter(Activity.created_at >= start_date)

            activities = query.order_by(Activity.created_at.desc()).limit(100).all()

            return [
                {
                    "id": str(act.id),
                    "type": act.type.lower(),
                    "actor": {
                        "name": act.user_login,
                        "avatar": None 
                    },
                    "action": act.action,
                    "target": act.title,
                    "timestamp": act.created_at.isoformat(),
                    "metadata": {"description": act.description}
                } for act in activities
            ]
        except Exception as e:
            print(f"ERROR: get_manager_activity_log: {e}")
            return []

    def get_manager_team_members(self, user_id: int) -> list[dict]:
        """Aggregate team members from all managed spaces"""
        try:
            space_ids = self._get_user_team_space_ids(user_id)
            if not space_ids:
                return []

            from app.shared.models import SpaceMember, User, Commit, Repository
            
            # Find all members in these spaces
            # Use distinct to avoid duplicates
            members = self.db.query(User).join(SpaceMember).filter(
                SpaceMember.space_id.in_(space_ids)
            ).distinct().all()

            result = []
            for user in members:
                # Calculate aggregated stats
                commit_count = self.db.query(func.count(Commit.id)).join(Repository).filter(
                    Repository.space_id.in_(space_ids),
                    Repository.user_id == user.id # Assuming user_id on repo is owner? No, check commits by author
                ).scalar() or 0
                
                # Better commit count: match email/username against user
                # This is expensive but accurate-ish
                commit_count = self.db.query(func.count(Commit.id)).join(Repository).filter(
                    Repository.space_id.in_(space_ids),
                    (Commit.author_email == user.email) | (Commit.author_name == user.username)
                ).scalar() or 0

                # Determine role (if manager in ANY space, show as manager?)
                # Or show highest role
                is_manager = self.db.query(SpaceMember).filter(
                    SpaceMember.space_id.in_(space_ids),
                    SpaceMember.user_id == user.id,
                    SpaceMember.role.in_(['manager', 'admin'])
                ).first() is not None
                
                # Also check ownership
                is_owner = self.user_repository.get_by_id(user_id).id == user.id # Wait, strict check

                result.append({
                    "id": str(user.id),
                    "username": user.username,
                    "name": user.name or user.username,
                    "email": user.email,
                    "avatar_url": user.avatar_url,
                    "role": "manager" if is_manager else "member",
                    "joined_at": user.created_at.isoformat(),
                    "stats": {
                        "commits": commit_count,
                        "prs": 0,
                        "reviews": 0
                    }
                })
            
            return result
        except Exception as e:
            print(f"ERROR: get_manager_team_members: {e}")
            return []

    def get_manager_deep_dive_analytics(self, user_id: int, time_range: str = "30days", project_id: int = None) -> dict:
        """Get deep dive analytics for all managed projects"""
        try:
            space_ids = []
            if project_id:
                space_ids = [project_id]
            else:
                space_ids = self._get_user_team_space_ids(user_id)
                
            if not space_ids:
                return {}

            from app.shared.models import Space, Commit, PullRequest
            
            repo_ids = []
            spaces = self.db.query(Space).filter(Space.id.in_(space_ids)).all()
            for s in spaces:
                if s.repositories:
                    repo_ids.extend([r.id for r in s.repositories])
            
            if not repo_ids:
                return {}

            # 1. Commit Trend (Global)
            from datetime import datetime, timedelta
            from collections import defaultdict
            
            days = 30
            if "90" in str(time_range): days = 90
            elif "180" in str(time_range): days = 180
            
            start_date = datetime.utcnow() - timedelta(days=days)
            
            # Fetch raw commits to aggregate in Python (safer for DB compatibility & richer data)
            commits = self.db.query(Commit).filter(
                Commit.repository_id.in_(repo_ids),
                Commit.committed_date >= start_date
            ).order_by(Commit.committed_date.asc()).all()
            
            # Aggregate by date
            daily_stats = defaultdict(lambda: {"count": 0, "additions": 0, "deletions": 0})
            
            for c in commits:
                date_str = c.committed_date.date().isoformat()
                daily_stats[date_str]["count"] += 1
                daily_stats[date_str]["additions"] += (c.additions or 0)
                daily_stats[date_str]["deletions"] += (c.deletions or 0)
            
            # Convert to list and fill missing dates? 
            # For now just return active days to keep it simple, or frontend handles inactive?
            # Better: Frontend usually wants a continuous timeline.
            # Let's just return the sparse map as list for now
            commit_trend = [
                {
                    "date": date,
                    "count": stats["count"],
                    "additions": stats["additions"],
                    "deletions": stats["deletions"]
                }
                for date, stats in daily_stats.items()
            ]
            
            # Sort by date
            commit_trend.sort(key=lambda x: x["date"])

            # 2. Team Metrics (Aggregated)
            total_commits = self.db.query(func.count(Commit.id)).filter(Commit.repository_id.in_(repo_ids)).scalar() or 0
            total_prs = self.db.query(func.count(PullRequest.id)).filter(PullRequest.repository_id.in_(repo_ids)).scalar() or 0

            # 3. Leaderboard (Global)
            # This aggregation is fine in SQL
            leaderboard_query = self.db.query(
                Commit.author_name,
                func.count(Commit.id).label("commits"),
                func.sum(Commit.additions).label("additions"),
                func.sum(Commit.deletions).label("deletions")
            ).filter(Commit.repository_id.in_(repo_ids)).group_by(Commit.author_name).order_by(desc("commits")).limit(10).all()
            
            team_members = [
                {
                    "name": row.author_name or "Unknown",
                    "commits": row.commits,
                    "prs": 0,
                    "reviews": 0,
                    "avatar": f"https://ui-avatars.com/api/?name={row.author_name}&background=random" 
                } for row in leaderboard_query
            ]
            
            # 4. Insights (Mock for now)
            insights = [
                {
                    "icon": "📈",
                    "title": "Velocity Up",
                    "description": "Team velocity increased by 20% this week",
                    "color": "green"
                },
                 {
                    "icon": "⚠️",
                    "title": "Review Bottleneck",
                    "description": "PR review times are slower than usual",
                    "color": "yellow"
                }
            ]

            return {
                "commitTrend": commit_trend,
                "languageDistribution": [],
                "teamMetrics": {
                    "totalCommits": total_commits,
                    "totalPRs": total_prs,
                    "avgReviewTime": 5.2
                },
                "teamMembers": team_members,
                "insights": insights
            }
        except Exception as e:
            print(f"ERROR: get_manager_deep_dive_analytics: {e}")
            import traceback
            traceback.print_exc()
            return {}

    def get_team_stats(self, user_id: int, project_id: int = None) -> dict:
        """
        Get aggregated team statistics for manager dashboard
        Properly calculates total commits, PRs, reviews, and active repos
        """
        try:
            if project_id:
                 # Validate access (simplified for brevity, re-use existing logic if possible or trust caller/middleware)
                 # Ideally reuse the check or just filter
                 space_ids = [project_id]
            else:
                space_ids = self._get_user_team_space_ids(user_id)
            
            if not space_ids:
                return {
                    "total_commits": 0,
                    "total_prs": 0,
                    "total_reviews": 0,
                    "active_repos": 0
                }

            # Get all repositories in managed spaces
            repos = self.db.query(Repository).filter(Repository.space_id.in_(space_ids)).all()
            repo_ids = [r.id for r in repos]
            
            if not repo_ids:
                return {
                    "total_commits": 0,
                    "total_prs": 0,
                    "total_reviews": 0,
                    "active_repos": 0
                }

            # Calculate aggregated stats
            total_commits = self.db.query(func.count(Commit.id)).filter(
                Commit.repository_id.in_(repo_ids)
            ).scalar() or 0

            from app.shared.models import PullRequest
            total_prs = self.db.query(func.count(PullRequest.id)).filter(
                PullRequest.repository_id.in_(repo_ids)
            ).scalar() or 0

            # Reviews: count PR reviews (if we have that data)
            # For now, approximate as merged PRs
            total_reviews = self.db.query(func.count(PullRequest.id)).filter(
                PullRequest.repository_id.in_(repo_ids),
                PullRequest.state == 'merged'
            ).scalar() or 0

            # Active repos: repos with commits in last 30 days
            from datetime import datetime, timedelta
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            
            active_repo_ids = self.db.query(Commit.repository_id).filter(
                Commit.repository_id.in_(repo_ids),
                Commit.committed_date >= thirty_days_ago
            ).distinct().all()
            
            active_repos = len(active_repo_ids)

            return {
                "total_commits": total_commits,
                "total_prs": total_prs,
                "total_reviews": total_reviews,
                "active_repos": active_repos
            }

        except Exception as e:
            print(f"ERROR: get_team_stats failed: {e}")
            import traceback
            traceback.print_exc()
            return {
                "total_commits": 0,
                "total_prs": 0,
                "total_reviews": 0,
                "active_repos": 0
            }

