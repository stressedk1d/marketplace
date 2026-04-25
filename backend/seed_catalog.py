"""
Демо-каталог: бренды (Nike, Adidas, Puma, UA, New Balance, Converse),
знаменитости (Recrent, Kanye, Rihanna, Drake, Billie Eilish), коллекции и товары.
Категории: Celebrities — мерч знаменитостей и коллабы; Sports — New Balance;
Streetwear — Converse; «Спорт и streetwear» — Nike/Adidas/Puma/UA.
"""

import os
from typing import Optional

from sqlalchemy.orm import Session

import models

MARKER_RECRENT = 'Recrent — Худи «Akumu» (белый)'
MARKER_NIKE_DEMO = "Nike Air Zoom Pegasus 41 — демо Summer 2025"
MARKER_PUMA = "Puma RS-X — демо Essential"
MARKER_UA = "UA HOVR Phantom — демо"
MARKER_NEW_BALANCE = "New Balance Fresh Foam 1080 — демо"
MARKER_CONVERSE = "Converse Chuck 70 — демо High"
MARKER_BILLIE = "Billie Eilish — демо Oversized Tee"

CATEGORY_CELEBRITIES = "Celebrities"
CATEGORY_SPORT = "Спорт и streetwear"
CATEGORY_SPORTS = "Sports"
CATEGORY_STREETWEAR = "Streetwear"

NIKE_DEMO_IMAGES = [f"/images/catalog-demo/nike-{i:02d}.svg" for i in range(1, 5)]
ADIDAS_DEMO_IMAGES = [f"/images/catalog-demo/adidas-{i:02d}.svg" for i in range(1, 5)]
PUMA_DEMO_IMAGES = [f"/images/catalog-demo/puma-{i:02d}.svg" for i in range(1, 5)]
UA_DEMO_IMAGES = [f"/images/catalog-demo/ua-{i:02d}.svg" for i in range(1, 5)]
COLLAB_DEMO_IMAGES = [f"/images/catalog-demo/collab-{i:02d}.svg" for i in range(1, 5)]
NB_DEMO_IMAGES = [f"/images/catalog-demo/nb-{i:02d}.svg" for i in range(1, 5)]
CONVERSE_DEMO_IMAGES = [f"/images/catalog-demo/converse-{i:02d}.svg" for i in range(1, 5)]

RECRENT_PRODUCTS: list[tuple[str, str, float, str]] = [
    (
        'Recrent — Худи «Akumu» (белый)',
        "Оверсайз худи с принтом «悪夢» на груди и змеей на рукаве. Утеплённый хлопок, уличный стиль.",
        6490.0,
        "/images/celebrities/recrent/recrent-hoodie-white/recrent-hoodie-white.png",
    ),
    (
        'Recrent — Худи «Akumu» (чёрный)',
        "Чёрное худи с тем же принтом «悪夢» и крупной змеёй на рукаве. Оверсайз посадка.",
        6490.0,
        "/images/celebrities/recrent/recrent-hoodie-black/recrent-hoodie-black.png",
    ),
    (
        "Recrent — Цепочка с логотипом",
        "Металлическая цепь с подвеской в стиле логотипа Recrent. Унисекс.",
        2490.0,
        "/images/celebrities/recrent/recrent-necklace/recrent-necklace.png",
    ),
    (
        "Recrent — Нарукавники топографические (чёрные)",
        "Чёрные компрессионные нарукавники с топографическим принтом и техно-деталями.",
        1990.0,
        "/images/celebrities/recrent/recrent-sleeves-black/recrent-sleeves-black.png",
    ),
    (
        "Recrent — Нарукавники топографические (белые)",
        "Белые нарукавники с чёрно-серым топографическим рисунком.",
        1990.0,
        "/images/celebrities/recrent/recrent-sleeves-white/recrent-sleeves-white.png",
    ),
    (
        'Recrent — Футболка «Dragon» (белая)',
        "Оверсайз футболка с линейным артом драконов и надписью ドラゴン.",
        3490.0,
        "/images/celebrities/recrent/recrent-tee-dragon-white/recrent-tee-dragon-white.png",
    ),
    (
        'Recrent — Футболка «Dragon» (чёрная)',
        "Чёрная футболка с белым линейным принтом драконов, дроп-плечи.",
        3490.0,
        "/images/celebrities/recrent/recrent-tee-dragon-black/recrent-tee-dragon-black.png",
    ),
    (
        "Recrent — Футболка с логотипом (чёрная)",
        "Минималистичная чёрная футболка с оранжевым логотипом на груди.",
        2990.0,
        "/images/celebrities/recrent/recrent-tee-logo-black/recrent-tee-logo-black.png",
    ),
    (
        "Recrent — Футболка с логотипом (белая)",
        "Белая оверсайз футболка с красным логотипом Recrent.",
        2990.0,
        "/images/celebrities/recrent/recrent-tee-logo-white/recrent-tee-logo-white.png",
    ),
]

