from sqlalchemy.orm import Session
from app.modules.github.repository import GitHubRepository
from app.modules.github.dto import RepositoryResponse, RepositoryCreate, CommitResponse, CommitCreate
from app.shared.exceptions import NotFoundException, GitHubAPIException
from typing import List
import httpx
from datetime import datetime


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
                raise GitHubAPIException("Failed to fetch repositories from GitHub")
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
                user_id=user_id
            )
            
            if existing_repo:
                repo = self.repository.update_repository(
                    existing_repo,
                    name=repo_data.name,
                    full_name=repo_data.full_name,
                    description=repo_data.description,
                    url=repo_data.url
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
                raise GitHubAPIException("Failed to fetch commits from GitHub")
            return response.json()
    
    async def sync_commits(self, repo_id: int, access_token: str) -> List[CommitResponse]:
        """Sync commits for a repository"""
        repo = self.repository.get_repository_by_id(repo_id)
        if not repo:
            raise NotFoundException("Repository not found")
        
        # Parse owner and repo name from full_name
        owner, repo_name = repo.full_name.split("/")
        
        github_commits = await self.fetch_repository_commits(owner, repo_name, access_token)
        synced_commits = []
        
        for gh_commit in github_commits[:50]:  # Limit to first 50
            existing_commit = self.repository.get_commit_by_sha(gh_commit["sha"])
            
            if not existing_commit:
                commit_data = CommitCreate(
                    sha=gh_commit["sha"],
                    message=gh_commit["commit"]["message"],
                    author_name=gh_commit["commit"]["author"]["name"],
                    author_email=gh_commit["commit"]["author"]["email"],
                    committed_date=datetime.fromisoformat(gh_commit["commit"]["author"]["date"].replace("Z", "+00:00")),
                    repository_id=repo_id,
                    additions=0,  # Would need additional API call for stats
                    deletions=0,
                    files_changed=0
                )
                commit = self.repository.create_commit(commit_data)
                synced_commits.append(CommitResponse.model_validate(commit))
        
        # Update repository sync status
        self.repository.update_repository(repo, is_synced=True, last_synced_at=datetime.utcnow())
        
        return synced_commits
    
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
