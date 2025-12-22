"""add missing tables (issues, releases, deployments, activities)

Revision ID: 006
Revises: 005
Create Date: 2025-12-22 12:20:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '006'
down_revision = '005'
branch_labels = None
depends_on = None


def upgrade():
    # Create issues table
    op.create_table(
        'issues',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('github_id', sa.String(), nullable=True),
        sa.Column('number', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(), nullable=True),
        sa.Column('body', sa.Text(), nullable=True),
        sa.Column('state', sa.String(), nullable=True),
        sa.Column('author', sa.String(), nullable=True),
        sa.Column('repository_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('closed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['repository_id'], ['repositories.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_issues_github_id'), 'issues', ['github_id'], unique=True)

    # Create releases table
    op.create_table(
        'releases',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('github_id', sa.String(), nullable=True),
        sa.Column('tag_name', sa.String(), nullable=True),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('body', sa.Text(), nullable=True),
        sa.Column('draft', sa.Boolean(), nullable=True),
        sa.Column('prerelease', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('published_at', sa.DateTime(), nullable=True),
        sa.Column('repository_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['repository_id'], ['repositories.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_releases_github_id'), 'releases', ['github_id'], unique=True)

    # Create deployments table
    op.create_table(
        'deployments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('github_id', sa.String(), nullable=True),
        sa.Column('environment', sa.String(), nullable=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('state', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('repository_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['repository_id'], ['repositories.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_deployments_github_id'), 'deployments', ['github_id'], unique=True)

    # Create activities table
    op.create_table(
        'activities',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('github_id', sa.String(), nullable=True),
        sa.Column('type', sa.String(), nullable=True),
        sa.Column('action', sa.String(), nullable=True),
        sa.Column('title', sa.String(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('user_login', sa.String(), nullable=True),
        sa.Column('repository_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['repository_id'], ['repositories.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_activities_github_id'), 'activities', ['github_id'], unique=True)


def downgrade():
    op.drop_table('activities')
    op.drop_table('deployments')
    op.drop_table('releases')
    op.drop_table('issues')
