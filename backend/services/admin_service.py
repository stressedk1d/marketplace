from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

import models
from schemas import AdminOrderResponse, AdminStatsResponse, AdminUserResponse
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