RECRENT_IMAGE_SETS: dict[str, list[str]] = {
    "Recrent — Худи «Akumu» (белый)": [
        "/images/celebrities/recrent/recrent-hoodie-white/recrent-hoodie-white.png",
    ],
    "Recrent — Худи «Akumu» (чёрный)": [
        "/images/celebrities/recrent/recrent-hoodie-black/recrent-hoodie-black.png",
    ],
    "Recrent — Цепочка с логотипом": [
        "/images/celebrities/recrent/recrent-necklace/recrent-necklace.png",
    ],
    "Recrent — Нарукавники топографические (чёрные)": [
        "/images/celebrities/recrent/recrent-sleeves-black/recrent-sleeves-black.png",
    ],
    "Recrent — Нарукавники топографические (белые)": [
        "/images/celebrities/recrent/recrent-sleeves-white/recrent-sleeves-white.png",
    ],
    "Recrent — Футболка «Dragon» (белая)": [
        "/images/celebrities/recrent/recrent-tee-dragon-white/recrent-tee-dragon-white.png",
    ],
    "Recrent — Футболка «Dragon» (чёрная)": [
        "/images/celebrities/recrent/recrent-tee-dragon-black/recrent-tee-dragon-black.png",
    ],
    "Recrent — Футболка с логотипом (чёрная)": [
        "/images/celebrities/recrent/recrent-tee-logo-black/recrent-tee-logo-black.png",
    ],
    "Recrent — Футболка с логотипом (белая)": [
        "/images/celebrities/recrent/recrent-tee-logo-white/recrent-tee-logo-white.png",
    ],
}

NIKE_SUMMER: list[tuple[str, str, float]] = [
    ("Nike Air Zoom Pegasus 41 — демо Summer 2025", "Ежедневные пробежки и город. Амортизация ReactX.", 12990.0),
    ("Nike Dri-FIT Miler Top", "Лёгкая майка с отводом влаги для тренировок.", 3490.0),
    ("Nike Challenger Shorts 7\"", "Универсальные шорты для бега и зала.", 4490.0),
    ("Nike Revolution 7", "Стартовая беговая модель, мягкая подошва.", 7990.0),
    ("Nike Club Fleece Hoodie", "Классическое худи на флисе.", 8990.0),
    ("Nike Sportswear Windrunner", "Ветровка с капюшоном, демо расцветка.", 10990.0),
    ("Nike One Leggings", "Легинсы средней посадки для фитнеса.", 5990.0),
    ("Nike Brasilia Duffel", "Спортивная сумка 41 л.", 4990.0),
    ("Nike Everyday Cushioned Crew", "Набор носков (3 пары).", 1490.0),
    ("Nike Heritage Waistpack", "Поясная сумка для города.", 2990.0),
    ("Nike Victori One Slide", "Шлёпанцы после тренировки.", 2490.0),
    ("Nike Charge Backpack", "Рюкзак с отделением для ноутбука.", 6990.0),
]

ADIDAS_ORIGINALS: list[tuple[str, str, float]] = [
    ("Adidas Samba OG — демо", "Классический силуэт Samba, замша и кожа.", 11990.0),
    ("Adidas Gazelle Indoor", "Винтажный раннер, контрастные полоски.", 10990.0),
    ("Adidas Superstar Foundation", "Белый корпус, чёрный носок.", 9990.0),
    ("Adidas Adicolor Track Top", "Олимпийка трёхполоска.", 8490.0),
    ("Adidas Trefoil Tee", "Футболка с логотипом Trefoil.", 2990.0),
    ("Adidas Adicolor SST Pants", "Спортивные брюки с лампасами.", 7490.0),
    ("Adidas Forum Low", "Баскетбольный лайфстайл, ремешок на щиколотке.", 11490.0),
    ("Adidas Stan Smith", "Минималистичные кеды, демо-коллекция.", 9490.0),
    ("Adidas Racer TR23", "Беговые кроссовки на каждый день.", 6990.0),
    ("Adidas Classic Backpack", "Рюкзак с тремя полосками.", 5490.0),
    ("Adidas Aeroready Cap", "Кепка с сеткой.", 1990.0),
    ("Adidas Essentials Fleece Hoodie", "Тёплое худи Essentials.", 7990.0),
    ("Adidas Tiro Training Pants", "Тренировочные штаны Tiro.", 6490.0),
    ("Adidas Ultraboost Light — демо", "Кроссовки с Boost для длинных пробежек.", 16990.0),
    ("Adidas Adilette Comfort", "Шлёпанцы Adilette.", 2290.0),
]

