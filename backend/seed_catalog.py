"""
Демо-каталог: бренды (Nike, Adidas, Puma, UA, New Balance, Converse),
знаменитости (Recrent, Kanye, Rihanna, Drake, Billie Eilish), коллекции и товары.
Категории: Celebrities — мерч знаменитостей и коллабы; Sports — New Balance;
Streetwear — Converse; «Спорт и streetwear» — Nike/Adidas/Puma/UA.
"""

from typing import Optional

from sqlalchemy.orm import Session

import models

MARKER_RECRENT = 'Recrent — Худи «Akumu» (белый)'
MARKER_NIKE_DEMO = "Nike Air Zoom Pegasus 41 — демо Summer 2025"
MARKER_PUMA = "Puma RS-X — демо Essential"
MARKER_UA = "UA HOVR Phantom — демо"
MARKER_KANYE = "YEEZY Foam Runner — демо Kanye West"
MARKER_RIHANNA = "Fenty x Puma — демо Creeper Rihanna"
MARKER_NEW_BALANCE = "New Balance Fresh Foam 1080 — демо"
MARKER_CONVERSE = "Converse Chuck 70 — демо High"
MARKER_DRAKE = "OVO Owl Hoodie — демо Drake"
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

TRAVIS_SCOTT: list[tuple[str, str, float]] = [
    ("Travis Scott x Nike — демо Hoodie", "Оверсайз худи, демо-капсула коллаба.", 18990.0),
    ("Travis Scott x Nike — Cargo Pants", "Карго с крупными карманами.", 15990.0),
    ("Travis Scott x Nike — Mesh Tee", "Сетчатая вставка, earth-tone.", 6990.0),
    ("Travis Scott x Nike — Cap", "Кепка с вышивкой Cactus Jack (демо).", 4990.0),
    ("Travis Scott x Nike — Socks Pack", "Набор носков, 3 пары.", 2490.0),
    ("Travis Scott x Nike — Windbreaker", "Ветровка с капюшоном.", 13990.0),
    ("Travis Scott x Nike — Shorts", "Шорты с логотипом коллаба.", 8990.0),
    ("Travis Scott x Nike — Tote Bag", "Тканевая сумка.", 3990.0),
]

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

KANYE_LINE: list[tuple[str, str, float]] = [
    ("YEEZY Foam Runner — демо Kanye West", "Демо-силуэт, earth tones.", 14990.0),
    ("YEEZY Slide — демо", "Шлёпанцы, минималистичный дизайн.", 8990.0),
    ("YEEZY Gap Round Jacket — демо", "Объёмная куртка, демо-капсула.", 24990.0),
    ("YEEZY Knit RNR — демо", "Трикотажный раннер.", 17990.0),
    ("YEEZY Calabasas Socks Pack", "Носки, набор 3 пары.", 2990.0),
    ("YEEZY Stem Player Case — демо", "Чехол-демо под аксессуар.", 4990.0),
]

