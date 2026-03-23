from sqlalchemy.orm import Session

import models
from services import catalog_service


def test_get_all_products(db: Session, test_product: models.Product):
    result = catalog_service.get_all_products(db)
    assert len(result) == 1
    assert result[0].id == test_product.id
    assert result[0].price == test_product.price


def test_get_all_products_empty(db: Session):
    result = catalog_service.get_all_products(db)
    assert result == []


def test_search_by_name(db: Session, test_product: models.Product):
    result = catalog_service.get_all_products(db, search="Test")
    assert len(result) == 1
    assert result[0].name == test_product.name


def test_search_by_description(db: Session, test_product: models.Product):
    result = catalog_service.get_all_products(db, search="Description")
    assert len(result) == 1


def test_search_no_match(db: Session, test_product: models.Product):
    result = catalog_service.get_all_products(db, search="nonexistent_xyz")
    assert result == []


def test_search_case_insensitive(db: Session, test_product: models.Product):
    result = catalog_service.get_all_products(db, search="test product")
    assert len(result) == 1


def test_get_product_by_id(db: Session, test_product: models.Product):
    product = db.query(models.Product).filter(models.Product.id == test_product.id).first()
    assert product is not None
    assert product.id == test_product.id
    assert product.name == test_product.name


def test_get_product_by_id_not_found(db: Session):
    product = db.query(models.Product).filter(models.Product.id == 9999).first()
    assert product is None
