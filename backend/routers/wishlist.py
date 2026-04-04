from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
from database import get_db
from deps import get_current_user
from schemas import MessageResponse, ProductResponse
from services import wishlist_service

router = APIRouter(tags=["wishlist"])


@router.get("/wishlist", response_model=list[ProductResponse])
def get_wishlist(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> list[ProductResponse]:
    return wishlist_service.get_wishlist(current_user.id, db)


@router.post("/wishlist/{product_id}", response_model=MessageResponse)
def add_wishlist_item(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> MessageResponse:
    return wishlist_service.add_to_wishlist(current_user.id, product_id, db)


@router.delete("/wishlist/{product_id}", response_model=MessageResponse)
def remove_wishlist_item(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> MessageResponse:
    return wishlist_service.remove_from_wishlist(current_user.id, product_id, db)
