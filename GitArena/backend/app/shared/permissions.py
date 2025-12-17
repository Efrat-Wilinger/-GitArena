"""
Role-based permission decorators and utilities for GitArena.

This module provides decorators and helper functions for enforcing
role-based access control (RBAC) in the application.

User Roles:
- admin: Can manage teams, view all member analytics
- member: Regular employee, sees only personal + aggregate team data

Team Roles (SpaceMember):
- admin: Team owner/manager, full access to team
- member: Regular team member
- viewer: Read-only access
"""

from functools import wraps
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.shared.models import User, Space, SpaceMember


class PermissionDenied(HTTPException):
    """Custom exception for permission denied errors."""
    def __init__(self, detail: str = "You don't have permission to perform this action"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )


def require_admin(func):
    """
    Decorator to require user to be an admin.
    
    Usage:
        @require_admin
        def my_endpoint(current_user: User):
            ...
    """
    @wraps(func)
    async def wrapper(*args, current_user: User = None, **kwargs):
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required"
            )
        
        if current_user.role != "admin":
            raise PermissionDenied("Admin access required")
        
        return await func(*args, current_user=current_user, **kwargs)
    
    return wrapper


def is_team_admin(db: Session, space_id: int, user: User) -> bool:
    """
    Check if user is admin of the specified team/space.
    
    Args:
        db: Database session
        space_id: ID of the space/team
        user: User to check
    
    Returns:
        True if user is owner or has admin role in team
    """
    # Check if user is the space owner
    space = db.query(Space).filter(Space.id == space_id).first()
    if not space:
        return False
    
    if space.owner_id == user.id:
        return True
    
    # Check if user has admin role in space members
    membership = db.query(SpaceMember).filter(
        SpaceMember.space_id == space_id,
        SpaceMember.user_id == user.id,
        SpaceMember.role == "admin"
    ).first()
    
    return membership is not None


def is_team_member(db: Session, space_id: int, user: User) -> bool:
    """
    Check if user is a member of the specified team/space.
    
    Args:
        db: Database session
        space_id: ID of the space/team
        user: User to check
    
    Returns:
        True if user is owner or member of team
    """
    # Check if user is the space owner
    space = db.query(Space).filter(Space.id == space_id).first()
    if not space:
        return False
    
    if space.owner_id == user.id:
        return True
    
    # Check if user is in space members
    membership = db.query(SpaceMember).filter(
        SpaceMember.space_id == space_id,
        SpaceMember.user_id == user.id
    ).first()
    
    return membership is not None


def require_team_admin(space_id_param: str = "space_id"):
    """
    Decorator to require user to be admin of a specific team.
    
    Args:
        space_id_param: Name of the parameter containing space_id
    
    Usage:
        @require_team_admin()
        def my_endpoint(space_id: int, current_user: User, db: Session):
            ...
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, db: Session = None, current_user: User = None, **kwargs):
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )
            
            if not db:
                raise ValueError("Database session required")
            
            # Get space_id from kwargs
            space_id = kwargs.get(space_id_param)
            if not space_id:
                raise ValueError(f"Missing required parameter: {space_id_param}")
            
            if not is_team_admin(db, space_id, current_user):
                raise PermissionDenied("Team admin access required")
            
            return await func(*args, db=db, current_user=current_user, **kwargs)
        
        return wrapper
    return decorator


def require_team_member(space_id_param: str = "space_id"):
    """
    Decorator to require user to be a member of a specific team.
    
    Args:
        space_id_param: Name of the parameter containing space_id
    
    Usage:
        @require_team_member()
        def my_endpoint(space_id: int, current_user: User, db: Session):
            ...
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, db: Session = None, current_user: User = None, **kwargs):
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )
            
            if not db:
                raise ValueError("Database session required")
            
            # Get space_id from kwargs
            space_id = kwargs.get(space_id_param)
            if not space_id:
                raise ValueError(f"Missing required parameter: {space_id_param}")
            
            if not is_team_member(db, space_id, current_user):
                raise PermissionDenied("Team membership required")
            
            return await func(*args, db=db, current_user=current_user, **kwargs)
        
        return wrapper
    return decorator


def can_view_member_details(db: Session, space_id: int, viewer: User, target_user_id: int) -> bool:
    """
    Check if viewer can see detailed analytics of target user.
    
    Rules:
    - User can always view their own details
    - Team admins can view all team members' details
    - Regular members cannot view others' details
    
    Args:
        db: Database session
        space_id: ID of the space/team
        viewer: User requesting to view
        target_user_id: ID of user to be viewed
    
    Returns:
        True if viewer has permission
    """
    # User can always view their own details
    if viewer.id == target_user_id:
        return True
    
    # Team admin can view all members
    if is_team_admin(db, space_id, viewer):
        # Verify target user is in the team
        return is_team_member(db, space_id, viewer)
    
    # Regular members cannot view others' details
    return False
