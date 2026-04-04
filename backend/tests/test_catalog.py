import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session

import models
from schemas import ProductSort
from services import catalog_service


def test_list_products(db: Session, test_product: models.Product):
    result = catalog_service.list_products(db, limit=50, offset=0)
    assert result.total == 1
    assert len(result.items) == 1
    assert result.items[0].id == test_product.id
    assert result.items[0].price == test_product.price
    assert result.limit == 50
    assert result.offset == 0


def test_list_products_empty(db: Session):
    result = catalog_service.list_products(db, limit=50, offset=0)
    assert result.total == 0
    assert result.items == []


def test_search_by_name(db: Session, test_product: models.Product):
    result = catalog_service.list_products(db, search="Test", limit=50, offset=0)
    assert result.total == 1
    assert len(result.items) == 1
    assert result.items[0].name == test_product.name


def test_search_by_description(db: Session, test_product: models.Product):
    result = catalog_service.list_products(db, search="Description", limit=50, offset=0)
    assert result.total == 1


def test_search_no_match(db: Session, test_product: models.Product):
    result = catalog_service.list_products(db, search="nonexistent_xyz", limit=50, offset=0)
    assert result.total == 0
    assert result.items == []


def test_search_case_insensitive(db: Session, test_product: models.Product):
    result = catalog_service.list_products(db, search="test product", limit=50, offset=0)
    assert result.total == 1


def test_get_product_by_id(db: Session, test_product: models.Product):
    product = db.query(models.Product).filter(models.Product.id == test_product.id).first()
    assert product is not None
    assert product.id == test_product.id
    assert product.name == test_product.name


def test_get_product_by_id_not_found(db: Session):
    product = db.query(models.Product).filter(models.Product.id == 9999).first()
    assert product is None


def test_list_categories(db: Session, test_product: models.Product):
    cats = catalog_service.list_categories(db)
    assert len(cats) >= 1
    assert any(c.id == test_product.category_id for c in cats)


def test_filter_by_brand_slug(db: Session, test_product: models.Product):
    brand = models.Brand(name="Star", slug="star-one", is_celebrity=True)
    db.add(brand)
    db.flush()
    test_product.brand_id = brand.id
    db.commit()

    result = catalog_service.list_products(db, brand_slug="star-one", limit=50, offset=0)
    assert result.total == 1
    assert result.items[0].brand is not None
    assert result.items[0].brand.slug == "star-one"
    assert result.items[0].brand.is_celebrity is True


def test_filter_by_brand_slug_unknown_returns_empty(db: Session, test_product: models.Product):
    result = catalog_service.list_products(db, brand_slug="no-such-slug", limit=50, offset=0)
    assert result.total == 0
    assert result.items == []


def test_filter_by_brand_slug_and_id_conflict_raises(db: Session, test_product: models.Product):
    a = models.Brand(name="A", slug="brand-a")
    b = models.Brand(name="B", slug="brand-b")
    db.add_all([a, b])
    db.flush()
    test_product.brand_id = a.id
    db.commit()

    with pytest.raises(HTTPException) as exc:
        catalog_service.list_products(
            db, brand_id=a.id, brand_slug="brand-b", limit=50, offset=0
        )
    assert exc.value.status_code == 400


def test_get_product_increments_views(db: Session, test_product: models.Product):
    r1 = catalog_service.get_product(db, test_product.id)
    assert r1.views_count >= 1
    r2 = catalog_service.get_product(db, test_product.id)
    assert r2.views_count == r1.views_count + 1


def test_sort_popular(db: Session, test_product: models.Product):
    cat = test_product.category
    hi = models.Product(
        name="Popular",
        description="d",
        price=50.0,
        image_url="/h.png",
        category_id=cat.id,
        views_count=100,
    )
    lo = models.Product(
        name="Unpopular",
        description="d",
        price=50.0,
        image_url="/l.png",
        category_id=cat.id,
        views_count=1,
    )
    db.add_all([hi, lo])
    db.commit()

    rows = catalog_service.list_products(db, sort=ProductSort.popular, limit=50, offset=0)
    ids = [p.id for p in rows.items]
    assert ids.index(hi.id) < ids.index(lo.id)


def test_list_brands_default_excludes_celebrities(db: Session):
    db.add_all(
        [
            models.Brand(name="ZStar", slug="z-star", is_celebrity=True),
            models.Brand(name="ANorm", slug="a-norm", is_celebrity=False),
        ]
    )
    db.commit()
    rows = catalog_service.list_brands(db, is_celebrity=None)
    assert len(rows) == 1
    assert rows[0].slug == "a-norm"


def test_list_brands_celebrities_only(db: Session):
    db.add_all(
        [
            models.Brand(name="ZStar", slug="z-star", is_celebrity=True),
            models.Brand(name="ANorm", slug="a-norm", is_celebrity=False),
        ]
    )
    db.commit()
    rows = catalog_service.list_brands(db, is_celebrity=True)
    assert len(rows) == 1
    assert rows[0].slug == "z-star"


