"""order delivery comment column

Revision ID: 20260530_0017
Revises: 20260530_0016
"""

from alembic import op
import sqlalchemy as sa


revision = "20260530_0017"
down_revision = "20260530_0016"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {col["name"] for col in inspector.get_columns("orders")}
    if "comment" not in columns:
        op.add_column("orders", sa.Column("comment", sa.Text(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {col["name"] for col in inspector.get_columns("orders")}
    if "comment" in columns:
        op.drop_column("orders", "comment")
