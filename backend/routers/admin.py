from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from deps import get_current_admin
from models import User
from schemas import (
    AdminMeResponse,
    AdminOrderResponse,
    AdminStatsResponse,
    AdminUserResponse,
    MaintenanceStatusResponse,
    MaintenanceUpdateRequest,
    OrderResponse,
    OrderStatusUpdate,
)
from services import admin_service, maintenance_service, orders_service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/me", response_model=AdminMeResponse)
def admin_me(current_user: User = Depends(get_current_admin)) -> AdminMeResponse:
    return AdminMeResponse(
        email=current_user.email,
        full_name=current_user.full_name,
        is_admin=True,
    )


@router.get("/stats", response_model=AdminStatsResponse)
def admin_stats(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> AdminStatsResponse:
    return admin_service.get_stats(db)


@router.get("/orders", response_model=list[AdminOrderResponse])
def admin_orders(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> list[AdminOrderResponse]:
    return admin_service.list_orders(db, limit=limit, offset=offset)


@router.patch("/orders/{order_id}/status", response_model=OrderResponse)
def admin_patch_order_status(
    order_id: int,
    body: OrderStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> OrderResponse:
    return orders_service.admin_update_order_status(order_id, body.status, db)


@router.get("/users", response_model=list[AdminUserResponse])
def admin_users(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> list[AdminUserResponse]:
    return admin_service.list_users(db, limit=limit, offset=offset)


@router.get("/maintenance", response_model=MaintenanceStatusResponse)
def get_maintenance(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> MaintenanceStatusResponse:
    enabled, message = maintenance_service.get_maintenance_status(db)
    return MaintenanceStatusResponse(enabled=enabled, message=message)


@router.put("/maintenance", response_model=MaintenanceStatusResponse)
def set_maintenance(
    body: MaintenanceUpdateRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> MaintenanceStatusResponse:
    enabled, message = maintenance_service.set_maintenance(
        db, body.enabled, body.message
    )
    return MaintenanceStatusResponse(enabled=enabled, message=message)
