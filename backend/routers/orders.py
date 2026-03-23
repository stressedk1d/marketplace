from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
from database import get_db
from deps import get_current_user
from schemas import CheckoutResponse, OrderResponse
from services import orders_service

router = APIRouter(tags=["orders"])


@router.post("/orders/checkout", response_model=CheckoutResponse)
def checkout(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> CheckoutResponse:
    return orders_service.checkout(current_user.id, db)


@router.get("/orders/my", response_model=list[OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> list[OrderResponse]:
    return orders_service.get_user_orders(current_user.id, db)
