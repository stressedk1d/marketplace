from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
from database import get_db
from deps import get_current_user
from schemas import CheckoutResponse, OrderResponse, OrderStatusUpdate
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


@router.patch("/orders/{order_id}/status", response_model=OrderResponse)
def patch_order_status(
    order_id: int,
    body: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> OrderResponse:
    """
    DEMO: статус может менять владелец заказа (имитация оплаты и доставки).
    В продакшене — отдельные роли (админ, webhook оплаты, служба доставки).
    """
    return orders_service.update_order_status(
        order_id,
        current_user.id,
        body.status,
        db,
    )
