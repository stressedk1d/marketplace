"""brand.is_celebrity, celebrity catalog split, Nike/Adidas demo images

Revision ID: 20260405_0006
Revises: 20260405_0005
Create Date: 2026-04-05
"""

from alembic import op
import sqlalchemy as sa


revision = "20260405_0006"
down_revision = "20260405_0005"
branch_labels = None
depends_on = None


def _reassign_demo_images(connection: sa.Connection) -> None:
    slug_prefixes = [
        ("nike-summer-2025", "nike", 4),
        ("adidas-originals", "adidas", 4),
        ("travis-scott-nike", "collab", 4),
    ]
    for coll_slug, prefix, mod in slug_prefixes:
        col_id = connection.execute(
            sa.text("SELECT id FROM collections WHERE slug = :s"),
            {"s": coll_slug},
        ).scalar()
        if col_id is None:
            continue
        rows = connection.execute(
            sa.text(
                "SELECT id FROM products WHERE collection_id = :cid ORDER BY id ASC"
            ),
            {"cid": col_id},
        ).fetchall()
        for i, (pid,) in enumerate(rows):
            n = (i % mod) + 1
            url = f"/images/catalog-demo/{prefix}-{n:02d}.svg"
            connection.execute(
                sa.text("UPDATE products SET image_url = :u WHERE id = :id"),
                {"u": url, "id": pid},
            )


def upgrade() -> None:
    op.add_column(
        "brands",
        sa.Column(
            "is_celebrity",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
    connection = op.get_bind()
    connection.execute(
        sa.text("UPDATE brands SET is_celebrity = :v WHERE slug = 'recrent'"),
        {"v": True},
    )
    op.execute(
        sa.text(
            "UPDATE categories SET name = 'Знаменитости' WHERE name = 'Мерч Recrent'"
        )
    )

    _reassign_demo_images(connection)


def downgrade() -> None:
    op.drop_column("brands", "is_celebrity")
