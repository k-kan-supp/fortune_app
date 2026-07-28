"""add image_key to messages

Revision ID: 0006
Revises: 0005
Create Date: 2026-07-28
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0006"
down_revision: str | None = "0005"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("messages", sa.Column("image_key", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("messages", "image_key")