ADIDAS_IMAGE_SETS: dict[str, list[str]] = {
    "Adidas Gazelle Indoor": [
        "/images/brands/adidas/Adidas Gazelle Indoor.webp",
        "/images/brands/adidas/Adidas Gazelle Indoor1.webp",
        "/images/brands/adidas/Adidas Gazelle Indoor2.webp",
        "/images/brands/adidas/Adidas Gazelle Indoor3.webp",
        "/images/brands/adidas/Adidas Gazelle Indoor4.webp",
    ],
    "Adidas Adicolor Track Top": [
        "/images/brands/adidas/Adidas Adicolor Track Top.webp",
        "/images/brands/adidas/Adidas Adicolor Track Top1.webp",
        "/images/brands/adidas/Adidas Adicolor Track Top2.webp",
        "/images/brands/adidas/Adidas Adicolor Track Top3.webp",
    ],
    "Adidas Adicolor SST Pants": [
        "/images/brands/adidas/Adidas Adicolor SST Pants.jpg",
        "/images/brands/adidas/Adidas Adicolor SST Pants1.jpg",
        "/images/brands/adidas/Adidas Adicolor SST Pants2.jpg",
        "/images/brands/adidas/Adidas Adicolor SST Pants3.jpg",
    ],
    "Adidas Forum Low": [
        "/images/brands/adidas/Adidas Forum Low.webp",
        "/images/brands/adidas/Adidas Forum Low1.webp",
        "/images/brands/adidas/Adidas Forum Low2.webp",
        "/images/brands/adidas/Adidas Forum Low3.webp",
    ],
    "Adidas Racer TR23": [
        "/images/brands/adidas/Adidas Racer TR23.webp",
        "/images/brands/adidas/Adidas Racer TR231.webp",
        "/images/brands/adidas/Adidas Racer TR232.webp",
        "/images/brands/adidas/Adidas Racer TR233.webp",
        "/images/brands/adidas/Adidas Racer TR234.webp",
    ],
    "Adidas Classic Backpack": [
        "/images/brands/adidas/Adidas Classic Backpack.webp",
        "/images/brands/adidas/Adidas Classic Backpack1.webp",
        "/images/brands/adidas/Adidas Classic Backpack2.webp",
        "/images/brands/adidas/Adidas Classic Backpack3.webp",
        "/images/brands/adidas/Adidas Classic Backpack4.webp",
        "/images/brands/adidas/Adidas Classic Backpack5.webp",
    ],
    "Adidas Aeroready Cap": [
        "/images/brands/adidas/Adidas Aeroready Cap.webp",
        "/images/brands/adidas/Adidas Aeroready Cap2.webp",
        "/images/brands/adidas/Adidas Aeroready Cap3.webp",
        "/images/brands/adidas/Adidas Aeroready Cap4.webp",
    ],
    "Adidas Essentials Fleece Hoodie": [
        "/images/brands/adidas/Adidas Essentials Fleece Hoodie.webp",
        "/images/brands/adidas/Adidas Essentials Fleece Hoodie1.webp",
        "/images/brands/adidas/Adidas Essentials Fleece Hoodie2.webp",
        "/images/brands/adidas/Adidas Essentials Fleece Hoodie3.webp",
        "/images/brands/adidas/Adidas Essentials Fleece Hoodie4.webp",
    ],
    "Adidas Adilette Comfort": [
        "/images/brands/adidas/Adidas Adilette Comfort.webp",
        "/images/brands/adidas/Adidas Adilette Comfort1.webp",
        "/images/brands/adidas/Adidas Adilette Comfort2.webp",
        "/images/brands/adidas/Adidas Adilette Comfort3.webp",
        "/images/brands/adidas/Adidas Adilette Comfort4.webp",
        "/images/brands/adidas/Adidas Adilette Comfort5.webp",
    ],
}

CONVERSE_IMAGE_SETS: dict[str, list[str]] = {
    "Converse Chuck 70 — демо High": [
        "/images/brands/converse/Converse Chuck 701.webp",
        "/images/brands/converse/Converse Chuck 702.webp",
        "/images/brands/converse/Converse Chuck 703.webp",
        "/images/brands/converse/Converse Chuck 704.webp",
        "/images/brands/converse/Converse Chuck 705.webp",
    ],
    "Converse One Star Pro": [
        "/images/brands/converse/Converse One Star Pro.webp",
        "/images/brands/converse/Converse One Star Pro2.webp",
    ],
    "Converse Run Star Hike": [
        "/images/brands/converse/Converse Run Star Hike.webp",
        "/images/brands/converse/Converse Run Star Hike1.webp",
        "/images/brands/converse/Converse Run Star Hike2.webp",
        "/images/brands/converse/Converse Run Star Hike3.webp",
    ],
    "Converse Graphic Hoodie": [
        "/images/brands/converse/Converse Graphic Hoodie.webp",
        "/images/brands/converse/Converse Graphic Hoodie1.webp",
        "/images/brands/converse/Converse Graphic Hoodie2.webp",
    ],
    "Converse Tote — демо": [
        "/images/brands/converse/Converse Tote.webp",
        "/images/brands/converse/Converse Tote1.webp",
        "/images/brands/converse/Converse Tote2.webp",
    ],
    "Converse Beanie": [
        "/images/brands/converse/Converse Beanie.webp",
        "/images/brands/converse/Converse Beanie1.webp",
        "/images/brands/converse/Converse Beanie2.webp",
    ],
}

