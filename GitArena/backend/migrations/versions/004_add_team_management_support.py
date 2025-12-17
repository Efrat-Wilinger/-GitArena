"""add github_login and update roles

Revision ID: 004
Revises: 003
Create Date: 2025-12-17 17:55:00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade():
    # Add github_login column to users table
    op.add_column('users', sa.Column('github_login', sa.String(), nullable=True))
    op.create_index('ix_users_github_login', 'users', ['github_login'], unique=True)
    
    # Update User.role comment (no actual column change needed, just documentation)
    # member (employee/developer), admin (can manage teams)
    
    # Update SpaceMember default role from 'viewer' to 'member'
    # Note: This only affects new records, existing records keep their current values
    op.alter_column('space_members', 'role',
                    existing_type=sa.String(),
                    server_default='member',
                    nullable=False)
    
    # Add indexes to space_members for better query performance
    op.create_index('ix_space_members_space_id', 'space_members', ['space_id'])
    op.create_index('ix_space_members_user_id', 'space_members', ['user_id'])


def downgrade():
    # Remove indexes from space_members
    op.drop_index('ix_space_members_user_id', table_name='space_members')
    op.drop_index('ix_space_members_space_id', table_name='space_members')
    
    # Revert SpaceMember default role
    op.alter_column('space_members', 'role',
                    existing_type=sa.String(),
                    server_default='viewer',
                    nullable=False)
    
    # Remove github_login from users
    op.drop_index('ix_users_github_login', table_name='users')
    op.drop_column('users', 'github_login')
