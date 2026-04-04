"""wishlist_items table

Revision ID: 20260404_0004
Revises: 20260404_0003
Create Date: 2026-04-04
"""

from alembic import op
import sqlalchemy as sa


revision = "20260404_0004"
down_revision = "20260404_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "wishlist_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "product_id", name="uq_wishlist_user_product"),
    )
    op.create_index(op.f("ix_wishlist_items_id"), "wishlist_items", ["id"], unique=False)
    op.create_index(
        op.f("ix_wishlist_items_user_id"), "wishlist_items", ["user_id"], unique=False
    )
    op.create_index(
        op.f("ix_wishlist_items_product_id"), "wishlist_items", ["product_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_wishlist_items_product_id"), table_name="wishlist_items")
    op.drop_index(op.f("ix_wishlist_items_user_id"), table_name="wishlist_items")
    op.drop_index(op.f("ix_wishlist_items_id"), table_name="wishlist_items")
    op.drop_table("wishlist_items")
