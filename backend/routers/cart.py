from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
from database import get_db
from deps import get_current_user
from schemas import AddToCart, CartItemResponse, MessageResponse
from services import cart_service

router = APIRouter(tags=["cart"])


@router.post("/cart/add", response_model=MessageResponse)
def add_to_cart(
    item: AddToCart,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> MessageResponse:
    cart_service.add_to_cart(current_user.id, item.product_id, item.quantity, db)
    return MessageResponse(message="Добавлено")


@router.get("/cart", response_model=list[CartItemResponse])
def get_cart(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> list[CartItemResponse]:
    return cart_service.get_cart(current_user.id, db)


@router.delete("/cart/{item_id}", response_model=MessageResponse)
def delete_cart_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> MessageResponse:
    cart_service.remove_from_cart(current_user.id, item_id, db)
    return MessageResponse(message="Удалено")
