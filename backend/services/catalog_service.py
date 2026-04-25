from typing import Optional

from fastapi import HTTPException
from sqlalchemy import and_, case, func, or_, update
from sqlalchemy.orm import Query, Session, joinedload, selectinload

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
FACET_PRICE_BUCKETS: list[tuple[int, Optional[int]]] = [
    (0, 100),
    (100, 300),
    (300, None),
]


def _normalize_product_type(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    normalized = value.strip().lower()
    mapping = {
        "одежда": "clothing",
        "обувь": "shoes",
        "аксессуары": "accessories",
        "clothing": "clothing",
        "shoes": "shoes",
        "accessories": "accessories",
    }
    return mapping.get(normalized)


def _build_product_images(product: models.Product) -> list[str]:
    image_urls = [img.url for img in (product.images or []) if img.url]
    if image_urls:
        return image_urls
    if product.image_url:
        return [product.image_url]
    return []


def product_to_response(product: models.Product) -> ProductResponse:
    image_urls = _build_product_images(product)

    image_url = image_urls[0] if image_urls else product.image_url

    return ProductResponse(
        id=product.id,
        name=product.name,
        description=product.description,
        price=product.price,
        image_url=image_url,
        images=image_urls,
        category_id=product.category_id,
        brand_id=product.brand_id,
        collection_id=product.collection_id,
        views_count=int(product.views_count or 0),
        product_type=(
            product.product_type.value
            if isinstance(product.product_type, models.ProductType)
            else str(product.product_type)
        ),
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


def _apply_filters(
    query: Query,
    search: Optional[str],
    normalized_product_type: Optional[str],
    category_id: Optional[int],
    brand_id: Optional[int],
    collection_id: Optional[int],
    min_price: Optional[float],
    max_price: Optional[float],
) -> Query:
    if search:
        term = f"%{search.lower()}%"
        query = query.filter(
            models.Product.name.ilike(term) | models.Product.description.ilike(term)
        )
    if normalized_product_type:
        query = query.filter(models.Product.product_type == normalized_product_type)
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
    return query


def _filtered_product_query(
    db: Session,
    search: Optional[str],
    normalized_product_type: Optional[str],
    category_id: Optional[int],
    brand_id: Optional[int],
    collection_id: Optional[int],
    min_price: Optional[float],
    max_price: Optional[float],
    sort: ProductSort,
) -> Query:
    query = _apply_filters(
        db.query(models.Product),
        search=search,
        normalized_product_type=normalized_product_type,
        category_id=category_id,
        brand_id=brand_id,
        collection_id=collection_id,
        min_price=min_price,
        max_price=max_price,
    )

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


def build_filters_query(
    db: Session,
    search: Optional[str],
    normalized_product_type: Optional[str],
    category_id: Optional[int],
    brand_id: Optional[int],
    collection_id: Optional[int],
    min_price: Optional[float],
    max_price: Optional[float],
    *,
    exclude_brand: bool = False,
    exclude_product_type: bool = False,
    exclude_price: bool = False,
) -> Query:
    effective_brand_id = None if exclude_brand else brand_id
    effective_product_type = None if exclude_product_type else normalized_product_type
    effective_min_price = None if exclude_price else min_price
    effective_max_price = None if exclude_price else max_price
    return _apply_filters(
        db.query(models.Product),
        search=search,
        normalized_product_type=effective_product_type,
        category_id=category_id,
        brand_id=effective_brand_id,
        collection_id=collection_id,
        min_price=effective_min_price,
        max_price=effective_max_price,
    ).order_by(None)


def get_facets(
    db: Session,
    search: Optional[str],
    normalized_product_type: Optional[str],
    category_id: Optional[int],
    brand_id: Optional[int],
    selected_brand_slug: Optional[str],
    collection_id: Optional[int],
    min_price: Optional[float],
    max_price: Optional[float],
):
    brands_base_query = build_filters_query(
        db,
        search,
        normalized_product_type,
        category_id,
        brand_id,
        collection_id,
        min_price,
        max_price,
        exclude_brand=True,
    )
    brand_rows = (
        brands_base_query
        .join(models.Brand, models.Product.brand_id == models.Brand.id)
        .with_entities(models.Brand.slug, func.count(models.Product.id))
        .group_by(models.Brand.slug)
        .order_by(func.count(models.Product.id).desc(), models.Brand.slug.asc())
        .all()
    )

    type_base_query = build_filters_query(
        db,
        search,
        normalized_product_type,
        category_id,
        brand_id,
        collection_id,
        min_price,
        max_price,
        exclude_product_type=True,
    )
    type_rows = (
        type_base_query
        .with_entities(models.Product.product_type, func.count(models.Product.id))
        .group_by(models.Product.product_type)
        .order_by(func.count(models.Product.id).desc(), models.Product.product_type.asc())
        .all()
    )

    price_bucket_case = case(
        (and_(models.Product.price >= 0, models.Product.price < 100), "0_100"),
        (and_(models.Product.price >= 100, models.Product.price < 300), "100_300"),
        else_="300_inf",
    )
    price_base_query = build_filters_query(
        db,
        search,
        normalized_product_type,
        category_id,
        brand_id,
        collection_id,
        min_price,
        max_price,
        exclude_price=True,
    )
    price_rows = (
        price_base_query
        .with_entities(price_bucket_case.label("bucket"), func.count(models.Product.id))
        .group_by("bucket")
        .all()
    )
    price_counts = {bucket: count for bucket, count in price_rows}

    return {
        "brands": [
            {
                "slug": slug,
                "count": int(count),
                "selected": bool(slug == selected_brand_slug),
            }
            for slug, count in brand_rows
        ],
        "product_types": [
            {
                "value": item_type.value
                if isinstance(item_type, models.ProductType)
                else str(item_type),
                "count": int(count),
                "selected": bool(
                    (item_type.value if isinstance(item_type, models.ProductType) else str(item_type))
                    == normalized_product_type
                ),
            }
            for item_type, count in type_rows
        ],
        "price_ranges": [
            {
                "min": bucket_min,
                "max": bucket_max,
                "count": int(
                    price_counts.get(
                        (
                            "0_100"
                            if bucket_max == 100
                            else "100_300"
                            if bucket_max == 300
                            else "300_inf"
                        ),
                        0,
                    )
                ),
                "selected": bool(min_price == bucket_min and max_price == bucket_max),
            }
            for bucket_min, bucket_max in FACET_PRICE_BUCKETS
        ],
    }


def _product_load_options(query: Query) -> Query:
    return query.options(
        joinedload(models.Product.brand),
        joinedload(models.Product.collection),
        selectinload(models.Product.images),
    )


def set_product_image_primary(db: Session, product_id: int, image_id: int) -> None:
    image = (
        db.query(models.ProductImage)
        .filter(
            models.ProductImage.id == image_id,
            models.ProductImage.product_id == product_id,
        )
        .first()
    )
    if not image:
        raise HTTPException(status_code=404, detail="Изображение товара не найдено")

    db.query(models.ProductImage).filter(
        models.ProductImage.product_id == product_id,
        models.ProductImage.is_primary.is_(True),
        models.ProductImage.id != image_id,
    ).update(
        {models.ProductImage.is_primary: False},
        synchronize_session=False,
    )
    image.is_primary = True
    db.flush()
    db.refresh(image)


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
    product_type: Optional[str] = None,
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
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(
            status_code=400,
            detail="Минимальная цена не может быть больше максимальной",
        )
    normalized_product_type = _normalize_product_type(product_type)
    if product_type is not None and normalized_product_type is None:
        raise HTTPException(
            status_code=400,
            detail="product_type должен быть одним из: clothing, shoes, accessories",
        )
    effective_brand_id = brand_id
    selected_brand_slug: Optional[str] = brand_slug
    if brand_id is not None:
        brand_by_id = db.query(models.Brand).filter(models.Brand.id == brand_id).first()
        if brand_by_id:
            selected_brand_slug = brand_by_id.slug
    if brand_slug is not None:
        b = db.query(models.Brand).filter(models.Brand.slug == brand_slug).first()
        if not b:
            facets = get_facets(
                db,
                search,
                normalized_product_type,
                category_id,
                None,
                brand_slug,
                collection_id,
                min_price,
                max_price,
            )
            return ProductListResponse(
                items=[],
                total=0,
                limit=limit,
                offset=offset,
                facets=facets,
            )
        if brand_id is not None and brand_id != b.id:
            raise HTTPException(
                status_code=400,
                detail="Параметры brand_id и brand_slug указывают на разные бренды",
            )
        effective_brand_id = b.id
        selected_brand_slug = b.slug
    base = _filtered_product_query(
        db,
        search,
        normalized_product_type,
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
    facets = get_facets(
        db,
        search,
        normalized_product_type,
        category_id,
        effective_brand_id,
        selected_brand_slug,
        collection_id,
        min_price,
        max_price,
    )
    return ProductListResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
        facets=facets,
    )


def list_products_by_collection_slug(
    db: Session,
    collection_slug: str,
    search: Optional[str] = None,
    product_type: Optional[str] = None,
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
        product_type=product_type,
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
    p = _product_load_options(
        db.query(models.Product).filter(models.Product.id == product_id)
    ).first()
    if not p:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return product_to_response(p)
