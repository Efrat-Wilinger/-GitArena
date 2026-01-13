"""Add performance metrics to ai_feedback table

Revision ID: 002_add_ai_feedback_metrics
Revises: 001_initial_migration
Create Date: 2026-01-13 11:05:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_add_ai_feedback_metrics'
down_revision = '001_initial_migration'
branch_labels = None
depends_on = None


def upgrade():
    """
    Add new performance metrics columns to ai_feedback table
    """
    # Add performance metrics columns
    op.add_column('ai_feedback', sa.Column('code_quality_score', sa.Float(), nullable=True))
    op.add_column('ai_feedback', sa.Column('code_volume', sa.Integer(), nullable=True))
    op.add_column('ai_feedback', sa.Column('effort_score', sa.Float(), nullable=True))
    op.add_column('ai_feedback', sa.Column('velocity_score', sa.Float(), nullable=True))
    op.add_column('ai_feedback', sa.Column('consistency_score', sa.Float(), nullable=True))
    
    # Add qualitative analysis columns
    op.add_column('ai_feedback', sa.Column('improvement_areas', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column('ai_feedback', sa.Column('strengths', postgresql.JSON(astext_type=sa.Text()), nullable=True))


def downgrade():
    """
    Remove performance metrics columns from ai_feedback table
    """
    op.drop_column('ai_feedback', 'strengths')
    op.drop_column('ai_feedback', 'improvement_areas')
    op.drop_column('ai_feedback', 'consistency_score')
    op.drop_column('ai_feedback', 'velocity_score')
    op.drop_column('ai_feedback', 'effort_score')
    op.drop_column('ai_feedback', 'code_volume')
    op.drop_column('ai_feedback', 'code_quality_score')
