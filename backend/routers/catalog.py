from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
from database import get_db
from schemas import ProductResponse
from services import catalog_service

router = APIRouter(tags=["catalog"])


@router.get("/products", response_model=list[ProductResponse])
def get_products(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
) -> list[ProductResponse]:
    return catalog_service.get_all_products(db, search=search)


@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)) -> ProductResponse:
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return ProductResponse.model_validate(product)
