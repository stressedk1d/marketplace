from fastapi import HTTPException
from sqlalchemy.orm import Session

import models
from schemas import CartItemResponse


def _normalize_size(size: str | None) -> str:
    return (size or "").strip()


def _get_variant(
    db: Session, product_id: int, size: str
) -> models.ProductVariant | None:
    return (
        db.query(models.ProductVariant)
        .filter(
            models.ProductVariant.product_id == product_id,
            models.ProductVariant.size == size,
        )
        .first()
    )


def add_to_cart(
    user_id: int,
    product_id: int,
    quantity: int,
    db: Session,
    size: str | None = None,
) -> None:
    if quantity < 1:
        raise HTTPException(status_code=400, detail="Количество должно быть не меньше 1")

    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")

    variants = (
        db.query(models.ProductVariant)
        .filter(models.ProductVariant.product_id == product_id)
        .all()
    )
    size_norm = _normalize_size(size)

    if variants:
        if not size_norm:
            raise HTTPException(status_code=400, detail="Выберите размер")
        variant = _get_variant(db, product_id, size_norm)
        if not variant:
            raise HTTPException(status_code=400, detail="Размер недоступен")
        if variant.stock < quantity:
            raise HTTPException(status_code=400, detail="Недостаточно товара на складе")
    else:
        size_norm = ""

    existing = (
        db.query(models.CartItem)
        .filter(
            models.CartItem.user_id == user_id,
            models.CartItem.product_id == product_id,
            models.CartItem.size == size_norm,
        )
        .first()
    )

    if existing:
        new_qty = existing.quantity + quantity
        if variants:
            variant = _get_variant(db, product_id, size_norm)
            if variant and variant.stock < new_qty:
                raise HTTPException(
                    status_code=400, detail="Недостаточно товара на складе"
                )
        existing.quantity = new_qty
    else:
        db.add(
            models.CartItem(
                user_id=user_id,
                product_id=product_id,
                quantity=quantity,
                size=size_norm,
            )
        )
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
            size=i.size or "",
        )
        for i in items
    ]


def remove_from_cart(user_id: int, item_id: int, db: Session) -> None:
    item = (
        db.query(models.CartItem)
        .filter(
            models.CartItem.id == item_id,
            models.CartItem.user_id == user_id,
        )
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Позиция не найдена")
    db.delete(item)
    db.commit()


def update_quantity(user_id: int, item_id: int, quantity: int, db: Session) -> None:
    item = (
        db.query(models.CartItem)
        .filter(
            models.CartItem.id == item_id,
            models.CartItem.user_id == user_id,
        )
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Позиция не найдена")

    if quantity > 0 and item.size:
        variant = _get_variant(db, item.product_id, item.size)
        if variant and variant.stock < quantity:
            raise HTTPException(status_code=400, detail="Недостаточно товара на складе")

    if quantity <= 0:
        db.delete(item)
    else:
        item.quantity = quantity
    db.commit()
