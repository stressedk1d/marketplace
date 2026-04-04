"""normalize order.status for lifecycle enum (created/paid/shipped/delivered/cancelled)

Revision ID: 20260404_0003
Revises: 20260323_0002
Create Date: 2026-04-04
"""

from alembic import op
import sqlalchemy as sa


revision = "20260404_0003"
down_revision = "20260323_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        sa.text(
            """
            UPDATE orders
            SET status = 'created'
            WHERE status IS NULL
               OR TRIM(status) = ''
               OR LOWER(status) NOT IN (
                   'created', 'paid', 'shipped', 'delivered', 'cancelled'
               )
            """
        )
    )


def downgrade() -> None:
    pass
