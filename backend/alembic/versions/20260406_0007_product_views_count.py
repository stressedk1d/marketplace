"""product.views_count for trending

Revision ID: 20260406_0007
Revises: 20260405_0006
Create Date: 2026-04-06
"""

from alembic import op
import sqlalchemy as sa


revision = "20260406_0007"
down_revision = "20260405_0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("products") as batch_op:
        batch_op.add_column(
            sa.Column(
                "views_count",
                sa.Integer(),
                nullable=False,
                server_default="0",
            )
        )


def downgrade() -> None:
    with op.batch_alter_table("products") as batch_op:
        batch_op.drop_column("views_count")
