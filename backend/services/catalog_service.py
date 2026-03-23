from typing import Optional
from sqlalchemy.orm import Session

import models
from schemas import ProductResponse


def get_all_products(db: Session, search: Optional[str] = None) -> list[ProductResponse]:
    query = db.query(models.Product)
    if search:
        term = f"%{search.lower()}%"
        query = query.filter(
            models.Product.name.ilike(term) | models.Product.description.ilike(term)
        )
    return [ProductResponse.model_validate(p) for p in query.all()]
