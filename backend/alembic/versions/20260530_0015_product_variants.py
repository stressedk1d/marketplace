"""product_variants and cart/order size

Revision ID: 20260530_0015
Revises: 20260529_0014
Create Date: 2026-05-30
"""

from alembic import op
import sqlalchemy as sa


revision = "20260530_0015"
down_revision = "20260529_0014"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "product_variants",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("size", sa.String(length=20), nullable=False),
        sa.Column("stock", sa.Integer(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(
            ["product_id"],
            ["products.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("product_id", "size", name="uq_variant_product_size"),
    )
    op.create_index(
        op.f("ix_product_variants_product_id"),
        "product_variants",
        ["product_id"],
        unique=False,
    )

    op.add_column(
        "cart_items",
        sa.Column("size", sa.String(length=20), nullable=False, server_default=""),
    )
    op.add_column(
        "order_items",
        sa.Column("size", sa.String(length=20), nullable=False, server_default=""),
    )


def downgrade() -> None:
    op.drop_column("order_items", "size")
    op.drop_column("cart_items", "size")
    op.drop_index(op.f("ix_product_variants_product_id"), table_name="product_variants")
    op.drop_table("product_variants")
