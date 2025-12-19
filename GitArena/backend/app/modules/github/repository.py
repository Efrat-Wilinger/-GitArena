from sqlalchemy.orm import Session
from app.shared.models import Repository, Commit, PullRequest, Issue, Release, Deployment, Activity
from app.modules.github.dto import (
    RepositoryCreate, CommitCreate, PullRequestCreate, IssueCreate,
    ReleaseCreate, DeploymentCreate, ActivityCreate
)
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

    def get_repository_commits_in_range(self, repo_id: int, start_date: datetime, end_date: datetime) -> List[Commit]:
        """Get commits for a repository within a date range"""
        return self.db.query(Commit)\
            .filter(Commit.repository_id == repo_id)\
            .filter(Commit.committed_date >= start_date)\
            .filter(Commit.committed_date <= end_date)\
            .order_by(Commit.committed_date.desc())\
            .all()


    # Pull Request operations
    def get_pull_request_by_github_id(self, github_id: str) -> Optional[PullRequest]:
        """Get pull request by GitHub ID"""
        return self.db.query(PullRequest).filter(PullRequest.github_id == github_id).first()
    
    def create_pull_request(self, pr_data: PullRequestCreate) -> PullRequest:
        """Create new pull request"""
        pr = PullRequest(**pr_data.model_dump())
        self.db.add(pr)
        self.db.commit()
        self.db.refresh(pr)
        return pr
    
    def update_pull_request(self, pr: PullRequest, **kwargs) -> PullRequest:
        """Update pull request"""
        for key, value in kwargs.items():
            setattr(pr, key, value)
        self.db.commit()
        self.db.refresh(pr)
        return pr

    # Issue operations
    def get_issue_by_github_id(self, github_id: str) -> Optional[Issue]:
        """Get issue by GitHub ID"""
        return self.db.query(Issue).filter(Issue.github_id == github_id).first()
    
    def create_issue(self, issue_data: IssueCreate) -> Issue:
        """Create new issue"""
        issue = Issue(**issue_data.model_dump())
        self.db.add(issue)
        self.db.commit()
        self.db.refresh(issue)
        return issue
    
    def update_issue(self, issue: Issue, **kwargs) -> Issue:
        """Update issue"""
        for key, value in kwargs.items():
            setattr(issue, key, value)
        self.db.commit()
        self.db.refresh(issue)
        return issue

    # Release operations
    def get_release_by_github_id(self, github_id: str) -> Optional[Release]:
        """Get release by GitHub ID"""
        return self.db.query(Release).filter(Release.github_id == github_id).first()
    
    def create_release(self, release_data: ReleaseCreate) -> Release:
        """Create new release"""
        release = Release(**release_data.model_dump())
        self.db.add(release)
        self.db.commit()
        self.db.refresh(release)
        return release
    
    def update_release(self, release: Release, **kwargs) -> Release:
        """Update release"""
        for key, value in kwargs.items():
            setattr(release, key, value)
        self.db.commit()
        self.db.refresh(release)
        return release

    # Deployment operations
    def get_deployment_by_github_id(self, github_id: str) -> Optional[Deployment]:
        """Get deployment by GitHub ID"""
        return self.db.query(Deployment).filter(Deployment.github_id == github_id).first()
    
    def create_deployment(self, deployment_data: DeploymentCreate) -> Deployment:
        """Create new deployment"""
        deployment = Deployment(**deployment_data.model_dump())
        self.db.add(deployment)
        self.db.commit()
        self.db.refresh(deployment)
        return deployment
    
    def update_deployment(self, deployment: Deployment, **kwargs) -> Deployment:
        """Update deployment"""
        for key, value in kwargs.items():
            setattr(deployment, key, value)
        self.db.commit()
        self.db.refresh(deployment)
        return deployment

    # Activity operations
    def get_activity_by_github_id(self, github_id: str) -> Optional[Activity]:
        """Get activity by GitHub ID"""
        return self.db.query(Activity).filter(Activity.github_id == github_id).first()
    
    def create_activity(self, activity_data: ActivityCreate) -> Activity:
        """Create new activity"""
        activity = Activity(**activity_data.model_dump())
        self.db.add(activity)
        self.db.commit()
        self.db.refresh(activity)
        return activity