RIHANNA_LINE: list[tuple[str, str, float]] = [
    ("Fenty x Puma — демо Creeper Rihanna", "Платформенные криперы, демо.", 13990.0),
    ("Fenty Beauty — демо Hoodie", "Худи капсулы Fenty, демо.", 9990.0),
    ("Savage X Fenty — демо Tee", "Футболка линейки Savage.", 3990.0),
    ("Fenty Sunglasses — демо", "Солнцезащитные очки, демо.", 7990.0),
    ("Fenty Slip Dress — демо", "Платье-комбинация, демо.", 12990.0),
    ("Fenty Chain Bag — демо", "Сумка на цепочке, демо.", 15990.0),
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

DRAKE_LINE: list[tuple[str, str, float]] = [
    ("OVO Owl Hoodie — демо Drake", "Худи с совой OVO, демо-мерч.", 11990.0),
    ("OVO October’s Very Own — демо Tee", "Футболка OVO, демо.", 4990.0),
    ("Drake x NOCTA — демо Cap", "Кепка коллаборации, демо.", 3990.0),
    ("OVO Track Pants — демо", "Спортивные штаны, демо.", 8990.0),
    ("OVO Crossbody Bag — демо", "Сумка через плечо.", 6990.0),
    ("Drake Certified Lover Boy — демо Hoodie", "Худи капсулы, демо.", 9990.0),
]

BILLIE_LINE: list[tuple[str, str, float]] = [
    ("Billie Eilish — демо Oversized Tee", "Оверсайз футболка, демо-капсула.", 4490.0),
    ("Billie x Nike — демо Shorts", "Шорты коллаба, демо.", 5490.0),
    ("Happier Than Ever — демо Hoodie", "Худи линейки, демо.", 7990.0),
    ("Billie Neon Logo Beanie", "Шапка с неоновым лого.", 2490.0),
    ("Billie Tour Tote — демо", "Сумка-тоут, демо.", 3590.0),
    ("Billie Sustainable Cap — демо", "Кепка, демо-материалы.", 2990.0),
]


def _get_or_create_brand(
    db: Session,
    name: str,
    slug: str,
    logo_url: Optional[str],
    is_celebrity: bool,
) -> models.Brand:
    b = db.query(models.Brand).filter(models.Brand.slug == slug).first()
    if b:
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
        ("Nike", "nike", None, False),
        ("Adidas", "adidas", None, False),
        ("Puma", "puma", "/images/catalog-demo/puma-01.svg", False),
        ("Under Armour", "under-armour", "/images/catalog-demo/ua-01.svg", False),
        ("Recrent", "recrent", "/images/celebrities/recrent.jpg", True),
        ("Kanye West", "kanye-west", "/images/catalog-demo/celeb-kanye.svg", True),
        ("Rihanna", "rihanna", "/images/catalog-demo/celeb-rihanna.svg", True),
        ("New Balance", "new-balance", "/images/catalog-demo/nb-01.svg", False),
        ("Converse", "converse", "/images/catalog-demo/converse-01.svg", False),
        ("Drake", "drake", "/images/catalog-demo/celeb-drake.svg", True),
        ("Billie Eilish", "billie-eilish", "/images/catalog-demo/celeb-billie.svg", True),
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
            "Puma Velocity",
            "puma-velocity-2025",
            "Бег и лайфстайл Puma.",
            "puma",
            True,
        ),
        (
            "UA HOVR",
            "ua-hovr-collection",
            "Беговая линейка Under Armour HOVR.",
            "under-armour",
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
            "Travis Scott x Nike",
            "travis-scott-nike",
            "Демо-коллаборация Travis Scott x Nike.",
            "nike",
            True,
        ),
        (
            "YEEZY Demo",
            "kanye-yeezy-demo",
            "Демо-капсула Kanye West / YEEZY.",
            "kanye-west",
            True,
        ),
        (
            "Fenty x Demo",
            "rihanna-fenty-demo",
            "Демо-линейка Rihanna / Fenty.",
            "rihanna",
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
            "OVO Demo",
            "drake-ovo-demo",
            "Демо-мерч Drake / OVO.",
            "drake",
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


def seed_catalog(db: Session) -> None:
    collections = _sync_brands_and_collections(db)

    cat_celeb = _get_or_create_category(db, CATEGORY_CELEBRITIES)
    cat_sport = _get_or_create_category(db, CATEGORY_SPORT)
    cat_sports = _get_or_create_category(db, CATEGORY_SPORTS)
    cat_street = _get_or_create_category(db, CATEGORY_STREETWEAR)

    recrent_col = collections.get("recrent")
    recrent_brand = db.query(models.Brand).filter(models.Brand.slug == "recrent").first()

    if not db.query(models.Product).filter(models.Product.name == MARKER_RECRENT).first():
        if recrent_col and recrent_brand:
            for name, description, price, filename in RECRENT_PRODUCTS:
                db.add(
                    models.Product(
                        name=name,
                        description=description,
                        price=price,
                        category_id=cat_celeb.id,
                        brand_id=recrent_brand.id,
                        collection_id=recrent_col.id,
                        image_url=f"/images/products/{filename}",
                        image_embedding=None,
                    )
                )
            db.commit()
            print(f"[DB] Seeded {len(RECRENT_PRODUCTS)} Recrent products.")

    nike_b = db.query(models.Brand).filter(models.Brand.slug == "nike").first()
    adidas_b = db.query(models.Brand).filter(models.Brand.slug == "adidas").first()
    puma_b = db.query(models.Brand).filter(models.Brand.slug == "puma").first()
    ua_b = db.query(models.Brand).filter(models.Brand.slug == "under-armour").first()
    kanye_b = db.query(models.Brand).filter(models.Brand.slug == "kanye-west").first()
    rihanna_b = db.query(models.Brand).filter(models.Brand.slug == "rihanna").first()
    nb_b = db.query(models.Brand).filter(models.Brand.slug == "new-balance").first()
    converse_b = db.query(models.Brand).filter(models.Brand.slug == "converse").first()
    drake_b = db.query(models.Brand).filter(models.Brand.slug == "drake").first()
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
        "Travis Scott x Nike — демо Hoodie",
        TRAVIS_SCOTT,
        cat_celeb.id,
        nike_b,
        collections.get("travis-scott-nike"),
        COLLAB_DEMO_IMAGES,
    )
    _seed_product_block(
        db,
        MARKER_PUMA,
        PUMA_LINE,
        cat_sport.id,
        puma_b,
        collections.get("puma-velocity-2025"),
        PUMA_DEMO_IMAGES,
    )
    _seed_product_block(
        db,
        MARKER_UA,
        UA_LINE,
        cat_sport.id,
        ua_b,
        collections.get("ua-hovr-collection"),
        UA_DEMO_IMAGES,
    )
    _seed_product_block(
        db,
        MARKER_KANYE,
        KANYE_LINE,
        cat_celeb.id,
        kanye_b,
        collections.get("kanye-yeezy-demo"),
        COLLAB_DEMO_IMAGES,
    )
    _seed_product_block(
        db,
        MARKER_RIHANNA,
        RIHANNA_LINE,
        cat_celeb.id,
        rihanna_b,
        collections.get("rihanna-fenty-demo"),
        COLLAB_DEMO_IMAGES,
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
        MARKER_DRAKE,
        DRAKE_LINE,
        cat_celeb.id,
        drake_b,
        collections.get("drake-ovo-demo"),
        COLLAB_DEMO_IMAGES,
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
