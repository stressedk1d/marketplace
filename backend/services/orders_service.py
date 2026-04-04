from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

import models
from models import OrderStatus
from schemas import CheckoutResponse, OrderItemResponse, OrderResponse

_ALLOWED_TRANSITIONS: frozenset[tuple[OrderStatus, OrderStatus]] = frozenset(
    {
        (OrderStatus.created, OrderStatus.paid),
        (OrderStatus.created, OrderStatus.cancelled),
        (OrderStatus.paid, OrderStatus.shipped),
        (OrderStatus.paid, OrderStatus.cancelled),
        (OrderStatus.shipped, OrderStatus.delivered),
        (OrderStatus.shipped, OrderStatus.cancelled),
    }
)


def _as_order_status(value: OrderStatus | str) -> OrderStatus:
    if isinstance(value, OrderStatus):
        return value
    return OrderStatus(value)


def _validate_status_transition(current: OrderStatus, new: OrderStatus) -> None:
    if current == new:
        return
    if (current, new) not in _ALLOWED_TRANSITIONS:
        raise HTTPException(
            status_code=400,
            detail="Недопустимый переход статуса заказа",
        )


def _order_to_response(order: models.Order) -> OrderResponse:
    return OrderResponse(
        id=order.id,
        status=_as_order_status(order.status),
        total_amount=order.total_amount,
        created_at=order.created_at.isoformat() if order.created_at else None,
        items=[
            OrderItemResponse(
                id=i.id,
                product_id=i.product_id,
                name=i.product.name if i.product else None,
                image_url=i.product.image_url if i.product else None,
                quantity=i.quantity,
                price_at_purchase=i.price_at_purchase,
            )
            for i in order.items
        ],
    )


def checkout(user_id: int, db: Session) -> CheckoutResponse:
    cart_items = (
        db.query(models.CartItem)
        .options(joinedload(models.CartItem.product))
        .filter(models.CartItem.user_id == user_id)
        .all()
    )

    if not cart_items:
        raise HTTPException(status_code=400, detail="Корзина пуста")

    total_amount = sum(item.product.price * item.quantity for item in cart_items)
    order = models.Order(
        user_id=user_id,
        status=OrderStatus.created,
        total_amount=total_amount,
    )
    db.add(order)
    db.flush()

    for item in cart_items:
        db.add(
            models.OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price_at_purchase=item.product.price,
            )
        )

    for item in cart_items:
        db.delete(item)

    db.commit()
    db.refresh(order)

    return CheckoutResponse(
        order_id=order.id,
        status=_as_order_status(order.status),
        total_amount=order.total_amount,
        items_count=len(cart_items),
    )


def get_user_orders(user_id: int, db: Session) -> list[OrderResponse]:
    orders = (
        db.query(models.Order)
        .options(joinedload(models.Order.items).joinedload(models.OrderItem.product))
        .filter(models.Order.user_id == user_id)
        .order_by(models.Order.created_at.desc())
        .all()
    )

    return [_order_to_response(o) for o in orders]


def update_order_status(
    order_id: int,
    user_id: int,
    new_status: OrderStatus,
    db: Session,
) -> OrderResponse:
    """
    DEMO: разрешено владельцу заказа (любой авторизованный пользователь-владелец).
    В продакшене переходы paid/shipped/delivered должны выставлять платёж/админка/склад.
    """
    order = (
        db.query(models.Order)
        .options(joinedload(models.Order.items).joinedload(models.OrderItem.product))
        .filter(models.Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    if order.user_id != user_id:
        raise HTTPException(status_code=403, detail="Нет доступа к этому заказу")

    current = _as_order_status(order.status)
    new_status = _as_order_status(new_status)
    if current == new_status:
        return _order_to_response(order)

    _validate_status_transition(current, new_status)
    order.status = new_status
    db.commit()
    db.refresh(order)
    return _order_to_response(order)
