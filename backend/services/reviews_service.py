from fastapi import HTTPException
from sqlalchemy.orm import Session

import models
from schemas import ReviewResponse


def get_product_reviews(product_id: int, db: Session) -> list[ReviewResponse]:
    reviews = (
        db.query(models.Review)
        .filter(models.Review.product_id == product_id)
        .order_by(models.Review.created_at.desc())
        .all()
    )
    result = []
    for r in reviews:
        user = db.query(models.User).filter(models.User.id == r.user_id).first()
        result.append(ReviewResponse(
            id=r.id,
            user_id=r.user_id,
            user_name=user.full_name if user else None,
            product_id=r.product_id,
            rating=r.rating,
            text=r.text,
            created_at=r.created_at.isoformat() if r.created_at else None,
        ))
    return result


def create_review(user_id: int, product_id: int, rating: int, text: str | None, db: Session) -> ReviewResponse:
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")

    existing = db.query(models.Review).filter(
        models.Review.user_id == user_id,
        models.Review.product_id == product_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Вы уже оставили отзыв на этот товар")

    review = models.Review(
        user_id=user_id,
        product_id=product_id,
        rating=rating,
        text=text,
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    user = db.query(models.User).filter(models.User.id == user_id).first()
    return ReviewResponse(
        id=review.id,
        user_id=review.user_id,
        user_name=user.full_name if user else None,
        product_id=review.product_id,
        rating=review.rating,
        text=review.text,
        created_at=review.created_at.isoformat() if review.created_at else None,
    )
