from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

import models
from models import OrderStatus
from schemas import CheckoutResponse, OrderItemResponse, OrderResponse
from services import email_service, promo_service

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
        discount_amount=float(order.discount_amount or 0),
        promo_code=order.promo_code,
        comment=order.comment,
        created_at=order.created_at.isoformat() if order.created_at else None,
        items=[
            OrderItemResponse(
                id=i.id,
                product_id=i.product_id,
                name=i.product.name if i.product else None,
                image_url=i.product.image_url if i.product else None,
                quantity=i.quantity,
                price_at_purchase=i.price_at_purchase,
                size=i.size or "",
            )
            for i in order.items
        ],
    )


def checkout(
    user_id: int,
    db: Session,
    promo_code: str | None = None,
    delivery_comment: str | None = None,
) -> CheckoutResponse:
    cart_items = (
        db.query(models.CartItem)
        .options(joinedload(models.CartItem.product))
        .filter(models.CartItem.user_id == user_id)
        .all()
    )

    if not cart_items:
        raise HTTPException(status_code=400, detail="Корзина пуста")

    subtotal = sum(item.product.price * item.quantity for item in cart_items)
    discount, applied_code = promo_service.calc_discount(db, promo_code, subtotal)
    total_amount = round(subtotal - discount, 2)

    user = db.query(models.User).filter(models.User.id == user_id).first()
    points_earned = int(total_amount * 0.01) if user else 0
    if user and points_earned > 0:
        user.loyalty_points = int(user.loyalty_points or 0) + points_earned

    order = models.Order(
        user_id=user_id,
        status=OrderStatus.created,
        total_amount=total_amount,
        promo_code=applied_code,
        discount_amount=discount,
        comment=delivery_comment,
    )
    db.add(order)
    db.flush()

    for item in cart_items:
        size_label = item.size or ""
        if size_label:
            variant = (
                db.query(models.ProductVariant)
                .filter(
                    models.ProductVariant.product_id == item.product_id,
                    models.ProductVariant.size == size_label,
                )
                .first()
            )
            if not variant or variant.stock < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Недостаточно товара (размер {size_label})",
                )
            variant.stock -= item.quantity

        db.add(
            models.OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price_at_purchase=item.product.price,
                size=size_label,
            )
        )

    for item in cart_items:
        db.delete(item)

    db.commit()
    db.refresh(order)

    _notify_order_created(order, db)

    return CheckoutResponse(
        order_id=order.id,
        status=_as_order_status(order.status),
        total_amount=order.total_amount,
        discount_amount=float(order.discount_amount or 0),
        promo_code=order.promo_code,
        loyalty_points_earned=points_earned,
        items_count=len(cart_items),
    )


def _notify_order_created(order: models.Order, db: Session) -> None:
    user = db.query(models.User).filter(models.User.id == order.user_id).first()
    if not user or not user.email:
        return

    order_with_items = (
        db.query(models.Order)
        .options(joinedload(models.Order.items).joinedload(models.OrderItem.product))
        .filter(models.Order.id == order.id)
        .first()
    )
    if not order_with_items:
        return

    items_for_email: list[tuple[str, int, float]] = []
    for item in order_with_items.items:
        name = item.product.name if item.product else f"Товар #{item.product_id}"
        items_for_email.append((name, item.quantity, float(item.price_at_purchase)))

    subject = f"VogueWay — заказ №{order_with_items.id} оформлен"
    body_lines = [
        f"Заказ №{order_with_items.id}",
        f"Сумма: {order_with_items.total_amount:,.2f} ₽".replace(",", " "),
    ]
    if order_with_items.comment:
        body_lines.append(f"Доставка: {order_with_items.comment[:500]}")
    for name, qty, price in items_for_email:
        body_lines.append(f"• {name} — {qty} × {price:,.0f} ₽".replace(",", " "))
    body_preview = "\n".join(body_lines)[:2000]

    sent = False
    try:
        sent = email_service.send_order_confirmation_email(
            to_email=user.email,
            full_name=user.full_name,
            order_id=order_with_items.id,
            total_amount=float(order_with_items.total_amount),
            items=items_for_email,
        )
    except Exception:
        pass

    db.add(
        models.EmailLog(
            order_id=order_with_items.id,
            to_email=user.email,
            subject=subject,
            body_preview=body_preview,
            sent=bool(sent),
        )
    )
    db.commit()


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


def admin_update_order_status(
    order_id: int,
    new_status: OrderStatus,
    db: Session,
) -> OrderResponse:
    order = (
        db.query(models.Order)
        .options(joinedload(models.Order.items).joinedload(models.OrderItem.product))
        .filter(models.Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    current = _as_order_status(order.status)
    new_status = _as_order_status(new_status)
    if current == new_status:
        return _order_to_response(order)

    _validate_status_transition(current, new_status)
    order.status = new_status
    db.commit()
    db.refresh(order)
    return _order_to_response(order)