NEW_BALANCE_IMAGE_SETS: dict[str, list[str]] = {
    "New Balance 574 Core": [
        "/images/brands/new_balance/New Balance 574 Core.webp",
        "/images/brands/new_balance/New Balance 574 Core1.webp",
    ],
    "New Balance FuelCell Rebel v4": [
        "/images/brands/new_balance/New Balance FuelCell Rebel v4.webp",
        "/images/brands/new_balance/New Balance FuelCell Rebel v41.webp",
        "/images/brands/new_balance/New Balance FuelCell Rebel v42.webp",
    ],
    "New Balance Impact Run Short": [
        "/images/brands/new_balance/New Balance Impact Run Short.webp",
        "/images/brands/new_balance/New Balance Impact Run Short1.webp",
        "/images/brands/new_balance/New Balance Impact Run Short2.webp",
        "/images/brands/new_balance/New Balance Impact Run Short3.webp",
    ],
    "New Balance Q Speed Jacquard Tee": [
        "/images/brands/new_balance/New Balance Q Speed Jacquard Tee.webp",
        "/images/brands/new_balance/New Balance Q Speed Jacquard Tee1.webp",
        "/images/brands/new_balance/New Balance Q Speed Jacquard Tee2.webp",
        "/images/brands/new_balance/New Balance Q Speed Jacquard Tee3.webp",
        "/images/brands/new_balance/New Balance Q Speed Jacquard Tee4.webp",
    ],
    "New Balance Heat Grid Half Zip": [
        "/images/brands/new_balance/New Balance Heat Grid Half Zip.webp",
        "/images/brands/new_balance/New Balance Heat Grid Half Zip1.webp",
        "/images/brands/new_balance/New Balance Heat Grid Half Zip2.webp",
        "/images/brands/new_balance/New Balance Heat Grid Half Zip3.webp",
    ],
    "New Balance Running Cap": [
        "/images/brands/new_balance/New Balance Running Cap.webp",
        "/images/brands/new_balance/New Balance Running Cap1.webp",
        "/images/brands/new_balance/New Balance Running Cap3.webp",
        "/images/brands/new_balance/New Balance Running Cap4.webp",
    ],
    "New Balance Essentials Backpack": [
        "/images/brands/new_balance/New Balance Essentials Backpack.webp",
        "/images/brands/new_balance/New Balance Essentials Backpack1.webp",
        "/images/brands/new_balance/New Balance Essentials Backpack2.webp",
        "/images/brands/new_balance/New Balance Essentials Backpack3.webp",
    ],
}

NIKE_IMAGE_SETS: dict[str, list[str]] = {
    "Nike Air Zoom Pegasus 41 — демо Summer 2025": [
        "/images/brands/nike/Nike Air Zoom Pegasus 41.webp",
        "/images/brands/nike/Nike Air Zoom Pegasus 411.webp",
        "/images/brands/nike/Nike Air Zoom Pegasus 412.webp",
        "/images/brands/nike/Nike Air Zoom Pegasus 413.webp",
        "/images/brands/nike/Nike Air Zoom Pegasus 414.webp",
    ],
    "Nike Dri-FIT Miler Top": [
        "/images/brands/nike/Nike Dri-FIT Miler Top.webp",
        "/images/brands/nike/Nike Dri-FIT Miler Top1.webp",
        "/images/brands/nike/Nike Dri-FIT Miler Top2.webp",
        "/images/brands/nike/Nike Dri-FIT Miler Top3.webp",
    ],
    "Nike Challenger Shorts 7\"": [
        "/images/brands/nike/Nike Challenger Shorts 7.webp",
        "/images/brands/nike/Nike Challenger Shorts 71.webp",
        "/images/brands/nike/Nike Challenger Shorts 72.webp",
        "/images/brands/nike/Nike Challenger Shorts 73.webp",
        "/images/brands/nike/Nike Challenger Shorts 74.webp",
    ],
    "Nike Club Fleece Hoodie": [
        "/images/brands/nike/Nike Club Fleece Hoodie.webp",
        "/images/brands/nike/Nike Club Fleece Hoodie1.webp",
        "/images/brands/nike/Nike Club Fleece Hoodie2.webp",
        "/images/brands/nike/Nike Club Fleece Hoodie3.webp",
    ],
    "Nike Brasilia Duffel": [
        "/images/brands/nike/Nike Brasilia Duffel.webp",
        "/images/brands/nike/Nike Brasilia Duffel1.webp",
        "/images/brands/nike/Nike Brasilia Duffel2.webp",
        "/images/brands/nike/Nike Brasilia Duffel3.webp",
    ],
    "Nike Charge Backpack": [
        "/images/brands/nike/Nike Charge Backpack.webp",
        "/images/brands/nike/Nike Charge Backpack1.webp",
        "/images/brands/nike/Nike Charge Backpack2.webp",
        "/images/brands/nike/Nike Charge Backpack3.webp",
        "/images/brands/nike/Nike Charge Backpack4.webp",
        "/images/brands/nike/Nike Charge Backpack5.webp",
    ],
}