def test_list_brands_retail_only(db: Session):
    db.add_all(
        [
            models.Brand(name="ZStar", slug="z-star", is_celebrity=True),
            models.Brand(name="ANorm", slug="a-norm", is_celebrity=False),
        ]
    )
    db.commit()
    rows = catalog_service.list_brands(db, is_celebrity=False)
    assert len(rows) == 1
    assert rows[0].slug == "a-norm"


def test_list_brands_celebrities_multiple(db: Session):
    db.add_all(
        [
            models.Brand(name="Z Celeb", slug="z-celeb", is_celebrity=True),
            models.Brand(name="A Celeb", slug="a-celeb", is_celebrity=True),
        ]
    )
    db.commit()
    rows = catalog_service.list_brands(db, is_celebrity=True)
    assert len(rows) == 2
    assert [b.slug for b in rows] == ["a-celeb", "z-celeb"]


def test_list_collections_includes_brand_filter(db: Session):
    b = models.Brand(name="PumaT", slug="puma-t", is_celebrity=False)
    db.add(b)
    db.flush()
    db.add(
        models.Collection(
            name="Puma Demo Col",
            slug="puma-demo-col",
            description="x",
            brand_id=b.id,
            is_featured=True,
        )
    )
    db.commit()
    cols = catalog_service.list_collections(db, featured_only=True)
    slugs = {c.slug for c in cols}
    assert "puma-demo-col" in slugs


def test_filter_by_brand(db: Session, test_product: models.Product):
    brand = models.Brand(name="TestBrand", slug="test-brand")
    db.add(brand)
    db.flush()
    test_product.brand_id = brand.id
    db.commit()
    db.refresh(test_product)

    result = catalog_service.list_products(db, brand_id=brand.id, limit=50, offset=0)
    assert result.total == 1
    assert result.items[0].brand is not None
    assert result.items[0].brand.slug == "test-brand"


def test_filter_by_category(db: Session, test_product: models.Product):
    other_cat = models.Category(name="Other")
    db.add(other_cat)
    db.flush()
    db.add(
        models.Product(
            name="Other Cat Product",
            description="x",
            price=50.0,
            image_url="/x.png",
            category_id=other_cat.id,
        )
    )
    db.commit()

    only_main = catalog_service.list_products(db, category_id=test_product.category_id, limit=50, offset=0)
    assert only_main.total == 1
    assert only_main.items[0].id == test_product.id


def test_filter_by_price_range(db: Session, test_product: models.Product):
    db.add(
        models.Product(
            name="Cheap",
            description="d",
            price=10.0,
            image_url="/c.png",
            category_id=test_product.category_id,
        )
    )
    db.commit()

    mid = catalog_service.list_products(db, min_price=20.0, max_price=150.0, limit=50, offset=0)
    assert test_product.id in {p.id for p in mid.items}
    assert all(20.0 <= p.price <= 150.0 for p in mid.items)
    assert mid.total == 1


def test_sort_price_desc(db: Session, test_product: models.Product):
    db.add(
        models.Product(
            name="Zzz",
            description="d",
            price=1.0,
            image_url="/z.png",
            category_id=test_product.category_id,
        )
    )
    db.commit()
    rows = catalog_service.list_products(db, sort=ProductSort.price_desc, limit=50, offset=0)
    prices = [p.price for p in rows.items]
    assert prices == sorted(prices, reverse=True)


def test_price_range_invalid_raises(db: Session, test_product: models.Product):
    with pytest.raises(HTTPException) as exc:
        catalog_service.list_products(db, min_price=500.0, max_price=10.0, limit=50, offset=0)
    assert exc.value.status_code == 400


def test_pagination_limit_and_total(db: Session, test_product: models.Product):
    for i in range(5):
        db.add(
            models.Product(
                name=f"Extra {i}",
                description="d",
                price=float(10 + i),
                image_url=f"/e{i}.png",
                category_id=test_product.category_id,
            )
        )
    db.commit()

    page0 = catalog_service.list_products(db, limit=2, offset=0)
    assert page0.total == 6
    assert len(page0.items) == 2
    assert page0.limit == 2
    assert page0.offset == 0

    page_last = catalog_service.list_products(db, limit=2, offset=4)
    assert page_last.total == 6
    assert len(page_last.items) == 2

    page_end = catalog_service.list_products(db, limit=10, offset=6)
    assert page_end.total == 6
    assert page_end.items == []


def test_pagination_invalid_limit(db: Session, test_product: models.Product):
    with pytest.raises(HTTPException) as exc:
        catalog_service.list_products(db, limit=0, offset=0)
    assert exc.value.status_code == 400

    with pytest.raises(HTTPException) as exc:
        catalog_service.list_products(db, limit=51, offset=0)
    assert exc.value.status_code == 400


def test_pagination_invalid_offset(db: Session, test_product: models.Product):
    with pytest.raises(HTTPException) as exc:
        catalog_service.list_products(db, limit=12, offset=-1)
    assert exc.value.status_code == 400
