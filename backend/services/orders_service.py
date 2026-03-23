from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

import models
from schemas import CheckoutResponse, OrderItemResponse, OrderResponse


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
    order = models.Order(user_id=user_id, status="created", total_amount=total_amount)
    db.add(order)
    db.flush()

    for item in cart_items:
        db.add(models.OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price_at_purchase=item.product.price,
        ))

    for item in cart_items:
        db.delete(item)

    db.commit()
    db.refresh(order)

    return CheckoutResponse(
        order_id=order.id,
        status=order.status,
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

    return [
        OrderResponse(
            id=o.id,
            status=o.status,
            total_amount=o.total_amount,
            created_at=o.created_at.isoformat() if o.created_at else None,
            items=[
                OrderItemResponse(
                    id=i.id,
                    product_id=i.product_id,
                    name=i.product.name if i.product else None,
                    image_url=i.product.image_url if i.product else None,
                    quantity=i.quantity,
                    price_at_purchase=i.price_at_purchase,
                )
                for i in o.items
            ],
        )
        for o in orders
    ]
