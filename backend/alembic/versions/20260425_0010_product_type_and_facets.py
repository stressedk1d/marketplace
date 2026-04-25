"""add product_type to products with backfill

Revision ID: 20260425_0010
Revises: 20260425_0009
Create Date: 2026-04-25
"""

from alembic import op
import sqlalchemy as sa


revision = "20260425_0010"
down_revision = "20260425_0009"
branch_labels = None
depends_on = None


PRODUCT_TYPE_CASE_SQL = """
CASE
    WHEN lower(name) LIKE '%hoodie%'
      OR lower(name) LIKE '%tee%'
      OR lower(name) LIKE '%t-shirt%'
      OR lower(name) LIKE '%футболк%'
      OR lower(name) LIKE '%худи%'
      OR lower(name) LIKE '%майк%'
      OR lower(name) LIKE '%куртк%'
      OR lower(name) LIKE '%ветровк%'
      OR lower(name) LIKE '%шорт%'
      OR lower(name) LIKE '%легинс%'
      OR lower(name) LIKE '%брюк%'
      OR lower(name) LIKE '%pants%'
      OR lower(name) LIKE '%leggings%'
      OR lower(description) LIKE '%hoodie%'
      OR lower(description) LIKE '%tee%'
      OR lower(description) LIKE '%t-shirt%'
      OR lower(description) LIKE '%футболк%'
      OR lower(description) LIKE '%худи%'
      OR lower(description) LIKE '%майк%'
      OR lower(description) LIKE '%куртк%'
      OR lower(description) LIKE '%ветровк%'
      OR lower(description) LIKE '%шорт%'
      OR lower(description) LIKE '%легинс%'
      OR lower(description) LIKE '%брюк%'
      OR lower(description) LIKE '%pants%'
      OR lower(description) LIKE '%leggings%'
    THEN 'clothing'

    WHEN lower(name) LIKE '%samba%'
      OR lower(name) LIKE '%gazelle%'
      OR lower(name) LIKE '%superstar%'
      OR lower(name) LIKE '%forum%'
      OR lower(name) LIKE '%stan smith%'
      OR lower(name) LIKE '%ultraboost%'
      OR lower(name) LIKE '%pegasus%'
      OR lower(name) LIKE '%revolution%'
      OR lower(name) LIKE '%victori%'
      OR lower(name) LIKE '%one star%'
      OR lower(name) LIKE '%run star%'
      OR lower(name) LIKE '%chuck%'
      OR lower(name) LIKE '%adilette%'
      OR lower(name) LIKE '%кед%'
      OR lower(name) LIKE '%кроссов%'
      OR lower(name) LIKE '%обув%'
      OR lower(name) LIKE '%runner%'
      OR lower(name) LIKE '%slide%'
      OR lower(description) LIKE '%samba%'
      OR lower(description) LIKE '%gazelle%'
      OR lower(description) LIKE '%superstar%'
      OR lower(description) LIKE '%forum%'
      OR lower(description) LIKE '%stan smith%'
      OR lower(description) LIKE '%ultraboost%'
      OR lower(description) LIKE '%pegasus%'
      OR lower(description) LIKE '%revolution%'
      OR lower(description) LIKE '%victori%'
      OR lower(description) LIKE '%one star%'
      OR lower(description) LIKE '%run star%'
      OR lower(description) LIKE '%chuck%'
      OR lower(description) LIKE '%adilette%'
      OR lower(description) LIKE '%кед%'
      OR lower(description) LIKE '%кроссов%'
      OR lower(description) LIKE '%обув%'
      OR lower(description) LIKE '%runner%'
      OR lower(description) LIKE '%slide%'
    THEN 'shoes'

    WHEN lower(name) LIKE '%backpack%'
      OR lower(name) LIKE '%bag%'
      OR lower(name) LIKE '%waistpack%'
      OR lower(name) LIKE '%cap%'
      OR lower(name) LIKE '%beanie%'
      OR lower(name) LIKE '%socks%'
      OR lower(name) LIKE '%tote%'
      OR lower(name) LIKE '%duffel%'
      OR lower(name) LIKE '%necklace%'
      OR lower(name) LIKE '%цепоч%'
      OR lower(name) LIKE '%рукавник%'
      OR lower(name) LIKE '%рюкзак%'
      OR lower(name) LIKE '%сумк%'
      OR lower(name) LIKE '%кепк%'
      OR lower(name) LIKE '%шапк%'
      OR lower(name) LIKE '%носк%'
      OR lower(description) LIKE '%backpack%'
      OR lower(description) LIKE '%bag%'
      OR lower(description) LIKE '%waistpack%'
      OR lower(description) LIKE '%cap%'
      OR lower(description) LIKE '%beanie%'
      OR lower(description) LIKE '%socks%'
      OR lower(description) LIKE '%tote%'
      OR lower(description) LIKE '%duffel%'
      OR lower(description) LIKE '%necklace%'
      OR lower(description) LIKE '%цепоч%'
      OR lower(description) LIKE '%рукавник%'
      OR lower(description) LIKE '%рюкзак%'
      OR lower(description) LIKE '%сумк%'
      OR lower(description) LIKE '%кепк%'
      OR lower(description) LIKE '%шапк%'
      OR lower(description) LIKE '%носк%'
    THEN 'accessories'

    ELSE 'clothing'
END
"""


def upgrade() -> None:
    with op.batch_alter_table("products") as batch_op:
        batch_op.add_column(
            sa.Column(
                "product_type",
                sa.Enum(
                    "clothing",
                    "shoes",
                    "accessories",
                    name="product_type_enum",
                    native_enum=False,
                    length=20,
                ),
                nullable=True,
            )
        )
        batch_op.create_index(op.f("ix_products_product_type"), ["product_type"], unique=False)

    op.execute(sa.text(f"UPDATE products SET product_type = {PRODUCT_TYPE_CASE_SQL}"))

    with op.batch_alter_table("products") as batch_op:
        batch_op.alter_column("product_type", nullable=False)


def downgrade() -> None:
    with op.batch_alter_table("products") as batch_op:
        batch_op.drop_index(op.f("ix_products_product_type"))
        batch_op.drop_column("product_type")
