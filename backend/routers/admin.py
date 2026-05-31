from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlalchemy.orm import Session

from database import get_db
from deps import get_current_admin
from models import User
from schemas import (
    AdminMeResponse,
    AdminOrderResponse,
    AdminProductCreate,
    AdminProductUpdate,
    AdminStatsResponse,
    AdminUserResponse,
    AdminAnalyticsResponse,
    MaintenanceStatusResponse,
    MaintenanceUpdateRequest,
    EmailLogResponse,
    MessageResponse,
    OrderResponse,
    OrderStatusUpdate,
    ProductResponse,
    ReviewResponse,
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


@router.get("/analytics", response_model=AdminAnalyticsResponse)
def admin_analytics(
    days: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> AdminAnalyticsResponse:
    return admin_service.get_analytics(db, days=days)


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


@router.post("/products", response_model=ProductResponse)
def admin_create_product(
    body: AdminProductCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> ProductResponse:
    return admin_service.create_product(body, db)


@router.patch("/products/{product_id}", response_model=ProductResponse)
def admin_update_product(
    product_id: int,
    body: AdminProductUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> ProductResponse:
    return admin_service.update_product(product_id, body, db)


@router.delete("/products/{product_id}", response_model=MessageResponse)
def admin_delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> MessageResponse:
    admin_service.delete_product(product_id, db)
    return MessageResponse(message="Товар удалён")


@router.get("/reviews", response_model=list[ReviewResponse])
def admin_list_reviews(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> list[ReviewResponse]:
    return admin_service.list_reviews(db, limit=limit, offset=offset)


@router.delete("/reviews/{review_id}", response_model=MessageResponse)
def admin_delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> MessageResponse:
    admin_service.delete_review(db, review_id)
    return MessageResponse(message="Отзыв удалён")


@router.get("/email-logs", response_model=list[EmailLogResponse])
def admin_email_logs(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> list[EmailLogResponse]:
    return admin_service.list_email_logs(db)


@router.post("/upload-image")
async def admin_upload_image(
    file: UploadFile = File(...),
    _: User = Depends(get_current_admin),
) -> dict:
    data = await file.read()
    if len(data) > 5 * 1024 * 1024:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Файл больше 5 МБ")
    url = admin_service.save_uploaded_image(data, file.filename or "image.jpg")
    return {"url": url}
