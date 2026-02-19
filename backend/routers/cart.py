from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
from database import get_db
from deps import get_current_user
from schemas import AddToCart

router = APIRouter()


@router.post("/cart/add")
def add_to_cart(
    item: AddToCart,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    existing = db.query(models.CartItem).filter(
        models.CartItem.user_id == current_user.id,
        models.CartItem.product_id == item.product_id,
    ).first()

    if existing:
        existing.quantity += item.quantity
    else:
        db.add(
            models.CartItem(
                user_id=current_user.id,
                product_id=item.product_id,
                quantity=item.quantity,
            )
        )
    db.commit()
    return {"message": "Добавлено"}


@router.get("/cart")
def get_cart(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    items = db.query(models.CartItem).filter(models.CartItem.user_id == current_user.id).all()
    return [
        {
            "id": i.id,
            "product_id": i.product_id,
            "name": i.product.name,
            "price": i.product.price,
            "quantity": i.quantity,
            "image_url": i.product.image_url,
        }
        for i in items
    ]


@router.delete("/cart/{item_id}")
def delete_cart_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.user_id == current_user.id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Позиция не найдена")
    db.delete(item)
    db.commit()
    return {"message": "Удалено"}
