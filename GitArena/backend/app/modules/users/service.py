from sqlalchemy.orm import Session
from app.modules.users.repository import UserRepository
from app.modules.users.dto import UserCreate, UserResponse
from app.shared.exceptions import NotFoundException
from typing import Optional
import httpx
from app.config.settings import settings


class UserService:
    def __init__(self, db: Session):
        self.repository = UserRepository(db)
    
    def get_user_by_id(self, user_id: int) -> UserResponse:
        """Get user by ID"""
        user = self.repository.get_by_id(user_id)
        if not user:
            raise NotFoundException("User not found")
        return UserResponse.model_validate(user)
    
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
        existing_user = self.repository.get_by_github_id(str(github_user["id"]))
        
        user_data = UserCreate(
            github_id=str(github_user["id"]),
            username=github_user["login"],
            email=github_user.get("email"),
            name=github_user.get("name"),
            avatar_url=github_user.get("avatar_url"),
            access_token=access_token
        )
        
        if existing_user:
            user = self.repository.update(
                existing_user,
                username=user_data.username,
                email=user_data.email,
                name=user_data.name,
                avatar_url=user_data.avatar_url,
                access_token=access_token
            )
        else:
            user = self.repository.create(user_data)
        
        return UserResponse.model_validate(user)
    
    def count_registered_users(self) -> int:
        """Count all registered users"""
        return self.repository.count_all()
