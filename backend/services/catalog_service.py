from typing import Optional

from fastapi import HTTPException
from sqlalchemy import or_, update
from sqlalchemy.orm import Query, Session, joinedload

import models
from schemas import (
    BrandBrief,
    BrandResponse,
    CategoryResponse,
    CollectionBrief,
    CollectionResponse,
    ProductListResponse,
    ProductResponse,
    ProductSort,
)

DEFAULT_CATALOG_LIMIT = 12
MAX_CATALOG_LIMIT = 50


def product_to_response(product: models.Product) -> ProductResponse:
    return ProductResponse(
        id=product.id,
        name=product.name,
        description=product.description,
        price=product.price,
        image_url=product.image_url,
        category_id=product.category_id,
        brand_id=product.brand_id,
        collection_id=product.collection_id,
        views_count=int(product.views_count or 0),
        brand=BrandBrief.model_validate(product.brand) if product.brand else None,
        collection=CollectionBrief.model_validate(product.collection)
        if product.collection
        else None,
    )


def _validate_pagination(limit: int, offset: int) -> None:
    if offset < 0:
        raise HTTPException(status_code=400, detail="offset не может быть отрицательным")
    if limit < 1 or limit > MAX_CATALOG_LIMIT:
        raise HTTPException(
            status_code=400,
            detail=f"limit должен быть от 1 до {MAX_CATALOG_LIMIT}",
        )


def _filtered_product_query(
    db: Session,
    search: Optional[str],
    category_id: Optional[int],
    brand_id: Optional[int],
    collection_id: Optional[int],
    min_price: Optional[float],
    max_price: Optional[float],
    sort: ProductSort,
) -> Query:
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(
            status_code=400,
            detail="Минимальная цена не может быть больше максимальной",
        )

    query = db.query(models.Product)
    if search:
        term = f"%{search.lower()}%"
        query = query.filter(
            models.Product.name.ilike(term) | models.Product.description.ilike(term)
        )
    if category_id is not None:
        query = query.filter(models.Product.category_id == category_id)
    if brand_id is not None:
        query = query.filter(models.Product.brand_id == brand_id)
    if collection_id is not None:
        query = query.filter(models.Product.collection_id == collection_id)
    if min_price is not None:
        query = query.filter(models.Product.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Product.price <= max_price)

    if sort == ProductSort.price_asc:
        query = query.order_by(models.Product.price.asc(), models.Product.id.asc())
    elif sort == ProductSort.price_desc:
        query = query.order_by(models.Product.price.desc(), models.Product.id.asc())
    elif sort == ProductSort.name_desc:
        query = query.order_by(models.Product.name.desc(), models.Product.id.asc())
    elif sort == ProductSort.popular:
        query = query.order_by(
            models.Product.views_count.desc(),
            models.Product.id.asc(),
        )
    else:
        query = query.order_by(models.Product.name.asc(), models.Product.id.asc())

    return query


def _product_load_options(query: Query) -> Query:
    return query.options(
        joinedload(models.Product.brand),
        joinedload(models.Product.collection),
    )


def list_categories(db: Session) -> list[CategoryResponse]:
    rows = db.query(models.Category).order_by(models.Category.name.asc()).all()
    return [CategoryResponse.model_validate(c) for c in rows]


def list_brands(db: Session, is_celebrity: Optional[bool] = None) -> list[BrandResponse]:
    q = db.query(models.Brand)
    if is_celebrity is True:
        q = q.filter(models.Brand.is_celebrity.is_(True))
    elif is_celebrity is False:
        q = q.filter(models.Brand.is_celebrity.is_(False))
    else:
        q = q.filter(models.Brand.is_celebrity.is_(False))
    rows = q.order_by(models.Brand.name.asc()).all()
    return [BrandResponse.model_validate(b) for b in rows]


