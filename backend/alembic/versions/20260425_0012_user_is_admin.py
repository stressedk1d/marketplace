"""add users.is_admin

Revision ID: 20260425_0012
Revises: 20260425_0011
Create Date: 2026-04-25
"""

import sqlalchemy as sa
from alembic import op


revision = "20260425_0012"
down_revision = "20260425_0011"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.false())
        )


def downgrade() -> None:
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.drop_column("is_admin")
