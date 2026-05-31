from fastapi import HTTPException
from sqlalchemy.orm import Session

import models


def calc_discount(
    db: Session, code: str | None, subtotal: float
) -> tuple[float, str | None]:
    if not code or not code.strip():
        return 0.0, None

    promo = (
        db.query(models.PromoCode)
        .filter(
            models.PromoCode.code == code.strip().upper(),
            models.PromoCode.is_active.is_(True),
        )
        .first()
    )
    if not promo:
        raise HTTPException(status_code=400, detail="Промокод не найден")

    if subtotal < float(promo.min_order_amount or 0):
        raise HTTPException(
            status_code=400,
            detail=f"Минимальная сумма заказа для промокода — {int(promo.min_order_amount)} ₽",
        )

    discount = 0.0
    if promo.discount_percent:
        discount = round(subtotal * float(promo.discount_percent) / 100, 2)
    elif promo.discount_fixed:
        discount = min(subtotal, float(promo.discount_fixed))

    return max(0.0, discount), promo.code


def validate_promo(db: Session, code: str, subtotal: float) -> dict:
    discount, applied = calc_discount(db, code, subtotal)
    return {
        "code": applied,
        "discount": discount,
        "subtotal": subtotal,
        "total": round(subtotal - discount, 2),
    }