def list_collections(
    db: Session,
    featured_only: bool = False,
    exclude_celebrity_brands: bool = False,
) -> list[CollectionResponse]:
    q = (
        db.query(models.Collection)
        .options(joinedload(models.Collection.brand))
        .outerjoin(models.Brand, models.Collection.brand_id == models.Brand.id)
    )
    if featured_only:
        q = q.filter(models.Collection.is_featured.is_(True))
    if exclude_celebrity_brands:
        q = q.filter(
            or_(
                models.Collection.brand_id.is_(None),
                models.Brand.is_celebrity.is_(False),
            )
        )
    rows = q.order_by(models.Collection.name.asc()).all()
    return [_collection_to_response(c) for c in rows]


def _collection_to_response(c: models.Collection) -> CollectionResponse:
    return CollectionResponse(
        id=c.id,
        name=c.name,
        slug=c.slug,
        description=c.description,
        brand_id=c.brand_id,
        is_featured=bool(c.is_featured),
        brand=BrandBrief.model_validate(c.brand) if c.brand else None,
    )


def list_collections_by_brand_slug(db: Session, brand_slug: str) -> list[CollectionResponse]:
    brand = db.query(models.Brand).filter(models.Brand.slug == brand_slug).first()
    if not brand or brand.is_celebrity:
        raise HTTPException(status_code=404, detail="Бренд не найден")
    rows = (
        db.query(models.Collection)
        .options(joinedload(models.Collection.brand))
        .filter(models.Collection.brand_id == brand.id)
        .order_by(models.Collection.name.asc())
        .all()
    )
    return [_collection_to_response(c) for c in rows]


def get_collection_by_slug(db: Session, slug: str) -> CollectionResponse:
    c = (
        db.query(models.Collection)
        .options(joinedload(models.Collection.brand))
        .filter(models.Collection.slug == slug)
        .first()
    )
    if not c:
        raise HTTPException(status_code=404, detail="Коллекция не найдена")
    return _collection_to_response(c)


def list_products(
    db: Session,
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    brand_id: Optional[int] = None,
    brand_slug: Optional[str] = None,
    collection_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: ProductSort = ProductSort.name_asc,
    limit: int = DEFAULT_CATALOG_LIMIT,
    offset: int = 0,
) -> ProductListResponse:
    _validate_pagination(limit, offset)
    effective_brand_id = brand_id
    if brand_slug is not None:
        b = db.query(models.Brand).filter(models.Brand.slug == brand_slug).first()
        if not b:
            return ProductListResponse(items=[], total=0, limit=limit, offset=offset)
        if brand_id is not None and brand_id != b.id:
            raise HTTPException(
                status_code=400,
                detail="Параметры brand_id и brand_slug указывают на разные бренды",
            )
        effective_brand_id = b.id
    base = _filtered_product_query(
        db,
        search,
        category_id,
        effective_brand_id,
        collection_id,
        min_price,
        max_price,
        sort,
    )
    total = base.count()
    rows = (
        _product_load_options(base).offset(offset).limit(limit).all()
    )
    items = [product_to_response(p) for p in rows]
    return ProductListResponse(items=items, total=total, limit=limit, offset=offset)


def list_products_by_collection_slug(
    db: Session,
    collection_slug: str,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: ProductSort = ProductSort.name_asc,
    limit: int = DEFAULT_CATALOG_LIMIT,
    offset: int = 0,
) -> ProductListResponse:
    col = (
        db.query(models.Collection)
        .filter(models.Collection.slug == collection_slug)
        .first()
    )
    if not col:
        raise HTTPException(status_code=404, detail="Коллекция не найдена")
    return list_products(
        db,
        search=search,
        collection_id=col.id,
        min_price=min_price,
        max_price=max_price,
        sort=sort,
        limit=limit,
        offset=offset,
    )


def get_product(db: Session, product_id: int) -> ProductResponse:
    result = db.execute(
        update(models.Product)
        .where(models.Product.id == product_id)
        .values(views_count=models.Product.views_count + 1)
    )
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Товар не найден")
    db.flush()
    p = (
        db.query(models.Product)
        .options(
            joinedload(models.Product.brand),
            joinedload(models.Product.collection),
        )
        .filter(models.Product.id == product_id)
        .first()
    )
    if not p:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return product_to_response(p)
