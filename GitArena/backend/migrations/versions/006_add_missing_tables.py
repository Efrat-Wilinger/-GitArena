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
    # Create tables with IF NOT EXISTS logic using raw SQL
    op.execute("""
        CREATE TABLE IF NOT EXISTS issues (
            id SERIAL PRIMARY KEY,
            github_id VARCHAR UNIQUE,
            number INTEGER,
            title VARCHAR,
            body TEXT,
            state VARCHAR,
            author VARCHAR,
            repository_id INTEGER REFERENCES repositories(id),
            created_at TIMESTAMP,
            updated_at TIMESTAMP,
            closed_at TIMESTAMP
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_issues_github_id ON issues(github_id)")

    op.execute("""
        CREATE TABLE IF NOT EXISTS releases (
            id SERIAL PRIMARY KEY,
            github_id VARCHAR UNIQUE,
            tag_name VARCHAR,
            name VARCHAR,
            body TEXT,
            draft BOOLEAN,
            prerelease BOOLEAN,
            created_at TIMESTAMP,
            published_at TIMESTAMP,
            repository_id INTEGER REFERENCES repositories(id)
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_releases_github_id ON releases(github_id)")

    op.execute("""
        CREATE TABLE IF NOT EXISTS deployments (
            id SERIAL PRIMARY KEY,
            github_id VARCHAR UNIQUE,
            environment VARCHAR,
            description VARCHAR,
            state VARCHAR,
            created_at TIMESTAMP,
            updated_at TIMESTAMP,
            repository_id INTEGER REFERENCES repositories(id)
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_deployments_github_id ON deployments(github_id)")

    op.execute("""
        CREATE TABLE IF NOT EXISTS activities (
            id SERIAL PRIMARY KEY,
            github_id VARCHAR UNIQUE,
            type VARCHAR,
            action VARCHAR,
            title VARCHAR,
            description TEXT,
            user_login VARCHAR,
            repository_id INTEGER REFERENCES repositories(id),
            created_at TIMESTAMP
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_activities_github_id ON activities(github_id)")


def downgrade():
    op.drop_table('activities')
    op.drop_table('deployments')
    op.drop_table('releases')
    op.drop_table('issues')
