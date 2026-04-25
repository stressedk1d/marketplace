"""add product_images table and backfill from products.image_url

Revision ID: 20260425_0009
Revises: 20260406_0007
Create Date: 2026-04-25
"""

from alembic import op
import sqlalchemy as sa


revision = "20260425_0009"
down_revision = "20260406_0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "product_images",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("url", sa.String(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_primary", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("product_id", "url", name="uq_product_images_product_url"),
    )
    op.create_index(
        op.f("ix_product_images_id"),
        "product_images",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_product_images_product_id"),
        "product_images",
        ["product_id"],
        unique=False,
    )

    op.execute(
        sa.text(
            """
            INSERT INTO product_images (product_id, url, position, is_primary, created_at)
            SELECT p.id, p.image_url, 0, true, CURRENT_TIMESTAMP
            FROM products p
            WHERE p.image_url IS NOT NULL
              AND TRIM(p.image_url) <> ''
              AND NOT EXISTS (
                SELECT 1
                FROM product_images pi
                WHERE pi.product_id = p.id
                  AND pi.url = p.image_url
              )
            """
        )
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_product_images_product_id"), table_name="product_images")
    op.drop_index(op.f("ix_product_images_id"), table_name="product_images")
    op.drop_table("product_images")
