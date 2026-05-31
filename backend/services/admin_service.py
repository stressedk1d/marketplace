from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

import models
from datetime import UTC, datetime, timedelta
from fastapi import HTTPException

from pathlib import Path
from uuid import uuid4

from schemas import (
    AdminAnalyticsDay,
    AdminAnalyticsResponse,
    AdminOrderResponse,
    AdminProductCreate,
    AdminProductUpdate,
    AdminStatsResponse,
    AdminStatusCount,
    AdminUserResponse,
    EmailLogResponse,
    ProductResponse,
    ReviewResponse,
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


def get_analytics(db: Session, days: int = 7) -> AdminAnalyticsResponse:
    days = max(1, min(days, 30))
    today = datetime.now(UTC).date()
    start_date = today - timedelta(days=days - 1)
    start_dt = datetime.combine(start_date, datetime.min.time(), tzinfo=UTC)

    day_rows = (
        db.query(
            func.date(models.Order.created_at).label("day"),
            func.count(models.Order.id).label("orders_count"),
            func.coalesce(func.sum(models.Order.total_amount), 0.0).label("revenue"),
        )
        .filter(models.Order.created_at >= start_dt)
        .filter(models.Order.status != models.OrderStatus.cancelled)
        .group_by(func.date(models.Order.created_at))
        .all()
    )
    by_day = {
        str(row.day): {
            "orders_count": int(row.orders_count),
            "revenue": float(row.revenue or 0.0),
        }
        for row in day_rows
    }

    analytics_days: list[AdminAnalyticsDay] = []
    for offset in range(days):
        d = start_date + timedelta(days=offset)
        key = d.isoformat()
        bucket = by_day.get(key, {"orders_count": 0, "revenue": 0.0})
        analytics_days.append(
            AdminAnalyticsDay(
                date=key,
                orders_count=bucket["orders_count"],
                revenue=bucket["revenue"],
            )
        )

    status_rows = (
        db.query(models.Order.status, func.count(models.Order.id))
        .group_by(models.Order.status)
        .all()
    )
    orders_by_status = [
        AdminStatusCount(
            status=status.value if hasattr(status, "value") else str(status),
            count=int(count),
        )
        for status, count in status_rows
    ]

    return AdminAnalyticsResponse(days=analytics_days, orders_by_status=orders_by_status)


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


def list_reviews(db: Session, limit: int = 50, offset: int = 0) -> list[ReviewResponse]:
    rows = (
        db.query(models.Review)
        .order_by(models.Review.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    result: list[ReviewResponse] = []
    for r in rows:
        user = db.query(models.User).filter(models.User.id == r.user_id).first()
        result.append(
            ReviewResponse(
                id=r.id,
                user_id=r.user_id,
                user_name=user.full_name if user else None,
                product_id=r.product_id,
                rating=r.rating,
                text=r.text,
                created_at=r.created_at.isoformat() if r.created_at else None,
            )
        )
    return result


def delete_review(db: Session, review_id: int) -> None:
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Отзыв не найден")
    db.delete(review)
    db.commit()


def list_email_logs(db: Session, limit: int = 30) -> list[EmailLogResponse]:
    rows = (
        db.query(models.EmailLog)
        .order_by(models.EmailLog.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        EmailLogResponse(
            id=r.id,
            order_id=r.order_id,
            to_email=r.to_email,
            subject=r.subject,
            body_preview=r.body_preview,
            sent=r.sent,
            created_at=r.created_at.isoformat() if r.created_at else None,
        )
        for r in rows
    ]


def save_uploaded_image(file_bytes: bytes, filename: str) -> str:
    ext = Path(filename).suffix.lower() or ".jpg"
    if ext not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        raise HTTPException(status_code=400, detail="Допустимы jpg, png, webp, gif")
    upload_dir = Path(__file__).resolve().parent.parent.parent / "frontend" / "public" / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    safe_name = f"{uuid4().hex}{ext}"
    path = upload_dir / safe_name
    path.write_bytes(file_bytes)
    return f"/uploads/{safe_name}"
