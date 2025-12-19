from sqlalchemy.orm import Session
from app.modules.github.repository import GitHubRepository
from app.modules.github.dto import (
    RepositoryResponse, RepositoryCreate, CommitResponse, CommitCreate, 
    PullRequestCreate, PullRequestResponse, IssueCreate, IssueResponse,
    ReleaseCreate, ReleaseResponse, DeploymentCreate, DeploymentResponse,
    ActivityCreate, ActivityResponse
)
from app.shared.exceptions import NotFoundException, GitHubAPIException
from typing import List
import httpx
import asyncio
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class GitHubService:
    def __init__(self, db: Session):
        self.repository = GitHubRepository(db)
    
    async def fetch_user_repositories(self, access_token: str) -> List[dict]:
        """Fetch repositories from GitHub API"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.github.com/user/repos",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json"
                },
                params={"per_page": 100, "sort": "updated"}
            )
            if response.status_code != 200:
                logger.error(f"GitHub API Error: {response.status_code} - {response.text}")
                raise GitHubAPIException(f"Failed to fetch repositories from GitHub: {response.status_code}")
            return response.json()
    
    async def sync_repositories(self, user_id: int, access_token: str) -> List[RepositoryResponse]:
        """Sync repositories from GitHub"""
        github_repos = await self.fetch_user_repositories(access_token)
        synced_repos = []
        
        for gh_repo in github_repos:
            existing_repo = self.repository.get_repository_by_github_id(str(gh_repo["id"]))
            
            repo_data = RepositoryCreate(
                github_id=str(gh_repo["id"]),
                name=gh_repo["name"],
                full_name=gh_repo["full_name"],
                description=gh_repo.get("description"),
                url=gh_repo["html_url"],
                language=gh_repo.get("language"),
                stargazers_count=gh_repo.get("stargazers_count", 0),
                forks_count=gh_repo.get("forks_count", 0),
                user_id=user_id
            )
            
            if existing_repo:
                repo = self.repository.update_repository(
                    existing_repo,
                    name=repo_data.name,
                    full_name=repo_data.full_name,
                    description=repo_data.description,
                    url=repo_data.url,
                    language=repo_data.language,
                    stargazers_count=repo_data.stargazers_count,
                    forks_count=repo_data.forks_count
                )
            else:
                repo = self.repository.create_repository(repo_data)
            
            synced_repos.append(RepositoryResponse.model_validate(repo))
        
        return synced_repos
    
    def get_user_repositories(self, user_id: int) -> List[RepositoryResponse]:
        """Get all repositories for a user"""
        repos = self.repository.get_user_repositories(user_id)
        return [RepositoryResponse.model_validate(repo) for repo in repos]
    
    async def fetch_repository_commits(self, owner: str, repo: str, access_token: str, per_page: int = 50) -> List[dict]:
        """Fetch commits from GitHub API"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}/commits",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json"
                },
                params={"per_page": per_page}
            )
            if response.status_code != 200:
                logger.error(f"GitHub API Error (Commits): {response.status_code} - {response.text}")
                raise GitHubAPIException(f"Failed to fetch commits: {response.status_code}")
            return response.json()
    
    async def fetch_item_details(self, url: str, access_token: str) -> dict:
        """Helper to fetch single item details (commit/PR/etc)"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json"
                }
            )
            if response.status_code == 200:
                return response.json()
            return None

    async def sync_commits(self, repo_id: int, access_token: str) -> List[CommitResponse]:
        """Sync commits for a repository"""
        repo = self.repository.get_repository_by_id(repo_id)
        if not repo:
            raise NotFoundException("Repository not found")
        
        # Parse owner and repo name from full_name
        owner, repo_name = repo.full_name.split("/")
        
        github_commits = await self.fetch_repository_commits(owner, repo_name, access_token)
        synced_commits = []
        
        # Identify which commits need details
        new_gh_commits = []
        for gh_commit in github_commits[:50]:
            if not self.repository.get_commit_by_sha(gh_commit["sha"]):
                new_gh_commits.append(gh_commit)
        
        if new_gh_commits:
            # Fetch details concurrently
            tasks = [self.fetch_item_details(c["url"], access_token) for c in new_gh_commits]
            details_list = await asyncio.gather(*tasks, return_exceptions=True)
            
            for gh_commit, commit_detail in zip(new_gh_commits, details_list):
                if isinstance(commit_detail, Exception):
                    logger.warning(f"Failed to fetch details for commit {gh_commit['sha']}: {commit_detail}")
                    commit_detail = None
                    
                stats = {"additions": 0, "deletions": 0, "total": 0}
                if commit_detail and "stats" in commit_detail:
                    stats = commit_detail["stats"]
                
                commit_data = CommitCreate(
                    sha=gh_commit["sha"],
                    message=gh_commit["commit"]["message"],
                    author_name=gh_commit["commit"]["author"]["name"],
                    author_email=gh_commit["commit"]["author"]["email"],
                    committed_date=datetime.fromisoformat(gh_commit["commit"]["author"]["date"].replace("Z", "+00:00")),
                    repository_id=repo_id,
                    additions=stats.get("additions", 0),
                    deletions=stats.get("deletions", 0),
                    files_changed=stats.get("total", 0)
                )
                commit = self.repository.create_commit(commit_data)
                synced_commits.append(CommitResponse.model_validate(commit))
        
        # Update repository sync status
        self.repository.update_repository(repo, is_synced=True, last_synced_at=datetime.utcnow())
        
        return synced_commits

    async def sync_pull_requests(self, repo_id: int, access_token: str) -> List[PullRequestResponse]:
        """Sync pull requests for a repository"""
        repo = self.repository.get_repository_by_id(repo_id)
        if not repo:
            raise NotFoundException("Repository not found")
            
        owner, repo_name = repo.full_name.split("/")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.github.com/repos/{owner}/{repo_name}/pulls",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json"
                },
                params={"state": "all", "per_page": 50}
            )
            
            if response.status_code != 200:
                print(f"Failed to fetch PRs: {response.text}")
                return []
                
            github_prs = response.json()
            synced_prs = []
            
            for gh_pr in github_prs:
                existing_pr = self.repository.get_pull_request_by_github_id(str(gh_pr["id"]))
                
                pr_data = PullRequestCreate(
                    github_id=str(gh_pr["id"]),
                    number=gh_pr["number"],
                    title=gh_pr["title"],
                    description=gh_pr["body"],
                    state=gh_pr["state"],
                    author=gh_pr["user"]["login"],
                    repository_id=repo_id,
                    created_at=datetime.fromisoformat(gh_pr["created_at"].replace("Z", "+00:00")),
                    closed_at=datetime.fromisoformat(gh_pr["closed_at"].replace("Z", "+00:00")) if gh_pr.get("closed_at") else None,
                    merged_at=datetime.fromisoformat(gh_pr["merged_at"].replace("Z", "+00:00")) if gh_pr.get("merged_at") else None
                )
                
                if existing_pr:
                    pr = self.repository.update_pull_request(
                        existing_pr,
                        title=pr_data.title,
                        description=pr_data.description,
                        state=pr_data.state,
                        closed_at=pr_data.closed_at,
                        merged_at=pr_data.merged_at
                    )
                else:
                    pr = self.repository.create_pull_request(pr_data)
                
                synced_prs.append(PullRequestResponse.model_validate(pr))
                
            return synced_prs

    async def sync_issues(self, repo_id: int, access_token: str) -> List[IssueResponse]:
        """Sync issues for a repository"""
        repo = self.repository.get_repository_by_id(repo_id)
        if not repo:
            raise NotFoundException("Repository not found")
            
        owner, repo_name = repo.full_name.split("/")
        
        async with httpx.AsyncClient() as client:
            # Note: GitHub Issues API includes Pull Requests by default. We should filter them out or handle them.
            # However, for 'Planning' progress, we might want to count Issues only.
            # GitHub stores PRs as Issues too, but they have a 'pull_request' key.
            response = await client.get(
                f"https://api.github.com/repos/{owner}/{repo_name}/issues",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json"
                },
                params={"state": "all", "per_page": 50}
            )
            
            if response.status_code != 200:
                print(f"Failed to fetch Issues: {response.text}")
                return []
                
            github_issues = response.json()
            synced_issues = []
            
            for gh_issue in github_issues:
                # Skip if it is a Pull Request
                if "pull_request" in gh_issue:
                    continue
                    
                existing_issue = self.repository.get_issue_by_github_id(str(gh_issue["id"]))
                
                issue_data = IssueCreate(
                    github_id=str(gh_issue["id"]),
                    number=gh_issue["number"],
                    title=gh_issue["title"],
                    body=gh_issue["body"],
                    state=gh_issue["state"],
                    author=gh_issue["user"]["login"],
                    repository_id=repo_id,
                    created_at=datetime.fromisoformat(gh_issue["created_at"].replace("Z", "+00:00")),
                    closed_at=datetime.fromisoformat(gh_issue["closed_at"].replace("Z", "+00:00")) if gh_issue.get("closed_at") else None
                )
                
                if existing_issue:
                    issue = self.repository.update_issue(
                        existing_issue,
                        title=issue_data.title,
                        body=issue_data.body,
                        state=issue_data.state,
                        closed_at=issue_data.closed_at
                    )
                else:
                    issue = self.repository.create_issue(issue_data)
                
                synced_issues.append(IssueResponse.model_validate(issue))
                
            return synced_issues
    
    def get_repository_commits(self, repo_id: int, limit: int = 50) -> List[CommitResponse]:
        """Get commits for a repository"""
        commits = self.repository.get_repository_commits(repo_id, limit)
        return [CommitResponse.model_validate(commit) for commit in commits]
    
    def count_commits(self) -> int:
        """Count all commits"""
        return self.repository.count_commits()

    async def get_repository_tree(self, repo_id: int, access_token: str, path: str = None) -> List[dict]:
        """Get repository file tree from GitHub"""
        repo = self.repository.get_repository_by_id(repo_id)
        if not repo:
            raise NotFoundException("Repository not found")
        
        owner, repo_name = repo.full_name.split("/")
        url = f"https://api.github.com/repos/{owner}/{repo_name}/contents"
        if path:
            url += f"/{path}"
            
        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json"
                }
            )
            if response.status_code != 200:
                raise GitHubAPIException("Failed to fetch repository tree")
            return response.json()

    async def get_last_commit_for_path(self, repo_id: int, access_token: str, path: str) -> dict:
        """Get last commit for a specific file path"""
        repo = self.repository.get_repository_by_id(repo_id)
        if not repo:
            raise NotFoundException("Repository not found")
            
        owner, repo_name = repo.full_name.split("/")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.github.com/repos/{owner}/{repo_name}/commits",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json"
                },
                params={"path": path, "per_page": 1}
            )
            if response.status_code != 200:
                raise GitHubAPIException("Failed to fetch commit info")
            
            commits = response.json()
            if not commits:
                return None
                
            commit = commits[0]
            return {
                "sha": commit["sha"],
                "message": commit["commit"]["message"],
                "author_name": commit["commit"]["author"]["name"],
                "author_email": commit["commit"]["author"]["email"],
                "date": commit["commit"]["author"]["date"],
                "avatar_url": commit["author"]["avatar_url"] if commit["author"] else None
            }

    async def get_contributors(self, repo_id: int, access_token: str) -> List[dict]:
        """Get contributors for a repository"""
        repo = self.repository.get_repository_by_id(repo_id)
        if not repo:
            raise NotFoundException("Repository not found")
            
        owner, repo_name = repo.full_name.split("/")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.github.com/repos/{owner}/{repo_name}/contributors",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json"
                }
            )
            if response.status_code != 200:
                raise GitHubAPIException("Failed to fetch contributors")
            
            return response.json()

    async def get_languages(self, repo_id: int, access_token: str) -> dict:
        """Get languages for a repository"""
        repo = self.repository.get_repository_by_id(repo_id)
        if not repo:
            raise NotFoundException("Repository not found")
            
        owner, repo_name = repo.full_name.split("/")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.github.com/repos/{owner}/{repo_name}/languages",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json"
                }
            )
            if response.status_code != 200:
                raise GitHubAPIException("Failed to fetch languages")
            
            return response.json()

    async def sync_releases(self, repo_id: int, access_token: str) -> List[ReleaseResponse]:
        """Sync releases for a repository"""
        repo = self.repository.get_repository_by_id(repo_id)
        if not repo:
            raise NotFoundException("Repository not found")
            
        owner, repo_name = repo.full_name.split("/")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.github.com/repos/{owner}/{repo_name}/releases",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json"
                },
                params={"per_page": 50}
            )
            
            if response.status_code != 200:
                print(f"Failed to fetch releases: {response.text}")
                return []
                
            github_releases = response.json()
            synced_releases = []
            
            for gh_release in github_releases:
                existing_release = self.repository.get_release_by_github_id(str(gh_release["id"]))
                
                release_data = ReleaseCreate(
                    github_id=str(gh_release["id"]),
                    tag_name=gh_release["tag_name"],
                    name=gh_release.get("name"),
                    body=gh_release.get("body"),
                    draft=gh_release.get("draft", False),
                    prerelease=gh_release.get("prerelease", False),
                    created_at=datetime.fromisoformat(gh_release["created_at"].replace("Z", "+00:00")),
                    published_at=datetime.fromisoformat(gh_release["published_at"].replace("Z", "+00:00")) if gh_release.get("published_at") else None,
                    repository_id=repo_id
                )
                
                if existing_release:
                    release = self.repository.update_release(
                        existing_release,
                        name=release_data.name,
                        body=release_data.body,
                        draft=release_data.draft,
                        prerelease=release_data.prerelease,
                        published_at=release_data.published_at
                    )
                else:
                    release = self.repository.create_release(release_data)
                
                synced_releases.append(ReleaseResponse.model_validate(release))
                
            return synced_releases

    async def sync_deployments(self, repo_id: int, access_token: str) -> List[DeploymentResponse]:
        """Sync deployments for a repository"""
        repo = self.repository.get_repository_by_id(repo_id)
        if not repo:
            raise NotFoundException("Repository not found")
            
        owner, repo_name = repo.full_name.split("/")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.github.com/repos/{owner}/{repo_name}/deployments",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json"
                },
                params={"per_page": 50}
            )
            
            if response.status_code != 200:
                print(f"Failed to fetch deployments: {response.text}")
                return []
                
            github_deployments = response.json()
            synced_deployments = []
            
            for gh_dep in github_deployments:
                existing_dep = self.repository.get_deployment_by_github_id(str(gh_dep["id"]))
                
                deployment_data = DeploymentCreate(
                    github_id=str(gh_dep["id"]),
                    environment=gh_dep["environment"],
                    description=gh_dep.get("description"),
                    state="unknown",
                    created_at=datetime.fromisoformat(gh_dep["created_at"].replace("Z", "+00:00")),
                    updated_at=datetime.fromisoformat(gh_dep["updated_at"].replace("Z", "+00:00")),
                    repository_id=repo_id
                )
                
                if existing_dep:
                    deployment = self.repository.update_deployment(
                        existing_dep,
                        description=deployment_data.description,
                        state=deployment_data.state,
                        updated_at=deployment_data.updated_at
                    )
                else:
                    deployment = self.repository.create_deployment(deployment_data)
                
                synced_deployments.append(DeploymentResponse.model_validate(deployment))
                
            return synced_deployments

    async def sync_activities(self, repo_id: int, access_token: str) -> List[ActivityResponse]:
        """Sync unified activities for a repository by looking at events"""
        repo = self.repository.get_repository_by_id(repo_id)
        if not repo:
            raise NotFoundException("Repository not found")
            
        owner, repo_name = repo.full_name.split("/")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.github.com/repos/{owner}/{repo_name}/events",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json"
                },
                params={"per_page": 50}
            )
            
            if response.status_code != 200:
                print(f"Failed to fetch events: {response.text}")
                return []
                
            github_events = response.json()
            synced_activities = []
            
            for event in github_events:
                existing_activity = self.repository.get_activity_by_github_id(str(event["id"]))
                if existing_activity:
                    continue
                
                event_type = event["type"]
                payload = event["payload"]
                action = payload.get("action", "unknown")
                
                title = f"Event: {event_type}"
                description = None
                
                if event_type == "PushEvent":
                    title = f"Pushed {len(payload.get('commits', []))} commits"
                    description = payload.get("commits", [{}])[0].get("message")
                    action = "push"
                elif event_type == "PullRequestEvent":
                    title = f"Pull Request {action}: {payload['pull_request']['title']}"
                    description = payload["pull_request"].get("body")
                elif event_type == "IssuesEvent":
                    title = f"Issue {action}: {payload['issue']['title']}"
                    description = payload["issue"].get("body")
                elif event_type == "ReleaseEvent":
                    title = f"Release {action}: {payload['release']['name'] or payload['release']['tag_name']}"
                
                activity_data = ActivityCreate(
                    github_id=str(event["id"]),
                    type=event_type,
                    action=action,
                    title=title,
                    description=description,
                    user_login=event["actor"]["login"],
                    created_at=datetime.fromisoformat(event["created_at"].replace("Z", "+00:00")),
                    repository_id=repo_id
                )
                
                activity = self.repository.create_activity(activity_data)
                synced_activities.append(ActivityResponse.model_validate(activity))
                
            return synced_activities