PUMA_LINE: list[tuple[str, str, float]] = [
    ("Puma RS-X — демо Essential", "Объёмный силуэт RS-X, демо-расцветка.", 9990.0),
    ("Puma Suede Classic", "Замшевые кеды, вечная классика.", 7990.0),
    ("Puma Velocity Nitro 3", "Беговые кроссовки с Nitro пеной.", 11990.0),
    ("Puma Essentials Logo Tee", "Хлопковая футболка с логотипом.", 2490.0),
    ("Puma Power Tape Hoodie", "Худи с лампасами, демо.", 6990.0),
    ("Puma Challenger Duffel", "Спортивная сумка 40 л.", 4490.0),
    ("Puma Performance Cap", "Кепка с застёжкой.", 1990.0),
    ("Puma Evostripe Pants", "Джоггеры с боковыми полосками.", 5490.0),
]

UA_LINE: list[tuple[str, str, float]] = [
    ("UA HOVR Phantom — демо", "Амортизация HOVR для бега.", 12990.0),
    ("UA Tech 2.0 Short Sleeve", "Футболка Tech с отводом влаги.", 2990.0),
    ("UA Rival Fleece Hoodie", "Тёплое флисовое худи.", 6490.0),
    ("UA Armour Mid Crossback Bra", "Спортивный топ средней поддержки.", 3990.0),
    ("UA Undeniable 5.0 Backpack", "Рюкзак с вентиляцией.", 5990.0),
    ("UA Launch Run Hat", "Лёгкая беговая кепка.", 2490.0),
    ("UA Woven Vital Shorts", "Шорты из плотного тканя.", 3490.0),
    ("UA HeatGear Leggings", "Компрессионные легинсы.", 5490.0),
]


NEW_BALANCE_LINE: list[tuple[str, str, float]] = [
    ("New Balance Fresh Foam 1080 — демо", "Мягкая пена Fresh Foam для длинных пробежек.", 13990.0),
    ("New Balance 574 Core", "Классический силуэт 574, демо.", 8990.0),
    ("New Balance FuelCell Rebel v4", "Лёгкий темп для интервалов.", 12990.0),
    ("New Balance Impact Run Short", "Беговые шорты с карманом.", 3490.0),
    ("New Balance Q Speed Jacquard Tee", "Футболка с жаккардом, отвод влаги.", 3990.0),
    ("New Balance Heat Grid Half Zip", "Молния 1/2, демо-слой.", 6490.0),
    ("New Balance Running Cap", "Кепка с регулировкой.", 2290.0),
    ("New Balance Essentials Backpack", "Рюкзак для города и зала.", 5490.0),
]

CONVERSE_LINE: list[tuple[str, str, float]] = [
    ("Converse Chuck 70 — демо High", "Высокие Chuck 70, демо-капсула.", 8990.0),
    ("Converse One Star Pro", "Скейт-обувь, замша.", 7990.0),
    ("Converse Run Star Hike", "Платформа, демо.", 9990.0),
    ("Converse Cargo Pant — демо", "Карго в стиле streetwear.", 5990.0),
    ("Converse Graphic Hoodie", "Худи с графикой.", 5490.0),
    ("Converse Tote — демо", "Тканевая сумка.", 2990.0),
    ("Converse Beanie", "Шапка с отворотом.", 1990.0),
    ("Converse Crew Socks 3pk", "Носки, набор 3 пары.", 1490.0),
]

