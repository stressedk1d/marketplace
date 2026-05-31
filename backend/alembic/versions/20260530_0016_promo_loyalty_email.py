"""promo codes, loyalty points, order discount, email logs

Revision ID: 20260530_0016
Revises: 20260530_0015
"""

from alembic import op
import sqlalchemy as sa


revision = "20260530_0016"
down_revision = "20260530_0015"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "promo_codes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(length=32), nullable=False),
        sa.Column("discount_percent", sa.Float(), nullable=True),
        sa.Column("discount_fixed", sa.Float(), nullable=True),
        sa.Column("min_order_amount", sa.Float(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
    )
    op.create_index(op.f("ix_promo_codes_code"), "promo_codes", ["code"], unique=True)

    op.add_column("users", sa.Column("loyalty_points", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("orders", sa.Column("promo_code", sa.String(length=32), nullable=True))
    op.add_column("orders", sa.Column("discount_amount", sa.Float(), nullable=False, server_default="0"))

    op.create_table(
        "email_logs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("order_id", sa.Integer(), nullable=True),
        sa.Column("to_email", sa.String(), nullable=False),
        sa.Column("subject", sa.String(), nullable=False),
        sa.Column("body_preview", sa.String(), nullable=False),
        sa.Column("sent", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("email_logs")
    op.drop_column("orders", "discount_amount")
    op.drop_column("orders", "promo_code")
    op.drop_column("users", "loyalty_points")
    op.drop_index(op.f("ix_promo_codes_code"), table_name="promo_codes")
    op.drop_table("promo_codes")
