"""reviews table

Revision ID: 20260529_0014
Revises: 20260425_0013
Create Date: 2026-05-29
"""

from alembic import op
import sqlalchemy as sa


revision = "20260529_0014"
down_revision = "20260425_0013"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "reviews",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("text", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "product_id", name="uq_review_user_product"),
    )
    op.create_index(op.f("ix_reviews_id"), "reviews", ["id"], unique=False)
    op.create_index(op.f("ix_reviews_user_id"), "reviews", ["user_id"], unique=False)
    op.create_index(
        op.f("ix_reviews_product_id"), "reviews", ["product_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_reviews_product_id"), table_name="reviews")
    op.drop_index(op.f("ix_reviews_user_id"), table_name="reviews")
    op.drop_index(op.f("ix_reviews_id"), table_name="reviews")
    op.drop_table("reviews")