BILLIE_LINE: list[tuple[str, str, float]] = [
    ("Billie Eilish — демо Oversized Tee", "Оверсайз футболка, демо-капсула.", 4490.0),
    ("Billie x Nike — демо Shorts", "Шорты коллаба, демо.", 5490.0),
    ("Happier Than Ever — демо Hoodie", "Худи линейки, демо.", 7990.0),
    ("Billie Neon Logo Beanie", "Шапка с неоновым лого.", 2490.0),
    ("Billie Tour Tote — демо", "Сумка-тоут, демо.", 3590.0),
    ("Billie Sustainable Cap — демо", "Кепка, демо-материалы.", 2990.0),
]

BILLIE_IMAGE_SETS: dict[str, list[str]] = {
    "Billie Eilish — демо Oversized Tee": [
        "/images/celebrities/billie eilish/Billie Eilish Tee.webp",
    ],
    "Billie Neon Logo Beanie": [
        "/images/celebrities/billie eilish/Billie Neon Logo Beanie.webp",
    ],
    "Billie Tour Tote — демо": [
        "/images/celebrities/billie eilish/Billie Tour Tote.webp",
        "/images/celebrities/billie eilish/Billie Tour Tote1.webp",
        "/images/celebrities/billie eilish/Billie Tour Tote2.webp",
        "/images/celebrities/billie eilish/Billie Tour Tote3.webp",
    ],
    "Billie Sustainable Cap — демо": [
        "/images/celebrities/billie eilish/Billie Sustainable Cap.webp",
    ],
}


def _get_or_create_brand(
    db: Session,
    name: str,
    slug: str,
    logo_url: Optional[str],
    is_celebrity: bool,
) -> models.Brand:
    b = db.query(models.Brand).filter(models.Brand.slug == slug).first()
    if b:
        changed = False
        if b.name != name:
            b.name = name
            changed = True
        if b.logo_url != logo_url:
            b.logo_url = logo_url
            changed = True
        if b.is_celebrity != is_celebrity:
            b.is_celebrity = is_celebrity
            changed = True
        if changed:
            db.commit()
            db.refresh(b)
        return b
    b = models.Brand(
        name=name, slug=slug, logo_url=logo_url, is_celebrity=is_celebrity
    )
    db.add(b)
    db.commit()
    db.refresh(b)
    return b


