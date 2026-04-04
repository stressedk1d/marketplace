"""brands, collections, product brand_id/collection_id + Recrent backfill

Revision ID: 20260405_0005
Revises: 20260404_0004
Create Date: 2026-04-05
"""

from alembic import op
import sqlalchemy as sa


revision = "20260405_0005"
down_revision = "20260404_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "brands",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("logo_url", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index(op.f("ix_brands_id"), "brands", ["id"], unique=False)
    op.create_index(op.f("ix_brands_name"), "brands", ["name"], unique=False)
    op.create_index(op.f("ix_brands_slug"), "brands", ["slug"], unique=False)

    op.create_table(
        "collections",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("brand_id", sa.Integer(), nullable=True),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["brand_id"], ["brands.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index(op.f("ix_collections_id"), "collections", ["id"], unique=False)
    op.create_index(op.f("ix_collections_slug"), "collections", ["slug"], unique=False)
    op.create_index(
        op.f("ix_collections_brand_id"), "collections", ["brand_id"], unique=False
    )

    with op.batch_alter_table("products") as batch_op:
        batch_op.add_column(sa.Column("brand_id", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("collection_id", sa.Integer(), nullable=True))
        batch_op.create_foreign_key("fk_products_brand_id", "brands", ["brand_id"], ["id"])
        batch_op.create_foreign_key(
            "fk_products_collection_id", "collections", ["collection_id"], ["id"]
        )

    conn = op.get_bind()

    conn.execute(
        sa.text(
            """
            INSERT INTO brands (name, slug, logo_url) VALUES
            ('Nike', 'nike', NULL),
            ('Adidas', 'adidas', NULL),
            ('Recrent', 'recrent', '/images/celebrities/recrent.jpg')
            """
        )
    )

    nike_id = conn.execute(sa.text("SELECT id FROM brands WHERE slug = 'nike'")).scalar()
    adidas_id = conn.execute(sa.text("SELECT id FROM brands WHERE slug = 'adidas'")).scalar()
    recrent_bid = conn.execute(
        sa.text("SELECT id FROM brands WHERE slug = 'recrent'")
    ).scalar()

    conn.execute(
        sa.text(
            """
            INSERT INTO collections (name, slug, description, brand_id, is_featured) VALUES
            (:n1, 'nike-summer-2025', 'Лёгкая летняя коллекция: сетки, дышащие материалы.', :nike, 1),
            (:a1, 'adidas-originals', 'Классические силуэты Adidas Originals.', :adidas, 1),
            (:r1, 'recrent', 'Официальный мерч и streetwear Recrent.', :recrent, 1),
            (:t1, 'travis-scott-nike', 'Коллаборация Travis Scott x Nike — демо-линейка.', :nike, 1)
            """
        ),
        {
            "n1": "Nike Summer 2025",
            "a1": "Adidas Originals",
            "r1": "Recrent",
            "t1": "Travis Scott x Nike",
            "nike": nike_id,
            "adidas": adidas_id,
            "recrent": recrent_bid,
        },
    )

    conn.execute(
        sa.text(
            """
            UPDATE products
            SET brand_id = (SELECT id FROM brands WHERE slug = 'recrent'),
                collection_id = (SELECT id FROM collections WHERE slug = 'recrent')
            WHERE category_id IN (
                SELECT id FROM categories WHERE name = 'Мерч Recrent'
            )
            """
        )
    )


def downgrade() -> None:
    with op.batch_alter_table("products") as batch_op:
        batch_op.drop_constraint("fk_products_collection_id", type_="foreignkey")
        batch_op.drop_constraint("fk_products_brand_id", type_="foreignkey")
        batch_op.drop_column("collection_id")
        batch_op.drop_column("brand_id")

    op.drop_index(op.f("ix_collections_brand_id"), table_name="collections")
    op.drop_index(op.f("ix_collections_slug"), table_name="collections")
    op.drop_index(op.f("ix_collections_id"), table_name="collections")
    op.drop_table("collections")

    op.drop_index(op.f("ix_brands_slug"), table_name="brands")
    op.drop_index(op.f("ix_brands_name"), table_name="brands")
    op.drop_index(op.f("ix_brands_id"), table_name="brands")
    op.drop_table("brands")
