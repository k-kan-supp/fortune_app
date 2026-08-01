"""add matching profile fields

Revision ID: 0003
Revises: 0002
Create Date: 2026-07-28
"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0003"
down_revision: str | None = "0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

_COLUMNS = [
    sa.Column("height_cm", sa.Integer(), nullable=True),
    sa.Column("weight_kg", sa.Integer(), nullable=True),
    sa.Column("body_type", sa.String(length=20), nullable=True),
    sa.Column("blood_type", sa.String(length=2), nullable=True),
    sa.Column("occupation", sa.String(length=50), nullable=True),
    sa.Column("education", sa.String(length=20), nullable=True),
    sa.Column("prefecture", sa.String(length=20), nullable=True),
    sa.Column("marital_status", sa.String(length=20), nullable=True),
    sa.Column("smoking", sa.String(length=20), nullable=True),
    sa.Column("drinking", sa.String(length=20), nullable=True),
    sa.Column("bio", sa.Text(), nullable=True),
]


def upgrade() -> None:
    for col in _COLUMNS:
        op.add_column("user_profiles", col)


def downgrade() -> None:
    for col in reversed(_COLUMNS):
        op.drop_column("user_profiles", col.name)