def _get_or_create_collection(
    db: Session,
    name: str,
    slug: str,
    description: str,
    brand_id: int,
    is_featured: bool,
) -> models.Collection:
    c = db.query(models.Collection).filter(models.Collection.slug == slug).first()
    if c:
        return c
    c = models.Collection(
        name=name,
        slug=slug,
        description=description,
        brand_id=brand_id,
        is_featured=is_featured,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


def _sync_brands_and_collections(db: Session) -> dict[str, models.Collection]:
    """Создаёт отсутствующие бренды и коллекции (идемпотентно по slug)."""
    brand_specs: list[tuple[str, str, Optional[str], bool]] = [
        ("Nike", "nike", "/images/brands/nike/Logo_NIKE.svg.png", False),
        ("Adidas", "adidas", "/images/brands/adidas/Original_Adidas_logo.svg", False),
        ("Recrent", "recrent", "/images/celebrities/recrent/recrent.jpg", True),
        ("New Balance", "new-balance", "/images/brands/new_balance/New_Balance_logo.svg", False),
        ("Converse", "converse", "/images/brands/converse/Converse_logo.svg", False),
        ("Billie Eilish", "billie-eilish", "/images/celebrities/billie eilish/Billie-Eilish-Logo.png", True),
    ]
    by_brand_slug: dict[str, models.Brand] = {}
    for name, slug, logo, is_c in brand_specs:
        by_brand_slug[slug] = _get_or_create_brand(db, name, slug, logo, is_c)

    collection_specs: list[tuple[str, str, str, str, bool]] = [
        (
            "Nike Summer 2025",
            "nike-summer-2025",
            "Лёгкая летняя коллекция Nike.",
            "nike",
            True,
        ),
        (
            "Adidas Originals",
            "adidas-originals",
            "Классика Adidas Originals.",
            "adidas",
            True,
        ),
        (
            "Recrent",
            "recrent",
            "Официальный мерч Recrent.",
            "recrent",
            True,
        ),
        (
            "New Balance Fresh Foam",
            "new-balance-fresh-foam",
            "Бег и повседневность New Balance.",
            "new-balance",
            True,
        ),
        (
            "Converse Chuck & Street",
            "converse-chuck-street",
            "Chuck 70 и streetwear Converse.",
            "converse",
            True,
        ),
        (
            "Billie Eilish Collab Demo",
            "billie-eilish-collab-demo",
            "Демо-капсула Billie Eilish.",
            "billie-eilish",
            True,
        ),
    ]
    by_col_slug: dict[str, models.Collection] = {}
    for name, slug, desc, bslug, feat in collection_specs:
        brand = by_brand_slug[bslug]
        by_col_slug[slug] = _get_or_create_collection(
            db, name, slug, desc, brand.id, feat
        )
    return by_col_slug


def _get_or_create_category(db: Session, name: str) -> models.Category:
    cat = db.query(models.Category).filter(models.Category.name == name).first()
    if not cat:
        cat = models.Category(name=name)
        db.add(cat)
        db.commit()
        db.refresh(cat)
    return cat


def _seed_product_block(
    db: Session,
    marker_name: str,
    rows: list[tuple[str, str, float]],
    category_id: int,
    brand: models.Brand | None,
    collection: models.Collection | None,
    images: list[str],
) -> None:
    if not collection or db.query(models.Product).filter(
        models.Product.name == marker_name
    ).first():
        return
    for i, (name, desc, price) in enumerate(rows):
        db.add(
            models.Product(
                name=name,
                description=desc,
                price=price,
                category_id=category_id,
                brand_id=brand.id if brand else None,
                collection_id=collection.id,
                image_url=images[i % len(images)],
                image_embedding=None,
            )
        )
    db.commit()
    print(f"[DB] Seeded {len(rows)} products ({marker_name}).")


def _sync_product_images(
    db: Session,
    image_sets: dict[str, list[str]],
) -> None:
    """Обновляет image_url у существующих товаров по имени (идемпотентно)."""
    updated = 0
    for product_name, images in image_sets.items():
        if not images:
            continue
        product = db.query(models.Product).filter(models.Product.name == product_name).first()
        if not product:
            continue
        main_image = images[0]
        if product.image_url != main_image:
            product.image_url = main_image
            updated += 1
    if updated:
        db.commit()
        print(f"[DB] Updated image_url for {updated} products.")


def _prune_brand_products_without_images(
    db: Session,
    brand_slug: str,
    product_names_with_images: set[str],
) -> None:
    """Удаляет товары бренда, для которых нет загруженных изображений."""
    brand = db.query(models.Brand).filter(models.Brand.slug == brand_slug).first()
    if not brand:
        return
    products = db.query(models.Product).filter(models.Product.brand_id == brand.id).all()
    to_delete = [p for p in products if p.name not in product_names_with_images]
    if not to_delete:
        return
    for product in to_delete:
        db.delete(product)
    db.commit()
    print(f"[DB] Removed {len(to_delete)} {brand_slug} products without images.")


def _dedupe_brand_products(
    db: Session,
    brand_slug: str,
    image_sets: dict[str, list[str]],
) -> None:
    """Оставляет по одному товару на имя в рамках бренда."""
    brand = db.query(models.Brand).filter(models.Brand.slug == brand_slug).first()
    if not brand:
        return

    products = db.query(models.Product).filter(models.Product.brand_id == brand.id).all()
    by_name: dict[str, list[models.Product]] = {}
    for product in products:
        by_name.setdefault(product.name, []).append(product)

    removed = 0
    for name, items in by_name.items():
        if len(items) < 2:
            continue

        preferred_image = (image_sets.get(name) or [None])[0]
        keep = next((p for p in items if p.image_url == preferred_image), items[0])

        for product in items:
            if product.id == keep.id:
                continue
            db.delete(product)
            removed += 1

    if removed:
        db.commit()
        print(f"[DB] Removed {removed} duplicate products for {brand_slug}.")


def _remove_collection_by_slug(db: Session, collection_slug: str) -> None:
    """Удаляет коллекцию и её товары, если она существует."""
    collection = (
        db.query(models.Collection).filter(models.Collection.slug == collection_slug).first()
    )
    if not collection:
        return
    products = db.query(models.Product).filter(models.Product.collection_id == collection.id).all()
    for product in products:
        db.delete(product)
    db.delete(collection)
    db.commit()
    print(
        f"[DB] Removed collection '{collection_slug}' and {len(products)} related products."
    )


def _remove_brand_by_slug(db: Session, brand_slug: str) -> None:
    """Удаляет бренд, его коллекции и товары, если он существует."""
    brand = db.query(models.Brand).filter(models.Brand.slug == brand_slug).first()
    if not brand:
        return

    products = db.query(models.Product).filter(models.Product.brand_id == brand.id).all()
    for product in products:
        db.delete(product)

    collections = db.query(models.Collection).filter(models.Collection.brand_id == brand.id).all()
    for collection in collections:
        db.delete(collection)

    db.delete(brand)
    db.commit()
    print(
        f"[DB] Removed brand '{brand_slug}' with {len(collections)} collections and {len(products)} products."
    )


def seed_catalog(db: Session) -> None:
    safe_mode = os.getenv("SEED_SAFE_MODE") == "1"
    collections = _sync_brands_and_collections(db)

    cat_celeb = _get_or_create_category(db, CATEGORY_CELEBRITIES)
    cat_sport = _get_or_create_category(db, CATEGORY_SPORT)
    cat_sports = _get_or_create_category(db, CATEGORY_SPORTS)
    cat_street = _get_or_create_category(db, CATEGORY_STREETWEAR)

    recrent_col = collections.get("recrent")
    recrent_brand = db.query(models.Brand).filter(models.Brand.slug == "recrent").first()

    if not db.query(models.Product).filter(models.Product.name == MARKER_RECRENT).first():
        if recrent_col and recrent_brand:
            for name, description, price, image_url in RECRENT_PRODUCTS:
                db.add(
                    models.Product(
                        name=name,
                        description=description,
                        price=price,
                        category_id=cat_celeb.id,
                        brand_id=recrent_brand.id,
                        collection_id=recrent_col.id,
                        image_url=image_url,
                        image_embedding=None,
                    )
                )
            db.commit()
            print(f"[DB] Seeded {len(RECRENT_PRODUCTS)} Recrent products.")

    nike_b = db.query(models.Brand).filter(models.Brand.slug == "nike").first()
    adidas_b = db.query(models.Brand).filter(models.Brand.slug == "adidas").first()
    nb_b = db.query(models.Brand).filter(models.Brand.slug == "new-balance").first()
    converse_b = db.query(models.Brand).filter(models.Brand.slug == "converse").first()
    billie_b = db.query(models.Brand).filter(models.Brand.slug == "billie-eilish").first()

    _seed_product_block(
        db,
        MARKER_NIKE_DEMO,
        NIKE_SUMMER,
        cat_sport.id,
        nike_b,
        collections.get("nike-summer-2025"),
        NIKE_DEMO_IMAGES,
    )
    _seed_product_block(
        db,
        "Adidas Samba OG — демо",
        ADIDAS_ORIGINALS,
        cat_sport.id,
        adidas_b,
        collections.get("adidas-originals"),
        ADIDAS_DEMO_IMAGES,
    )
    _seed_product_block(
        db,
        MARKER_NEW_BALANCE,
        NEW_BALANCE_LINE,
        cat_sports.id,
        nb_b,
        collections.get("new-balance-fresh-foam"),
        NB_DEMO_IMAGES,
    )
    _seed_product_block(
        db,
        MARKER_CONVERSE,
        CONVERSE_LINE,
        cat_street.id,
        converse_b,
        collections.get("converse-chuck-street"),
        CONVERSE_DEMO_IMAGES,
    )
    _seed_product_block(
        db,
        MARKER_BILLIE,
        BILLIE_LINE,
        cat_celeb.id,
        billie_b,
        collections.get("billie-eilish-collab-demo"),
        COLLAB_DEMO_IMAGES,
    )
    _sync_product_images(db, ADIDAS_IMAGE_SETS)
    _sync_product_images(db, CONVERSE_IMAGE_SETS)
    _sync_product_images(db, NEW_BALANCE_IMAGE_SETS)
    _sync_product_images(db, NIKE_IMAGE_SETS)
    _sync_product_images(db, RECRENT_IMAGE_SETS)
    _sync_product_images(db, BILLIE_IMAGE_SETS)

    if safe_mode:
        print("SAFE MODE: destructive operations skipped")
    else:
        _prune_brand_products_without_images(db, "adidas", set(ADIDAS_IMAGE_SETS.keys()))
        _prune_brand_products_without_images(db, "converse", set(CONVERSE_IMAGE_SETS.keys()))
        _prune_brand_products_without_images(db, "nike", set(NIKE_IMAGE_SETS.keys()))
        _prune_brand_products_without_images(
            db, "new-balance", set(NEW_BALANCE_IMAGE_SETS.keys())
        )
        _prune_brand_products_without_images(
            db, "billie-eilish", set(BILLIE_IMAGE_SETS.keys())
        )

    _dedupe_brand_products(db, "adidas", ADIDAS_IMAGE_SETS)
    _dedupe_brand_products(db, "converse", CONVERSE_IMAGE_SETS)
    _dedupe_brand_products(db, "nike", NIKE_IMAGE_SETS)
    _dedupe_brand_products(db, "new-balance", NEW_BALANCE_IMAGE_SETS)
    _dedupe_brand_products(db, "billie-eilish", BILLIE_IMAGE_SETS)
    if not safe_mode:
        _remove_collection_by_slug(db, "travis-scott-nike")
        _remove_brand_by_slug(db, "puma")
        _remove_brand_by_slug(db, "under-armour")
        _remove_brand_by_slug(db, "kanye-west")
        _remove_brand_by_slug(db, "rihanna")
        _remove_brand_by_slug(db, "drake")
