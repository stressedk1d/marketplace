from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from services import promo_service

router = APIRouter(tags=["promo"])


@router.get("/promo/validate")
def validate_promo(
    code: str = Query(..., min_length=2, max_length=32),
    subtotal: float = Query(..., ge=0),
    db: Session = Depends(get_db),
) -> dict:
    return promo_service.validate_promo(db, code, subtotal)
