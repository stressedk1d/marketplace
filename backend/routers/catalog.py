from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
from database import get_db

router = APIRouter()


@router.get("/products")
def get_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()
