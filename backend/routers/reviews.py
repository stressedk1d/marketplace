from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
from database import get_db
from deps import get_current_user
from schemas import ReviewCreate, ReviewResponse
from services import reviews_service

router = APIRouter(tags=["reviews"])


@router.get("/products/{product_id}/reviews", response_model=list[ReviewResponse])
def get_reviews(product_id: int, db: Session = Depends(get_db)) -> list[ReviewResponse]:
    return reviews_service.get_product_reviews(product_id, db)


@router.post("/products/{product_id}/reviews", response_model=ReviewResponse)
def create_review(
    product_id: int,
    body: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> ReviewResponse:
    return reviews_service.create_review(current_user.id, product_id, body.rating, body.text, db)
