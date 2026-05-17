"""site_config for maintenance mode

Revision ID: 20260425_0013
Revises: 20260425_0012
Create Date: 2026-04-25
"""

import sqlalchemy as sa
from alembic import op


revision = "20260425_0013"
down_revision = "20260425_0012"
branch_labels = None
depends_on = None

DEFAULT_MESSAGE = (
    "Сайт временно недоступен — ведутся технические работы. Зайдите позже."
)


def upgrade() -> None:
    op.create_table(
        "site_config",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("maintenance_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column(
            "maintenance_message",
            sa.String(),
            nullable=False,
            server_default=DEFAULT_MESSAGE,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.execute(
        sa.text(
            "INSERT INTO site_config (id, maintenance_enabled, maintenance_message) "
            "VALUES (1, false, :msg)"
        ).bindparams(msg=DEFAULT_MESSAGE)
    )


def downgrade() -> None:
    op.drop_table("site_config")
