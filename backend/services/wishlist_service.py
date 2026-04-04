from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

import models
from schemas import MessageResponse, ProductResponse
from services.catalog_service import product_to_response


def _require_product(product_id: int, db: Session) -> models.Product:
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return product


def add_to_wishlist(user_id: int, product_id: int, db: Session) -> MessageResponse:
    _require_product(product_id, db)
    existing = (
        db.query(models.WishlistItem)
        .filter(
            models.WishlistItem.user_id == user_id,
            models.WishlistItem.product_id == product_id,
        )
        .first()
    )
    if existing:
        return MessageResponse(message="Уже в избранном")
    db.add(models.WishlistItem(user_id=user_id, product_id=product_id))
    db.commit()
    return MessageResponse(message="Добавлено в избранное")


def remove_from_wishlist(user_id: int, product_id: int, db: Session) -> MessageResponse:
    row = (
        db.query(models.WishlistItem)
        .filter(
            models.WishlistItem.user_id == user_id,
            models.WishlistItem.product_id == product_id,
        )
        .first()
    )
    if row:
        db.delete(row)
        db.commit()
    return MessageResponse(message="Удалено из избранного")


def get_wishlist(user_id: int, db: Session) -> list[ProductResponse]:
    rows = (
        db.query(models.WishlistItem)
        .options(
            joinedload(models.WishlistItem.product).joinedload(models.Product.brand),
            joinedload(models.WishlistItem.product).joinedload(models.Product.collection),
        )
        .filter(models.WishlistItem.user_id == user_id)
        .order_by(models.WishlistItem.id.desc())
        .all()
    )
    products = [r.product for r in rows if r.product is not None]
    return [product_to_response(p) for p in products]
