"""add quests table

Revision ID: 008
Revises: 007_add_ai_feedback_metrics
Create Date: 2026-01-13 23:45:00

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '008'
down_revision = '007_add_ai_feedback_metrics'
branch_labels = None
depends_on = None


def upgrade():
    # Create quests table
    op.execute("""
        CREATE TABLE IF NOT EXISTS quests (
            id SERIAL PRIMARY KEY,
            title VARCHAR NOT NULL,
            description TEXT,
            target INTEGER NOT NULL,
            metric VARCHAR NOT NULL,
            reward VARCHAR,
            project_id INTEGER REFERENCES spaces(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_quests_project_id ON quests(project_id)")


def downgrade():
    op.drop_table('quests')
