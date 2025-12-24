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
    # Add profile fields to users table (with IF NOT EXISTS to handle existing columns)
    op.execute('ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR')
    op.execute('ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR')
    op.execute('ALTER TABLE users ADD COLUMN IF NOT EXISTS company VARCHAR')
    op.execute('ALTER TABLE users ADD COLUMN IF NOT EXISTS blog VARCHAR')
    op.execute('ALTER TABLE users ADD COLUMN IF NOT EXISTS twitter_username VARCHAR')


def downgrade():
    # Remove profile fields from users table
    op.drop_column('users', 'twitter_username')
    op.drop_column('users', 'blog')
    op.drop_column('users', 'company')
    op.drop_column('users', 'location')
    op.drop_column('users', 'bio')
