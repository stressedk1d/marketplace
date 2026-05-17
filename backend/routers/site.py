from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import MaintenanceStatusResponse
from services import maintenance_service

router = APIRouter(prefix="/site", tags=["site"])


@router.get("/status", response_model=MaintenanceStatusResponse)
def site_status(db: Session = Depends(get_db)) -> MaintenanceStatusResponse:
    enabled, message = maintenance_service.get_maintenance_status(db)
    return MaintenanceStatusResponse(enabled=enabled, message=message)
