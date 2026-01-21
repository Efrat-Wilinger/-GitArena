
"""add missing schema fields

Revision ID: 009
Revises: 6e40c7e179d7
Create Date: 2026-01-21 23:50:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '009'
down_revision = '6e40c7e179d7'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add missing columns to repositories table
    with op.batch_alter_table('repositories') as batch_op:
        batch_op.add_column(sa.Column('language', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('stargazers_count', sa.Integer(), nullable=True, server_default='0'))
        batch_op.add_column(sa.Column('forks_count', sa.Integer(), nullable=True, server_default='0'))
    
    # Add missing columns to commits table
    with op.batch_alter_table('commits') as batch_op:
        batch_op.add_column(sa.Column('diff_data', sa.JSON(), nullable=True))

def downgrade() -> None:
    with op.batch_alter_table('commits') as batch_op:
        batch_op.drop_column('diff_data')
        
    with op.batch_alter_table('repositories') as batch_op:
        batch_op.drop_column('forks_count')
        batch_op.drop_column('stargazers_count')
        batch_op.drop_column('language')
