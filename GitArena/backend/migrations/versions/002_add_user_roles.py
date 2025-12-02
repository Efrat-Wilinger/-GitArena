"""add user roles

Revision ID: 002
Revises: 001_initial_migration
Create Date: 2025-11-24 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('role', sa.String(), nullable=True))
    op.execute("UPDATE users SET role = 'member' WHERE role IS NULL")


def downgrade() -> None:
    op.drop_column('users', 'role')
