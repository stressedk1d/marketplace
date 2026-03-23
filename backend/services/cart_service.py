from fastapi import HTTPException
from sqlalchemy.orm import Session

import models
from schemas import CartItemResponse


def add_to_cart(user_id: int, product_id: int, quantity: int, db: Session) -> None:
    existing = db.query(models.CartItem).filter(
        models.CartItem.user_id == user_id,
        models.CartItem.product_id == product_id,
    ).first()

    if existing:
        existing.quantity += quantity
    else:
        db.add(models.CartItem(user_id=user_id, product_id=product_id, quantity=quantity))
    db.commit()


def get_cart(user_id: int, db: Session) -> list[CartItemResponse]:
    items = db.query(models.CartItem).filter(models.CartItem.user_id == user_id).all()
    return [
        CartItemResponse(
            id=i.id,
            product_id=i.product_id,
            name=i.product.name,
            price=i.product.price,
            quantity=i.quantity,
            image_url=i.product.image_url,
        )
        for i in items
    ]


def remove_from_cart(user_id: int, item_id: int, db: Session) -> None:
    item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.user_id == user_id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Позиция не найдена")
    db.delete(item)
    db.commit()
