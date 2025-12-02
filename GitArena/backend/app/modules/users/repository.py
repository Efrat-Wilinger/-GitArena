from sqlalchemy.orm import Session
from app.shared.models import User
from app.modules.users.dto import UserCreate
from typing import Optional


class UserRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return self.db.query(User).filter(User.id == user_id).first()
    
    def get_by_github_id(self, github_id: str) -> Optional[User]:
        """Get user by GitHub ID"""
        return self.db.query(User).filter(User.github_id == github_id).first()
    
    def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        return self.db.query(User).filter(User.username == username).first()
    
    def create(self, user_data: UserCreate) -> User:
        """Create new user"""
        user = User(**user_data.model_dump())
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def update(self, user: User, **kwargs) -> User:
        """Update user"""
        for key, value in kwargs.items():
            setattr(user, key, value)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def count_all(self) -> int:
        """Count all registered users"""
        return self.db.query(User).count()
