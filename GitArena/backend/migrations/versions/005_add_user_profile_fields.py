"""add user profile fields

Revision ID: 005
Revises: 004
Create Date: 2025-12-22 11:45:00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade():
    # Add profile fields to users table
    op.add_column('users', sa.Column('bio', sa.String(), nullable=True))
    op.add_column('users', sa.Column('location', sa.String(), nullable=True))
    op.add_column('users', sa.Column('company', sa.String(), nullable=True))
    op.add_column('users', sa.Column('blog', sa.String(), nullable=True))
    op.add_column('users', sa.Column('twitter_username', sa.String(), nullable=True))


def downgrade():
    # Remove profile fields from users table
    op.drop_column('users', 'twitter_username')
    op.drop_column('users', 'blog')
    op.drop_column('users', 'company')
    op.drop_column('users', 'location')
    op.drop_column('users', 'bio')
