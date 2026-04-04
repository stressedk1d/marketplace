"""Rename/merge celebrity category to Celebrities; Travis collab → that category

Revision ID: 20260407_0008
Revises: 20260406_0007
Create Date: 2026-04-07
"""

from alembic import op
import sqlalchemy as sa


revision = "20260407_0008"
down_revision = "20260406_0007"
branch_labels = None
depends_on = None

# Старое имя категории (UTF-8 в исходнике)
_LEGACY_CELEB_RU = "Знаменитости"


def upgrade() -> None:
    conn = op.get_bind()
    zid = conn.execute(
        sa.text("SELECT id FROM categories WHERE name = :n"),
        {"n": _LEGACY_CELEB_RU},
    ).scalar()
    cid = conn.execute(
        sa.text("SELECT id FROM categories WHERE name = :n"),
        {"n": "Celebrities"},
    ).scalar()

    if zid is not None and cid is not None and zid != cid:
        conn.execute(
            sa.text("UPDATE products SET category_id = :c WHERE category_id = :z"),
            {"c": cid, "z": zid},
        )
        conn.execute(sa.text("DELETE FROM categories WHERE id = :z"), {"z": zid})
    elif zid is not None and cid is None:
        conn.execute(
            sa.text("UPDATE categories SET name = 'Celebrities' WHERE id = :z"),
            {"z": zid},
        )

    celeb_id = conn.execute(
        sa.text("SELECT id FROM categories WHERE name = 'Celebrities' LIMIT 1")
    ).scalar()
    if celeb_id is not None:
        conn.execute(
            sa.text(
                """
                UPDATE products
                SET category_id = :cid
                WHERE collection_id IN (
                    SELECT id FROM collections WHERE slug = 'travis-scott-nike'
                )
                """
            ),
            {"cid": celeb_id},
        )


def downgrade() -> None:
    conn = op.get_bind()
    eid = conn.execute(
        sa.text("SELECT id FROM categories WHERE name = :n"),
        {"n": "Celebrities"},
    ).scalar()
    if eid is not None:
        conn.execute(
            sa.text("UPDATE categories SET name = :n WHERE id = :id"),
            {"n": _LEGACY_CELEB_RU, "id": eid},
        )
