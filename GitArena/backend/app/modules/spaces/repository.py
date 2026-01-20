from sqlalchemy.orm import Session, joinedload
from app.shared.models import Space, SpaceMember, User
from app.modules.spaces.dto import SpaceCreate
from typing import List

class SpaceRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_space(self, space_data: SpaceCreate, owner_id: int) -> Space:
        space = Space(
            name=space_data.name,
            description=space_data.description,
            owner_id=owner_id
        )
        self.db.add(space)
        self.db.commit()
        self.db.refresh(space)
        return space

    def get_user_spaces(self, user_id: int) -> List[Space]:
        # Get spaces owned by user OR where user is a member
        # Using a single query with outerjoin for efficiency and reliability
        query = self.db.query(Space).outerjoin(SpaceMember).options(
            joinedload(Space.members),
            joinedload(Space.repositories)
        ).filter(
            (Space.owner_id == user_id) | (SpaceMember.user_id == user_id)
        )
        
        return query.distinct().all()

    def add_member(self, space_id: int, user_id: int, role: str = "viewer") -> SpaceMember:
        member = SpaceMember(space_id=space_id, user_id=user_id, role=role)
        self.db.add(member)
        self.db.commit()
        self.db.refresh(member)
        return member

    def get_members(self, space_id: int) -> List[SpaceMember]:
        return self.db.query(SpaceMember).filter(SpaceMember.space_id == space_id).all()

    def get_space_by_id(self, space_id: int) -> Space:
        return self.db.query(Space).filter(Space.id == space_id).first()

    def remove_member(self, space_id: int, user_id: int):
        member = self.db.query(SpaceMember).filter(
            SpaceMember.space_id == space_id,
            SpaceMember.user_id == user_id
        ).first()
        if member:
            self.db.delete(member)
            self.db.commit()

    def find_space_by_repository_id(self, github_repo_id: str) -> Space:
        """Find a space that contains a repository with the given GitHub ID"""
        from app.shared.models import Repository
        return self.db.query(Space).join(Repository).filter(Repository.github_id == str(github_repo_id)).first()


    def is_member(self, space_id: int, user_id: int) -> bool:
        return self.db.query(SpaceMember).filter(
            SpaceMember.space_id == space_id,
            SpaceMember.user_id == user_id
        ).first() is not None
