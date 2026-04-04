"""email verification: add code_expires_at, drop telegram_id

Revision ID: 20260323_0002
Revises: 20260219_0001
Create Date: 2026-03-23
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = "20260323_0002"
down_revision = "20260219_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    cols = {c["name"] for c in inspect(conn).get_columns("users")}
    if "code_expires_at" not in cols:
        op.add_column("users", sa.Column("code_expires_at", sa.DateTime(), nullable=True))
    if "telegram_id" in cols:
        with op.batch_alter_table("users") as batch_op:
            batch_op.drop_column("telegram_id")


def downgrade() -> None:
    op.add_column("users", sa.Column("telegram_id", sa.String(), nullable=True))

    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_column("code_expires_at")
