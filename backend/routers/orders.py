from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

import models
from database import get_db
from deps import get_current_user

router = APIRouter()


@router.post("/orders/checkout")
def checkout_cart(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    cart_items = (
        db.query(models.CartItem)
        .options(joinedload(models.CartItem.product))
        .filter(models.CartItem.user_id == current_user.id)
        .all()
    )

    if not cart_items:
        raise HTTPException(status_code=400, detail="Корзина пуста")

    total_amount = sum(item.product.price * item.quantity for item in cart_items)
    order = models.Order(user_id=current_user.id, status="created", total_amount=total_amount)
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

    return {
        "order_id": order.id,
        "status": order.status,
        "total_amount": order.total_amount,
        "items_count": len(cart_items),
    }


@router.get("/orders/my")
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    orders = (
        db.query(models.Order)
        .options(joinedload(models.Order.items).joinedload(models.OrderItem.product))
        .filter(models.Order.user_id == current_user.id)
        .order_by(models.Order.created_at.desc())
        .all()
    )

    result = []
    for order in orders:
        result.append(
            {
                "id": order.id,
                "status": order.status,
                "total_amount": order.total_amount,
                "created_at": order.created_at.isoformat() if order.created_at else None,
                "items": [
                    {
                        "id": item.id,
                        "product_id": item.product_id,
                        "name": item.product.name if item.product else None,
                        "image_url": item.product.image_url if item.product else None,
                        "quantity": item.quantity,
                        "price_at_purchase": item.price_at_purchase,
                    }
                    for item in order.items
                ],
            }
        )

    return result
