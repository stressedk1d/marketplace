from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from schemas import (
    BrandResponse,
    CategoryResponse,
    CollectionResponse,
    ProductListResponse,
    ProductResponse,
    ProductSort,
)
from services import catalog_service

router = APIRouter(tags=["catalog"])


@router.get("/brands", response_model=list[BrandResponse])
def get_brands(
    is_celebrity: Optional[bool] = Query(
        None,
        description=(
            "true — только знаменитости; false — только обычные бренды; "
            "не задано — список для раздела «Бренды» (без знаменитостей)"
        ),
    ),
    db: Session = Depends(get_db),
) -> list[BrandResponse]:
    return catalog_service.list_brands(db, is_celebrity=is_celebrity)


@router.get("/collections", response_model=list[CollectionResponse])
def get_collections(
    featured: bool = Query(False, description="Только избранные коллекции"),
    is_featured: bool = Query(
        False,
        description="То же, что featured (удобный алиас для фронтенда)",
    ),
    exclude_celebrity_brands: bool = Query(
        False,
        description="Скрыть коллекции брендов-знаменитостей (мерч личностей)",
    ),
    db: Session = Depends(get_db),
) -> list[CollectionResponse]:
    return catalog_service.list_collections(
        db,
        featured_only=featured or is_featured,
        exclude_celebrity_brands=exclude_celebrity_brands,
    )


@router.get("/brands/{brand_slug}/collections", response_model=list[CollectionResponse])
def get_brand_collections(
    brand_slug: str,
    db: Session = Depends(get_db),
) -> list[CollectionResponse]:
    return catalog_service.list_collections_by_brand_slug(db, brand_slug)


@router.get("/collections/{collection_slug}/products", response_model=ProductListResponse)
def get_collection_products(
    collection_slug: str,
    db: Session = Depends(get_db),
    search: Optional[str] = None,
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    sort: ProductSort = ProductSort.name_asc,
    limit: int = Query(12, ge=1, le=50),
    offset: int = Query(0, ge=0),
) -> ProductListResponse:
    return catalog_service.list_products_by_collection_slug(
        db,
        collection_slug,
        search=search,
        min_price=min_price,
        max_price=max_price,
        sort=sort,
        limit=limit,
        offset=offset,
    )


@router.get("/collections/{collection_slug}", response_model=CollectionResponse)
def get_collection(
    collection_slug: str,
    db: Session = Depends(get_db),
) -> CollectionResponse:
    return catalog_service.get_collection_by_slug(db, collection_slug)


@router.get("/categories", response_model=list[CategoryResponse])
def get_categories(db: Session = Depends(get_db)) -> list[CategoryResponse]:
    return catalog_service.list_categories(db)


@router.get("/products", response_model=ProductListResponse)
def get_products(
    db: Session = Depends(get_db),
    search: Optional[str] = None,
    category_id: Optional[int] = Query(None, ge=1),
    brand_id: Optional[int] = Query(None, ge=1),
    brand_slug: Optional[str] = Query(
        None,
        description="Фильтр по slug бренда (включая знаменитостей, не в списке /brands)",
    ),
    collection_id: Optional[int] = Query(None, ge=1),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    sort: ProductSort = ProductSort.name_asc,
    limit: int = Query(12, ge=1, le=50),
    offset: int = Query(0, ge=0),
) -> ProductListResponse:
    return catalog_service.list_products(
        db,
        search=search,
        category_id=category_id,
        brand_id=brand_id,
        brand_slug=brand_slug,
        collection_id=collection_id,
        min_price=min_price,
        max_price=max_price,
        sort=sort,
        limit=limit,
        offset=offset,
    )


@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)) -> ProductResponse:
    return catalog_service.get_product(db, product_id)
