from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

import models
from fastapi import HTTPException

from schemas import (
    AdminOrderResponse,
    AdminProductCreate,
    AdminProductUpdate,
    AdminStatsResponse,
    AdminUserResponse,
    ProductResponse,
)
from services.orders_service import _order_to_response


def get_stats(db: Session) -> AdminStatsResponse:
    users_count = db.query(func.count(models.User.id)).scalar() or 0
    products_count = db.query(func.count(models.Product.id)).scalar() or 0
    orders_count = db.query(func.count(models.Order.id)).scalar() or 0
    revenue = (
        db.query(func.coalesce(func.sum(models.Order.total_amount), 0.0))
        .filter(models.Order.status != models.OrderStatus.cancelled)
        .scalar()
    )
    return AdminStatsResponse(
        users_count=int(users_count),
        products_count=int(products_count),
        orders_count=int(orders_count),
        revenue_total=float(revenue or 0.0),
    )


def list_orders(db: Session, limit: int = 50, offset: int = 0) -> list[AdminOrderResponse]:
    orders = (
        db.query(models.Order)
        .options(
            joinedload(models.Order.items).joinedload(models.OrderItem.product),
            joinedload(models.Order.user),
        )
        .order_by(models.Order.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    result: list[AdminOrderResponse] = []
    for order in orders:
        base = _order_to_response(order)
        user = order.user
        result.append(
            AdminOrderResponse(
                **base.model_dump(),
                user_id=order.user_id,
                user_email=user.email if user else None,
                user_full_name=user.full_name if user else None,
            )
        )
    return result


def list_users(db: Session, limit: int = 100, offset: int = 0) -> list[AdminUserResponse]:
    users = (
        db.query(models.User)
        .order_by(models.User.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return [
        AdminUserResponse(
            id=u.id,
            email=u.email,
            full_name=u.full_name,
            is_verified=bool(u.is_verified),
            is_admin=bool(u.is_admin),
        )
        for u in users
    ]


# ── Product management ───────────────────────────────────────────────────────


def create_product(body: AdminProductCreate, db: Session) -> ProductResponse:
    product = models.Product(
        name=body.name,
        description=body.description,
        price=body.price,
        image_url=body.image_url,
        brand_id=body.brand_id,
        collection_id=body.collection_id,
        product_type=body.product_type,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return _product_to_response(product)


def update_product(product_id: int, body: AdminProductUpdate, db: Session) -> ProductResponse:
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    if body.name is not None:
        product.name = body.name
    if body.description is not None:
        product.description = body.description
    if body.price is not None:
        product.price = body.price
    if body.image_url is not None:
        product.image_url = body.image_url
    if body.brand_id is not None:
        product.brand_id = body.brand_id
    if body.collection_id is not None:
        product.collection_id = body.collection_id
    if body.product_type is not None:
        product.product_type = body.product_type
    db.commit()
    db.refresh(product)
    return _product_to_response(product)


def delete_product(product_id: int, db: Session) -> None:
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    db.delete(product)
    db.commit()


def _product_to_response(product: models.Product) -> ProductResponse:
    brand = None
    if product.brand:
        brand = {"id": product.brand.id, "name": product.brand.name, "slug": product.brand.slug, "is_celebrity": product.brand.is_celebrity}
    collection = None
    if product.collection:
        collection = {"id": product.collection.id, "name": product.collection.name, "slug": product.collection.slug}
    return ProductResponse(
        id=product.id,
        name=product.name,
        description=product.description,
        price=product.price,
        image_url=product.image_url,
        images=[],
        category_id=product.category_id,
        brand_id=product.brand_id,
        collection_id=product.collection_id,
        views_count=product.views_count,
        product_type=product.product_type.value if hasattr(product.product_type, 'value') else str(product.product_type),
        brand=brand,
        collection=collection,
    )
