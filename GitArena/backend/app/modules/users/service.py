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
             total_commits = self.db.query(func.count(Commit.id)).filter(Commit.author_email == user.email).scalar() or 0
        else:
             # Fallback to name? Or username? Git commits use name/email.
             # If email is missing, we might miss commits.
             pass

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

    
    def count_registered_users(self) -> int:
        """Count all registered users"""
        return self.repository.count_all()
