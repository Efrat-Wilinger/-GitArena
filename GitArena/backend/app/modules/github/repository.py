from sqlalchemy.orm import Session
from app.shared.models import Repository, Commit
from app.modules.github.dto import RepositoryCreate, CommitCreate
from typing import List, Optional
from datetime import datetime


class GitHubRepository:
    def __init__(self, db: Session):
        self.db = db
    
    # Repository operations
    def get_repository_by_id(self, repo_id: int) -> Optional[Repository]:
        """Get repository by ID"""
        return self.db.query(Repository).filter(Repository.id == repo_id).first()
    
    def get_repository_by_github_id(self, github_id: str) -> Optional[Repository]:
        """Get repository by GitHub ID"""
        return self.db.query(Repository).filter(Repository.github_id == github_id).first()
    
    def get_user_repositories(self, user_id: int) -> List[Repository]:
        """Get all repositories for a user"""
        return self.db.query(Repository).filter(Repository.user_id == user_id).all()
    
    def create_repository(self, repo_data: RepositoryCreate) -> Repository:
        """Create new repository"""
        repo = Repository(**repo_data.model_dump())
        self.db.add(repo)
        self.db.commit()
        self.db.refresh(repo)
        return repo
    
    def update_repository(self, repo: Repository, **kwargs) -> Repository:
        """Update repository"""
        for key, value in kwargs.items():
            setattr(repo, key, value)
        self.db.commit()
        self.db.refresh(repo)
        return repo
    
    # Commit operations
    def get_commit_by_sha(self, sha: str) -> Optional[Commit]:
        """Get commit by SHA"""
        return self.db.query(Commit).filter(Commit.sha == sha).first()
    
    def get_repository_commits(self, repo_id: int, limit: int = 50) -> List[Commit]:
        """Get commits for a repository"""
        return self.db.query(Commit)\
            .filter(Commit.repository_id == repo_id)\
            .order_by(Commit.committed_date.desc())\
            .limit(limit)\
            .all()
    
    def create_commit(self, commit_data: CommitCreate) -> Commit:
        """Create new commit"""
        commit = Commit(**commit_data.model_dump())
        self.db.add(commit)
        self.db.commit()
        self.db.refresh(commit)
        return commit
    
    def count_commits(self) -> int:
        """Count all commits"""
        return self.db.query(Commit).count()
