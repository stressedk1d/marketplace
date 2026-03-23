"""
Сидирование демо-товаров коллекции Recrent (локальные картинки из frontend/public/images/products).
"""

from sqlalchemy.orm import Session

import models

# Первый товар — маркер: если уже есть, повторно не добавляем.
MARKER_PRODUCT_NAME = 'Recrent — Худи «Akumu» (белый)'

CATEGORY_NAME = "Мерч Recrent"

# name, description, price (₽), filename в public/images/products/
RECRENT_PRODUCTS: list[tuple[str, str, float, str]] = [
    (
        'Recrent — Худи «Akumu» (белый)',
        "Оверсайз худи с принтом «悪夢» на груди и змеей на рукаве. Утеплённый хлопок, уличный стиль.",
        6490.0,
        "rekrent-hoodie-white.png",
    ),
    (
        'Recrent — Худи «Akumu» (чёрный)',
        "Чёрное худи с тем же принтом «悪夢» и крупной змеёй на рукаве. Оверсайз посадка.",
        6490.0,
        "rekrent-hoodie-black.png",
    ),
    (
        "Recrent — Цепочка с логотипом",
        "Металлическая цепь с подвеской в стиле логотипа Recrent. Унисекс.",
        2490.0,
        "rekrent-necklace.png",
    ),
    (
        "Recrent — Нарукавники топографические (чёрные)",
        "Чёрные компрессионные нарукавники с топографическим принтом и техно-деталями.",
        1990.0,
        "rekrent-sleeves-black.png",
    ),
    (
        "Recrent — Нарукавники топографические (белые)",
        "Белые нарукавники с чёрно-серым топографическим рисунком.",
        1990.0,
        "rekrent-sleeves-white.png",
    ),
    (
        'Recrent — Футболка «Dragon» (белая)',
        "Оверсайз футболка с линейным артом драконов и надписью ドラゴン.",
        3490.0,
        "rekrent-tee-dragon-white.png",
    ),
    (
        'Recrent — Футболка «Dragon» (чёрная)',
        "Чёрная футболка с белым линейным принтом драконов, дроп-плечи.",
        3490.0,
        "rekrent-tee-dragon-black.png",
    ),
    (
        "Recrent — Футболка с логотипом (чёрная)",
        "Минималистичная чёрная футболка с оранжевым логотипом на груди.",
        2990.0,
        "rekrent-tee-logo-black.png",
    ),
    (
        "Recrent — Футболка с логотипом (белая)",
        "Белая оверсайз футболка с красным логотипом Recrent.",
        2990.0,
        "rekrent-tee-logo-white.png",
    ),
]


def seed_recrent_catalog(db: Session) -> None:
    """Добавляет товары Recrent один раз (по маркерному названию)."""
    existing = db.query(models.Product).filter(models.Product.name == MARKER_PRODUCT_NAME).first()
    if existing:
        return

    category = db.query(models.Category).filter(models.Category.name == CATEGORY_NAME).first()
    if not category:
        category = models.Category(name=CATEGORY_NAME)
        db.add(category)
        db.commit()
        db.refresh(category)

    for name, description, price, filename in RECRENT_PRODUCTS:
        db.add(
            models.Product(
                name=name,
                description=description,
                price=price,
                category_id=category.id,
                image_url=f"/images/products/{filename}",
                image_embedding=None,
            )
        )
    db.commit()
    print(f"[DB] Seeded {len(RECRENT_PRODUCTS)} Recrent demo products.")
