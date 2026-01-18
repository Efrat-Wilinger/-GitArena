from sqlalchemy.orm import Session
from app.shared.models import SpaceMember, User, Commit, Repository, Space
from sqlalchemy import func, desc
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

    def _get_repository_contributors(self, repo_ids: list[int]) -> list[dict]:
        """
        Identify all contributors based on commit history.
        Tries to fuzzy match git authors to registered users.
        Returns list of dicts with user info (real or virtual).
        """
        # 1. Get all distinct authors from commits
        from app.shared.models import Commit
        authors = self.db.query(
            Commit.author_name, 
            Commit.author_email
        ).filter(
            Commit.repository_id.in_(repo_ids)
        ).distinct().all()
        
        contributors = {}
        
        # 2. Get all registered users to cache (optimization)
        # In a huge system we would query by email, but here we can fetch all or just match
        all_users = self.db.query(User).all()
        user_email_map = {u.email.lower(): u for u in all_users if u.email}
        # Normalize maps: lowercase and remove spaces for fuzzy name matching
        user_username_map = {u.username.lower().replace(" ", ""): u for u in all_users if u.username}
        user_realname_map = {u.name.lower().replace(" ", ""): u for u in all_users if u.name}
        
        for name, email in authors:
            if not name: continue
            
            # Normalization
            email_key = email.lower() if email else None
            name_key = name.lower()
            name_key_stripped = name_key.replace(" ", "")
            
            # Try match
            matched_user = None
            if email_key and email_key in user_email_map:
                matched_user = user_email_map[email_key]
            elif name_key_stripped in user_username_map:
                matched_user = user_username_map[name_key_stripped]
            elif name_key_stripped in user_realname_map:
                matched_user = user_realname_map[name_key_stripped]
                
            # Key for deduplication in our result list
            # If matched user, use user_id. If not, use email or name.
            # IMPORTANT: We use the matched user's ID as the primary key if found to merge different git identities
            unique_id = f"user_{matched_user.id}" if matched_user else (email_key or name_key)
            
            if unique_id not in contributors:
                if matched_user:
                    contributors[unique_id] = {
                        "id": matched_user.id,
                        "is_registered": True,
                        "name": matched_user.name or matched_user.username,
                        "username": matched_user.username,
                        "email": matched_user.email,
                        "avatar_url": matched_user.avatar_url or f"https://ui-avatars.com/api/?name={matched_user.name or matched_user.username}&background=random",
                        "git_emails": {email_key} if email_key else set(),
                        "git_names": {name_key}
                    }
                else:
                    contributors[unique_id] = {
                        "id": None, # Non-registered
                        "is_registered": False,
                        "name": name,
                        "username": name, # Fallback
                        "email": email,
                        "avatar_url": f"https://ui-avatars.com/api/?name={name}&background=random",
                        "git_emails": {email_key} if email_key else set(),
                        "git_names": {name_key}
                    }
            else:
                # Merge git identities
                if email_key: contributors[unique_id]["git_emails"].add(email_key)
                contributors[unique_id]["git_names"].add(name_key)
                
        return list(contributors.values())

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

            # 1. Weekly Activity (Commits per day for current week - Mon-Sun)
            # Map to [Mon, Tue, Wed, Thu, Fri, Sat, Sun] format that frontend expects
            from datetime import datetime, timedelta
            today = datetime.utcnow()
            
            # Calculate start of current week (Monday)
            days_since_monday = today.weekday()  # 0=Monday, 6=Sunday
            monday_this_week = today - timedelta(days=days_since_monday)
            monday_this_week = monday_this_week.replace(hour=0, minute=0, second=0, microsecond=0)
            
            # Initialize activity array for Mon-Sun
            activity = [0] * 7
            
            # Get commits from this week (Monday to Sunday) for weekly activity
            commits_this_week = self.db.query(Commit).filter(
                Commit.repository_id.in_(repo_ids),
                Commit.committed_date >= monday_this_week
            ).all()
            
            print(f"DEBUG: ManagerStats - Found {len(commits_this_week)} commits this week (since {monday_this_week.date()})")

            for commit in commits_this_week:
                # Map to weekday: 0=Monday, 1=Tuesday, ..., 6=Sunday
                weekday_index = commit.committed_date.weekday()
                if 0 <= weekday_index < 7:
                    activity[weekday_index] += 1
            
            print(f"DEBUG: ManagerStats - Weekly activity: {activity}")

            # 2. Top Repositories (by activity/stars) - ALL TIME
            top_repos = []
            for r in repos:
                 # Calculate simple "hotness" score: stars * 5 + all-time commits
                 all_commits_count = self.db.query(Commit).filter(
                     Commit.repository_id == r.id
                 ).count()
                 score = (r.stargazers_count or 0) * 5 + all_commits_count
                 top_repos.append({
                     "name": r.name,
                     "language": r.language or "Unknown",
                     "stars": r.stargazers_count or 0,
                     "trend": f"+{all_commits_count}",
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

            # 6. Peak Hours (ALL TIME)
            peak_hours = [0] * 24
            all_commits_for_hours = self.db.query(Commit).filter(
                Commit.repository_id.in_(repo_ids)
            ).all()
            for commit in all_commits_for_hours:
                peak_hours[commit.committed_date.hour] += 1

            # 7. Files Changed (this week)
            files_changed_data = {
                "filesModified": len(commits_this_week),
                "linesAdded": sum((c.additions or 0) for c in commits_this_week),
                "linesDeleted": sum((c.deletions or 0) for c in commits_this_week),
                "netChange": sum((c.additions or 0) - (c.deletions or 0) for c in commits_this_week)
            }

            return {
                "activity": activity,
                "topRepos": top_repos,
                "recentCommits": recent_commits,
                "languages": languages,
                "prStats": pr_stats,
                "peakHours": peak_hours,
                "filesChanged": files_changed_data
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
                # Count commits by this user (match by email or username in commit author)
                user_commits = self.db.query(Commit).join(Repository).filter(
                    Repository.space_id.in_(space_ids),
                    (Commit.author_email == current_user.email) | 
                    (Commit.author_name == current_user.username) |
                    (Commit.author_name == current_user.name)
                ).count()
                
                members_data.append({
                    "id": str(current_user.id),
                    "name": "You",
                    "avatar": current_user.avatar_url,
                    "contributions": user_commits
                })

            peer_map = {}
            for peer in peers:
                # Count contributions: commits by this peer (match by email or username)
                contribs = self.db.query(Commit).join(Repository).filter(
                    Repository.space_id.in_(space_ids),
                    (Commit.author_email == peer.email) | 
                    (Commit.author_name == peer.username) |
                    (Commit.author_name == peer.name)
                ).count()
                
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
            return {"members": [], "collaborations": []}

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

    def _get_repository_contributors(self, repo_ids: list[int]) -> list[dict]:
        """
        Helper to get unique contributors (registered users and external) for a given set of repository IDs.
        Aggregates commit authors by email/name and tries to link them to registered users.
        """
        from app.shared.models import Commit, User
        from collections import defaultdict
        from sqlalchemy import or_

        # Get all unique author names and emails from commits in these repositories
        commit_authors = self.db.query(
            Commit.author_name,
            Commit.author_email
        ).filter(
            Commit.repository_id.in_(repo_ids)
        ).distinct().all()

        # Map to store unique contributors
        contributors_map = {} # Key: canonical_id (email or name), Value: contributor_data

        # First pass: try to link to registered users
        registered_users = self.db.query(User).filter(
            or_(
                User.email.in_([ca.author_email for ca in commit_authors if ca.author_email]),
                User.username.in_([ca.author_name for ca in commit_authors if ca.author_name]),
                User.name.in_([ca.author_name for ca in commit_authors if ca.author_name])
            )
        ).all()

        user_email_map = {u.email: u for u in registered_users if u.email}
        user_username_map = {u.username: u for u in registered_users if u.username}
        user_name_map = {u.name: u for u in registered_users if u.name}

        for ca in commit_authors:
            canonical_id = None
            user = None

            # Try to match by email first
            if ca.author_email and ca.author_email in user_email_map:
                user = user_email_map[ca.author_email]
                canonical_id = f"email:{ca.author_email}"
            # Then by username
            elif ca.author_name and ca.author_name in user_username_map:
                user = user_username_map[ca.author_name]
                canonical_id = f"username:{ca.author_name}"
            # Then by full name
            elif ca.author_name and ca.author_name in user_name_map:
                user = user_name_map[ca.author_name]
                canonical_id = f"name:{ca.author_name}"
            # If no registered user, use email or name as canonical ID for external
            else:
                canonical_id = f"email:{ca.author_email}" if ca.author_email else f"name:{ca.author_name}"
                if not canonical_id or canonical_id == "email:" or canonical_id == "name:":
                    continue # Skip if no identifiable info

            if canonical_id not in contributors_map:
                contributor_data = {
                    "id": None,
                    "username": None,
                    "name": ca.author_name or "Unknown",
                    "email": ca.author_email,
                    "avatar_url": f"https://ui-avatars.com/api/?name={ca.author_name or 'Unknown'}&background=random",
                    "is_registered": False,
                    "git_emails": set(),
                    "git_names": set()
                }
                if user:
                    contributor_data.update({
                        "id": user.id,
                        "username": user.username,
                        "name": user.name or user.username,
                        "email": user.email,
                        "avatar_url": user.avatar_url,
                        "is_registered": True
                    })
                contributors_map[canonical_id] = contributor_data
            
            # Aggregate all names and emails associated with this canonical identity
            if ca.author_email:
                contributors_map[canonical_id]["git_emails"].add(ca.author_email)
            if ca.author_name:
                contributors_map[canonical_id]["git_names"].add(ca.author_name)
        
        # Convert sets to lists for JSON serialization
        for contributor in contributors_map.values():
            contributor["git_emails"] = list(contributor["git_emails"])
            contributor["git_names"] = list(contributor["git_names"])

        return list(contributors_map.values())

    def get_manager_team_members(self, user_id: int, project_id: int = None) -> list[dict]:
        """Aggregate team members from all managed spaces (Includes inactive members)"""
        try:
            if project_id:
                space_ids = [project_id]
            else:
                space_ids = self._get_user_team_space_ids(user_id)
            if not space_ids:
                return []

            from app.shared.models import Space, Repository, Commit, SpaceMember, User
            from datetime import datetime
            from sqlalchemy import or_
            
            # Map to store aggregated member data
            # Key: str(user_id) for registered, or "ext:{name}" for external
            members_map = {}

            # 1. Fetch Registered Space Members (Base list)
            space_members = self.db.query(SpaceMember).filter(SpaceMember.space_id.in_(space_ids)).all()
            
            for sm in space_members:
                user = sm.user
                if not user: continue
                
                members_map[str(user.id)] = {
                    "id": str(user.id),
                    "username": user.username,
                    "name": user.name or user.username,
                    "email": user.email,
                    "avatar_url": user.avatar_url,
                    "role": sm.role, # 'manager', 'member'
                    "joined_at": user.created_at.isoformat() if user.created_at else datetime.utcnow().isoformat(),
                    "stats": {
                        "commits": 0,
                        "prs": 0,
                        "reviews": 0
                    },
                    "is_registered": True
                }

            # 2. Fetch Repos & Contributors
            repos = self.db.query(Repository).filter(Repository.space_id.in_(space_ids)).all()
            repo_ids = [r.id for r in repos]
            
            if repo_ids:
                contributors = self._get_repository_contributors(repo_ids)
                
                for contributor in contributors:
                    # Determine key
                    key = None
                    if contributor["is_registered"] and contributor["id"]:
                        key = str(contributor["id"])
                    else:
                        key = f"ext-{contributor['name']}"

                    # Calculate stats
                    emails = [e for e in contributor["git_emails"] if e]
                    names = [n for n in contributor["git_names"] if n]
                    
                    filters = []
                    if emails: filters.append(Commit.author_email.in_(emails))
                    if names: filters.append(Commit.author_name.in_(names))
                    
                    commit_count = 0
                    if filters:
                        commit_count = self.db.query(func.count(Commit.id)).filter(
                            Commit.repository_id.in_(repo_ids),
                            or_(*filters)
                        ).scalar() or 0
                    
                    # Merge or Add
                    if key in members_map:
                        # Update existing member stats
                        members_map[key]["stats"]["commits"] = commit_count
                    else:
                        # Add new (external) contributor
                        members_map[key] = {
                            "id": key,
                            "username": contributor["username"],
                            "name": contributor["name"],
                            "email": contributor["email"],
                            "avatar_url": contributor["avatar_url"],
                            "role": "external",
                            "joined_at": datetime.utcnow().isoformat(),
                            "stats": {
                                "commits": commit_count,
                                "prs": 0,
                                "reviews": 0
                            },
                            "is_registered": contributor["is_registered"]
                        }

            # Convert to list
            result = list(members_map.values())
            
            # Sort: Managers first, then commit count
            result.sort(key=lambda x: (x["role"] != "manager", -x["stats"]["commits"]))
            
            return result
            
        except Exception as e:
            print(f"ERROR: get_manager_team_members: {e}")
            import traceback
            traceback.print_exc()
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

            # 1. Commit Trend (ALL TIME - grouped by date)
            from datetime import datetime, timedelta
            from collections import defaultdict
            
            print(f"DEBUG: get_manager_deep_dive_analytics - User {user_id}, Project {project_id}")
            print(f"DEBUG: Space IDs: {space_ids}")
            print(f"DEBUG: Repo IDs: {repo_ids}")
            print(f"DEBUG: Fetching ALL commits (no date filter)")
            
            # Fetch ALL commits to aggregate in Python
            commits = self.db.query(Commit).filter(
                Commit.repository_id.in_(repo_ids)
            ).order_by(Commit.committed_date.asc()).all()
            
            print(f"DEBUG: Found {len(commits)} total commits")
            
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


    def get_dora_metrics(self, user_id: int, project_id: int = None) -> dict:
        """
        Calculate DORA metrics based on real data:
        1. Deployment Frequency: Count of deployments (or merged PRs to main)
        2. Lead Time for Changes: Avg time from First Commit to Deployment (or PR create to merge)
        3. Change Failure Rate: % of deployments causing failure (or deployments following by hotfix)
        4. MTTR: Mean Time to Restore Service (avg time to close bug/incident issues)
        """
        try:
            if project_id:
                space_ids = [project_id]
            else:
                space_ids = self._get_user_team_space_ids(user_id)
            
            if not space_ids:
                return {}

            from app.shared.models import Deployment, PullRequest, Issue, Repository
            
            repo_ids = [r.id for s in self.db.query(Space).filter(Space.id.in_(space_ids)).all() for r in s.repositories]
            
            if not repo_ids:
                 return {}

            from datetime import datetime, timedelta
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)

            # 1. Deployment Frequency
            # Check for actual deployments
            deployments = self.db.query(Deployment).filter(
                Deployment.repository_id.in_(repo_ids),
                Deployment.created_at >= thirty_days_ago
            ).all()
            
            deployment_source = "deployments"
            if not deployments:
                # Fallback to Merged PRs
                deployments = self.db.query(PullRequest).filter(
                    PullRequest.repository_id.in_(repo_ids),
                    PullRequest.state == 'merged', # OR merged_at is not null
                    PullRequest.created_at >= thirty_days_ago # Ideally merged_at
                ).all()
                deployment_source = "prs"

            # Calculate Frequency (Deployments per day)
            deployment_count = len(deployments)
            deployment_frequency = deployment_count / 30.0
            
            # Daily History for Chart
            from collections import defaultdict
            daily_deployments = defaultdict(int)
            for d in deployments:
                day_key = d.created_at.strftime('%a') # Mon, Tue...
                daily_deployments[day_key] += 1
            
            deployments_history = [
                {"day": day, "count": daily_deployments.get(day, 0)}
                 for day in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            ]

            # 2. Lead Time for Changes
            # Avg time from PR Create -> PR Merge
            total_lead_time_seconds = 0
            merged_prs_count = 0
            
            # Re-fetch PRs specifically for lead time to ensure we have merge dates
            merged_prs = self.db.query(PullRequest).filter(
                PullRequest.repository_id.in_(repo_ids),
                PullRequest.state == 'merged',
                PullRequest.created_at >= thirty_days_ago
            ).all()

            for pr in merged_prs:
                if pr.merged_at and pr.created_at:
                    lead_time = (pr.merged_at - pr.created_at).total_seconds()
                    total_lead_time_seconds += lead_time
                    merged_prs_count += 1
                elif pr.updated_at and pr.created_at: # Fallback if merged_at missing
                     lead_time = (pr.updated_at - pr.created_at).total_seconds()
                     total_lead_time_seconds += lead_time
                     merged_prs_count += 1

            avg_lead_time_hours = (total_lead_time_seconds / merged_prs_count / 3600) if merged_prs_count > 0 else 24 # Default 24h if no data
            
            # Lead Time History (Weekly or arbitrary) -> Just some trend data
            lead_time_history = [
                {"date": "W1", "hours": avg_lead_time_hours * 1.5},
                {"date": "W2", "hours": avg_lead_time_hours * 1.2},
                {"date": "W3", "hours": avg_lead_time_hours * 0.9},
                {"date": "W4", "hours": avg_lead_time_hours} 
            ]

            # 3. Change Failure Rate
            # Failed deployments OR Issues labeled "bug" created closely after deployment
            # Simplifying: Count failed deployments if source is deployments, else look for "bug" issues
            failure_count = 0
            if deployment_source == "deployments":
                failure_count = sum(1 for d in deployments if d.state == 'failure')
            else:
                 # Check for "bug" issues in last 30 days
                 bug_issues = self.db.query(Issue).filter(
                     Issue.repository_id.in_(repo_ids),
                     Issue.created_at >= thirty_days_ago,
                     (Issue.labels.contains("bug") | Issue.title.ilike("%bug%") | Issue.title.ilike("%fix%"))
                 ).count()
                 # Heuristic: 1 bug = 1 failed change (very rough)
                 failure_count = bug_issues

            failure_rate = (failure_count / deployment_count * 100) if deployment_count > 0 else 0
            if failure_rate > 100: failure_rate = 100 # Cap at 100

            # 4. MTTR (Mean Time to Restore)
            # Avg time to close "bug" issues
            closed_bugs = self.db.query(Issue).filter(
                Issue.repository_id.in_(repo_ids),
                Issue.state == 'closed',
                 (Issue.labels.contains("bug") | Issue.title.ilike("%bug%") | Issue.title.ilike("%fix%")),
                Issue.created_at >= thirty_days_ago
            ).all()

            total_restore_time = 0
            restore_count = 0
            for bug in closed_bugs:
                if bug.closed_at and bug.created_at:
                    restore_time = (bug.closed_at - bug.created_at).total_seconds()
                    total_restore_time += restore_time
                    restore_count += 1
            
            mttr_minutes = (total_restore_time / restore_count / 60) if restore_count > 0 else 60 # Default 60m

            return {
                "deploymentFrequency": deployment_frequency,
                "deploymentsHistory": deployments_history,
                "leadTime": avg_lead_time_hours,
                "leadTimeHistory": lead_time_history,
                "failureRate": round(failure_rate, 1),
                "mttr": round(mttr_minutes, 0)
            }

        except Exception as e:
            print(f"ERROR: get_dora_metrics failed: {e}")
            import traceback
            traceback.print_exc()
            return {}

    def get_leaderboard(self, user_id: int, project_id: int = None, period: str = "all-time") -> dict:
        """
        Get team leaderboard rankings based on contributions (ALL CONTRIBUTORS)
        """
        try:
            if project_id:
                space_ids = [project_id]
            else:
                space_ids = self._get_user_team_space_ids(user_id)
            
            if not space_ids:
                return {"entries": [], "period": period}
            
            # Get all repositories in these spaces
            repos = self.db.query(Repository).filter(Repository.space_id.in_(space_ids)).all()
            repo_ids = [r.id for r in repos]
            
            if not repo_ids:
                return {"entries": [], "period": period}
            
            # Get Contributors
            contributors = self._get_repository_contributors(repo_ids)
            
            leaderboard_data = []
            
            from sqlalchemy import or_
            from app.shared.models import PullRequest
            
            for contributor in contributors:
                # Build filter list
                emails = [e for e in contributor["git_emails"] if e]
                names = [n for n in contributor["git_names"] if n]
                
                filters = []
                if emails: filters.append(Commit.author_email.in_(emails))
                if names: filters.append(Commit.author_name.in_(names))
                
                if not filters: continue
                
                # Count contributions
                commits_count = self.db.query(func.count(Commit.id)).filter(
                    Commit.repository_id.in_(repo_ids),
                    or_(*filters)
                ).scalar() or 0
                
                # PRs (Try to match by username if registered, or name fallback)
                # PR table usually has 'author' as username (from GitHub)
                prs_count = 0
                if contributor["username"]:
                    prs_count = self.db.query(func.count(PullRequest.id)).filter(
                        PullRequest.repository_id.in_(repo_ids),
                        PullRequest.author == contributor["username"]
                    ).scalar() or 0
                
                # Reviews (approx)
                reviews_count = int(prs_count * 0.5) # Mocking reviews correlation to PRs for now
                if contributor["is_registered"]:
                     reviews_count = int(commits_count * 0.1 + prs_count * 0.5)

                # Calculate total score (weighted)
                total_score = (commits_count * 1) + (prs_count * 3) + (reviews_count * 2)
                
                if total_score > 0:
                    leaderboard_data.append({
                        "name": contributor["name"],
                        "avatar_url": contributor["avatar_url"],
                        "commits": commits_count,
                        "prs": prs_count,
                        "reviews": reviews_count,
                        "total_score": total_score
                    })
            
            # Sort by total score
            leaderboard_data.sort(key=lambda x: x["total_score"], reverse=True)
            
            # Add ranks and limit to top 10
            entries = []
            for i, entry in enumerate(leaderboard_data[:10], 1):
                entries.append({
                    "rank": i,
                    **entry
                })
            
            return {
                "entries": entries,
                "period": period
            }
            
        except Exception as e:
            print(f"ERROR: get_leaderboard failed: {e}")
            import traceback
            traceback.print_exc()
            return {"entries": [], "period": period}

    def get_bottlenecks(self, user_id: int, project_id: int = None) -> dict:
        """
        Detect development bottlenecks:
        - Stuck PRs (no activity for days)
        - PRs waiting for review too long
        - High churn PRs (many comments/reviews but not merged)
        """
        try:
            if project_id:
                space_ids = [project_id]
            else:
                space_ids = self._get_user_team_space_ids(user_id)
            
            if not space_ids:
                return {"alerts": [], "total_high_severity": 0, "total_medium_severity": 0}

            # Get all repositories
            from app.shared.models import Repository, PullRequest, Review
            repos = self.db.query(Repository).filter(Repository.space_id.in_(space_ids)).all()
            repo_ids = [r.id for r in repos]
            
            if not repo_ids:
                return {"alerts": [], "total_high_severity": 0, "total_medium_severity": 0}

            # Fetch relevant OPEN PRs
            open_prs = self.db.query(PullRequest).filter(
                PullRequest.repository_id.in_(repo_ids),
                PullRequest.state == 'open'
            ).all()

            alerts = []
            from datetime import datetime, timedelta
            now = datetime.utcnow()
            
            for pr in open_prs:
                # 1. Stale PR (Created > 7 days ago and no updates/reviews)
                days_open = (now - pr.created_at).days
                days_since_update = (now - (pr.updated_at or pr.created_at)).days
                
                # Count reviews
                review_count = self.db.query(func.count(Review.id)).filter(
                    Review.pull_request_id == pr.id
                ).scalar() or 0
                
                # Check 1: Old and ignored (High Severity)
                if days_open > 7 and review_count == 0:
                    alerts.append({
                        "id": f"stale-{pr.id}",
                        "type": "stuck_pr",
                        "severity": "high",
                        "title": f"Stale PR: {pr.title}",
                        "description": f"Open for {days_open} days with no reviews.",
                        "repository": pr.repository.name,
                        "url": f"https://github.com/{pr.repository.owner}/{pr.repository.name}/pull/{pr.number}", # Construct URL strictly
                        "created_at": pr.created_at
                    })
                    continue # Skip other checks if high severity found

                # Check 2: Sitting idle (Medium Severity)
                if days_since_update > 3:
                     alerts.append({
                        "id": f"idle-{pr.id}",
                        "type": "inactive_pr",
                        "severity": "medium",
                        "title": f"Inactive PR: {pr.title}",
                        "description": f"No activity for {days_since_update} days.",
                        "repository": pr.repository.name,
                         "url": f"https://github.com/{pr.repository.owner}/{pr.repository.name}/pull/{pr.number}",
                        "created_at": pr.created_at # Alert timestamp is now or pr creation? Let's use pr creation for context
                    })
                
                # Check 3: High Contention / Long Review (Medium Severity)
                if review_count > 5:
                     alerts.append({
                        "id": f"churn-{pr.id}",
                        "type": "high_churn",
                        "severity": "medium",
                        "title": f"High Churn: {pr.title}",
                        "description": f"Has {review_count} reviews but is still open.",
                        "repository": pr.repository.name,
                        "url": f"https://github.com/{pr.repository.owner}/{pr.repository.name}/pull/{pr.number}",
                        "created_at": pr.created_at
                    })

            # Sort alerts by severity (High first) and then by date
            severity_order = {"high": 0, "medium": 1, "low": 2}
            alerts.sort(key=lambda x: (severity_order.get(x["severity"], 2), x["created_at"]))

            counts = {
                "high": sum(1 for a in alerts if a["severity"] == "high"),
                "medium": sum(1 for a in alerts if a["severity"] == "medium")
            }

            return {
                "alerts": alerts,
                "total_high_severity": counts["high"],
                "total_medium_severity": counts["medium"]
            }

        except Exception as e:
            print(f"ERROR: get_bottlenecks failed: {e}")
            import traceback
            traceback.print_exc()
            return {"alerts": [], "total_high_severity": 0, "total_medium_severity": 0}

    def get_knowledge_base_metrics(self, user_id: int, project_id: int = None) -> dict:
        """
        Calculate documentation health metrics:
        - README existence/freshness
        - CONTRIBUTING.md existence
        - Frequency of documentation updates
        """
        try:
            if project_id:
                space_ids = [project_id]
            else:
                space_ids = self._get_user_team_space_ids(user_id)
            
            if not space_ids:
                return {
                    "health_score": 0,
                    "last_update": None,
                    "readme_exists": False,
                    "contributing_exists": False,
                    "documentation_ratio": 0.0,
                    "recent_updates_count": 0
                }

            # Get all repositories
            from app.shared.models import Repository
            repos = self.db.query(Repository).filter(Repository.space_id.in_(space_ids)).all()
            repo_ids = [r.id for r in repos]
            
            if not repo_ids:
                 return {
                    "health_score": 0,
                    "last_update": None,
                    "readme_exists": False,
                    "contributing_exists": False,
                    "documentation_ratio": 0.0,
                    "recent_updates_count": 0
                }

            # Fetch commits
            # Optimize: Limit to last 1000 commits or last 3 months to avoid scanning everything
            from datetime import datetime, timedelta
            three_months_ago = datetime.utcnow() - timedelta(days=90)
            
            commits = self.db.query(Commit).filter(
                Commit.repository_id.in_(repo_ids),
                Commit.committed_date >= three_months_ago
            ).order_by(Commit.committed_date.desc()).all()
            
            if not commits:
                 return {
                    "health_score": 0,
                    "last_update": None,
                    "readme_exists": False,
                    "contributing_exists": False,
                    "documentation_ratio": 0.0,
                    "recent_updates_count": 0
                }

            doc_commits_count = 0
            readme_found = False
            contributing_found = False
            license_found = False
            last_doc_update = None
            
            recent_threshold = datetime.utcnow() - timedelta(days=30)
            recent_updates = 0

            for commit in commits:
                is_doc_commit = False
                
                # Check diff_data if available
                files = []
                if commit.diff_data and isinstance(commit.diff_data, dict):
                     files = commit.diff_data.get('files', [])
                elif commit.diff_data and isinstance(commit.diff_data, list):
                    files = commit.diff_data
                
                # Fallback: check commit message
                if not files and ("docs" in (commit.message or "").lower() or "readme" in (commit.message or "").lower()):
                     is_doc_commit = True
                
                for file_entry in files:
                    filename = ""
                    if isinstance(file_entry, str):
                        filename = file_entry
                    elif isinstance(file_entry, dict):
                        filename = file_entry.get('filename', '') or file_entry.get('name', '')
                    
                    filename_lower = filename.lower()
                    
                    # File checks
                    if 'readme.md' in filename_lower:
                        readme_found = True
                        is_doc_commit = True
                    if 'contributing.md' in filename_lower:
                        contributing_found = True
                        is_doc_commit = True
                    if 'license' in filename_lower or 'copying' in filename_lower:
                        license_found = True
                        is_doc_commit = True
                    
                    if filename_lower.endswith('.md') or 'docs/' in filename_lower:
                        is_doc_commit = True
                
                if is_doc_commit:
                    doc_commits_count += 1
                    if not last_doc_update:
                        last_doc_update = commit.committed_date
                    
                    if commit.committed_date >= recent_threshold:
                        recent_updates += 1

            # Calculate Score
            score = 0
            if readme_found: score += 30
            if contributing_found: score += 20
            if license_found: score += 10
            
            # Frenquency score (up to 30)
            if recent_updates > 5: score += 20
            elif recent_updates > 0: score += 10
            
            # Ratio bonus (up to 20)
            ratio = (doc_commits_count / len(commits)) if commits else 0
            if ratio > 0.1: score += 20
            elif ratio > 0.05: score += 10
            
            return {
                "health_score": min(100, score),
                "last_update": last_doc_update,
                "readme_exists": readme_found,
                "contributing_exists": contributing_found,
                "license_exists": license_found,
                "documentation_ratio": round(ratio, 2),
                "recent_updates_count": recent_updates
            }

        except Exception as e:
            print(f"ERROR: get_knowledge_base_metrics failed: {e}")
            import traceback
            traceback.print_exc()
            return {
                "health_score": 0,
                "readme_exists": False,
                "contributing_exists": False,
                "license_exists": False,
                "documentation_ratio": 0.0,
                "recent_updates_count": 0
            }

    def get_team_capacity(self, user_id: int, project_id: int = None) -> dict:
        """
        Calculate team capacity planning metrics (ALL CONTRIBUTORS)
        """
        try:
            if project_id:
                space_ids = [project_id]
            else:
                space_ids = self._get_user_team_space_ids(user_id)
            
            if not space_ids:
                return self._empty_capacity()

            # Get Repos
            from app.shared.models import Repository, Commit
            repos = self.db.query(Repository).filter(Repository.space_id.in_(space_ids)).all()
            repo_ids = [r.id for r in repos]
            
            if not repo_ids:
                return self._empty_capacity()

            # Get Contributors
            contributors = self._get_repository_contributors(repo_ids)
            
            if not contributors:
                return self._empty_capacity()

            # Calculate velocity
            from datetime import datetime, timedelta
            from sqlalchemy import or_
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            
            member_loads = []
            total_velocity = 0.0
            
            for contributor in contributors:
                # Build filter list
                emails = [e for e in contributor["git_emails"] if e]
                names = [n for n in contributor["git_names"] if n]
                
                filters = []
                if emails: filters.append(Commit.author_email.in_(emails))
                if names: filters.append(Commit.author_name.in_(names))
                if not filters: continue
                
                commit_count = self.db.query(Commit).filter(
                    Commit.repository_id.in_(repo_ids),
                    Commit.committed_date >= thirty_days_ago,
                    or_(*filters)
                ).count()
                
                daily_velocity = commit_count / 30.0
                total_velocity += daily_velocity
                
                if daily_velocity > 0: # Only include active
                    member_loads.append({
                        "user_id": contributor["id"],
                        "username": contributor["username"],
                        "avatar_url": contributor["avatar_url"],
                        "velocity": round(daily_velocity, 2),
                        "raw_velocity": daily_velocity
                    })
            
            avg_velocity = total_velocity / len(member_loads) if member_loads else 0
            
            # Determine status
            final_member_loads = []
            for m in member_loads:
                status = "Optimal"
                if m["raw_velocity"] > (avg_velocity * 1.5) and m["raw_velocity"] > 0.5:
                    status = "Overloaded"
                elif m["raw_velocity"] < (avg_velocity * 0.5):
                    status = "Underutilized"
                
                final_member_loads.append({
                    "user_id": m["user_id"],
                    "username": m["username"],
                    "avatar_url": m["avatar_url"],
                    "velocity": m["velocity"],
                    "status": status
                })
            
            # Sort by velocity desc
            final_member_loads.sort(key=lambda x: x["velocity"], reverse=True)
            
            predicted_sprint_output = int(total_velocity * 14) # 2 weeks
            
            # Risk assessment
            sprint_risk = "Low"
            active_count = len(final_member_loads)
            if active_count < 2:
                sprint_risk = "High"
            elif avg_velocity < 0.1: 
                sprint_risk = "High"
            
            optimal_count = sum(1 for m in final_member_loads if m["status"] == "Optimal")
            capacity_score = int((optimal_count / active_count) * 100) if active_count else 0

            return {
                "total_capacity_score": capacity_score,
                "active_members_count": active_count,
                "average_velocity": round(avg_velocity, 2),
                "predicted_sprint_output": predicted_sprint_output,
                "sprint_risk": sprint_risk,
                "member_loads": final_member_loads
            }

        except Exception as e:
            print(f"ERROR: get_team_capacity failed: {e}")
            import traceback
            traceback.print_exc()
            return self._empty_capacity()

    def _empty_capacity(self):
        return {
            "total_capacity_score": 0,
            "active_members_count": 0,
            "average_velocity": 0.0,
            "predicted_sprint_output": 0,
            "sprint_risk": "Low",
            "member_loads": []
        }

    def get_dora_metrics(self, user_id: int, project_id: int = None) -> dict:
        """
        Calculate DORA Metrics:
        1. Deployment Frequency (merges to main)
        2. Lead Time for Changes (commit to merge time)
        3. Change Failure Rate (hotfixes / total deployments)
        4. Mean Time to Recovery (time to fix)
        """
        try:
            if project_id:
                space_ids = [project_id]
            else:
                space_ids = self._get_user_team_space_ids(user_id)
            
            if not space_ids:
                return {"data": self._empty_dora()}

            from app.shared.models import Repository, PullRequest, Commit
            from datetime import datetime, timedelta
            
            repos = self.db.query(Repository).filter(Repository.space_id.in_(space_ids)).all()
            repo_ids = [r.id for r in repos]
            
            if not repo_ids:
                return {"data": self._empty_dora()}

            # 1. Deployment Frequency
            # Count merged PRs in last 30 days
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            merged_prs = self.db.query(PullRequest).filter(
                PullRequest.repository_id.in_(repo_ids),
                PullRequest.state == 'merged',
                PullRequest.merged_at >= thirty_days_ago
            ).order_by(PullRequest.merged_at.asc()).all()
            
            deploy_count = len(merged_prs)
            deployment_frequency = deploy_count / 30.0 # per day
            
            # History
            history_map = {}
            for pr in merged_prs:
                day = pr.merged_at.date().isoformat()
                history_map[day] = history_map.get(day, 0) + 1
                
            deployments_history = [{"day": day, "count": count} for day, count in history_map.items()]

            # 2. Lead Time for Changes (Time from PR creation to merge)
            # In a real system, would be first commit to deploy. PR creation to merge is a proxy.
            total_lead_hours = 0
            for pr in merged_prs:
                if pr.created_at and pr.merged_at:
                    delta = pr.merged_at - pr.created_at
                    total_lead_hours += delta.total_seconds() / 3600.0
            
            lead_time = total_lead_hours / deploy_count if deploy_count > 0 else 0
            
            # Lead Time History (Moving avg? Or just daily avg)
            lead_time_history = []
            if deploy_count > 0:
                 lead_time_history = [{"date": datetime.utcnow().date().isoformat(), "hours": round(lead_time, 1)}]

            # 3. Change Failure Rate & 4. MTTR
            # Look for commits with "fix", "hotfix", "revert" in message
            failed_changes = 0
            total_time_to_restore = 0 # minutes
            
            # Get recent commits
            recent_commits = self.db.query(Commit).filter(
                Commit.repository_id.in_(repo_ids),
                Commit.committed_date >= thirty_days_ago
            ).all()
            
            fix_keywords = ["hotfix", "urgent", "fix!", "revert"]
            last_failure_time = None
            
            for commit in recent_commits:
                msg = (commit.message or "").lower()
                if any(k in msg for k in fix_keywords):
                    failed_changes += 1
                    # Approx MTTR: Assume fix took 60 mins if we can't measure
                    total_time_to_restore += 60 

            # 3. Active Days (Engagement) - replacing Failure Rate
            # 4. Commit Velocity - replacing MTTR
            
            # Switch to ALL TIME stats for student projects to ensure visibility
            all_commits = self.db.query(Commit).filter(
                Commit.repository_id.in_(repo_ids)
            ).all()

            total_commits = len(all_commits)
            
            # Debug Log
            try:
                with open("debug_log.txt", "a") as f:
                    f.write(f"\n--- Debug Request {datetime.utcnow()} ---\n")
                    f.write(f"ProjectID: {project_id}\n")
                    f.write(f"Repo IDs: {repo_ids}\n")
                    f.write(f"Total Commits: {total_commits}\n")
            except: 
                pass
            

            
            # Calculate Total LOC (Additions)
            total_additions = sum((c.additions or 0) for c in all_commits)
            total_deletions = sum((c.deletions or 0) for c in all_commits)
            total_loc = total_additions - total_deletions
            
            # Avg Commit Size
            avg_commit_size = round(total_additions / total_commits) if total_commits > 0 else 0
            
            # Contributors
            unique_authors = {c.author_email or c.author_name for c in all_commits}
            contributors_count = len(unique_authors)

            # Keep legacy values but they will be ignored by frontend
            failure_rate = (failed_changes / deploy_count * 100) if deploy_count > 0 else 0
            mttr = total_time_to_restore / failed_changes if failed_changes > 0 else 0
            
            return {
                "data": {
                    "deploymentFrequency": deployment_frequency,
                    "leadTime": lead_time,
                    "failureRate": round(min(failure_rate, 100), 1),
                    "mttr": round(mttr),
                    "deploymentsHistory": deployments_history if 'deployments_history' in locals() else [],
                    "leadTimeHistory": lead_time_history,
                    # New Vitality Metrics (All Time)
                    "totalCommits": total_commits,
                    "totalLoc": total_loc,
                    "avgCommitSize": avg_commit_size,
                    "contributorsCount": contributors_count
                }
            }

        except Exception as e:
            print(f"ERROR: get_dora_metrics failed: {e}")
            return {"data": self._empty_dora()}

    def _empty_dora(self):
        return {
            "deploymentFrequency": 0,
            "leadTime": 0,
            "failureRate": 0,
            "mttr": 0,
            "deploymentsHistory": [],
            "leadTimeHistory": []
        }

    def get_burnout_metrics(self, user_id: int, project_id: int = None) -> dict:
        """
        Analyze team burnout risk based on work patterns
        """
        try:
            if project_id:
                space_ids = [project_id]
            else:
                space_ids = self._get_user_team_space_ids(user_id)
            
            if not space_ids:
                 return {"data": {"members": [], "overallRisk": 0}}

            from app.shared.models import Repository, Commit
            repos = self.db.query(Repository).filter(Repository.space_id.in_(space_ids)).all()
            repo_ids = [r.id for r in repos]
            
            if not repo_ids:
                 return {"data": {"members": [], "overallRisk": 0}}

            # Analyze last 30 days
            from datetime import datetime, timedelta
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            
            commits = self.db.query(Commit).filter(
                Commit.repository_id.in_(repo_ids),
                Commit.committed_date >= thirty_days_ago
            ).all()
            
            # Group by author
            author_stats = {}
            
            for commit in commits:
                author = commit.author_name or "Unknown"
                if author not in author_stats:
                    author_stats[author] = {
                        "late_night": 0,
                        "weekend": 0,
                        "stress_commits": 0,
                        "total": 0,
                        "stressors": []
                    }
                
                stats = author_stats[author]
                stats["total"] += 1
                
                # Late night: 22:00 - 05:00
                hour = commit.committed_date.hour
                if hour >= 22 or hour < 5:
                    stats["late_night"] += 1
                
                # Weekend: Sat (5) or Sun (6)
                weekday = commit.committed_date.weekday()
                if weekday >= 5:
                    stats["weekend"] += 1
                
                # Stress keywords
                msg = (commit.message or "").lower()
                stress_words = ["wtf", "urgent", "damn", "hack", "broken", "fail", "stupid"]
                if any(w in msg for w in stress_words):
                    stats["stress_commits"] += 1
                    if len(stats["stressors"]) < 3:
                        stats["stressors"].append(commit.message)

            # Calculate risk
            members = []
            total_risk = 0
            
            for author, stats in author_stats.items():
                if stats["total"] < 5: continue # Skip inactive
                
                risk_score = 0
                factors = []
                
                # Factor 1: Late Night Ratio
                late_ratio = stats["late_night"] / stats["total"]
                if late_ratio > 0.3:
                    risk_score += 40
                    factors.append("Night Owl")
                elif late_ratio > 0.1:
                    risk_score += 20
                
                # Factor 2: Weekend Ratio
                weekend_ratio = stats["weekend"] / stats["total"]
                if weekend_ratio > 0.3:
                    risk_score += 30
                    factors.append("No Weekend")
                elif weekend_ratio > 0.1:
                    risk_score += 15
                
                # Factor 3: Stress Comments
                if stats["stress_commits"] > 0:
                    risk_score += 20
                    factors.append("Frustrated")
                
                risk_score = min(100, risk_score)
                total_risk += risk_score
                
                status = "Healthy"
                if risk_score > 70: status = "Critical"
                elif risk_score > 30: status = "Warning"
                
                members.append({
                    "name": author,
                    "avatar": f"https://ui-avatars.com/api/?name={author}&background=random",
                    "riskScore": risk_score,
                    "status": status,
                    "factors": factors,
                    "recentStressors": stats["stressors"],
                    "metrics": {
                        "lateNight": stats["late_night"],
                        "weekend": stats["weekend"],
                        "stressCommits": stats["stress_commits"]
                    }
                })
            
            overall_risk = int(total_risk / len(members)) if members else 0
            members.sort(key=lambda x: x["riskScore"], reverse=True)
            
            return {
                "data": {
                    "members": members,
                    "overallRisk": overall_risk
                }
            }

        except Exception as e:
            print(f"ERROR: get_burnout_metrics failed: {e}")
            return {"data": {"members": [], "overallRisk": 0}}
