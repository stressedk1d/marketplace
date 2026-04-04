import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session

import models
from services import wishlist_service


def test_add_and_list(db: Session, test_user: models.User, test_product: models.Product):
    wishlist_service.add_to_wishlist(test_user.id, test_product.id, db)
    items = wishlist_service.get_wishlist(test_user.id, db)
    assert len(items) == 1
    assert items[0].id == test_product.id


def test_add_idempotent(db: Session, test_user: models.User, test_product: models.Product):
    wishlist_service.add_to_wishlist(test_user.id, test_product.id, db)
    wishlist_service.add_to_wishlist(test_user.id, test_product.id, db)
    items = wishlist_service.get_wishlist(test_user.id, db)
    assert len(items) == 1


def test_add_unknown_product(db: Session, test_user: models.User):
    with pytest.raises(HTTPException) as exc:
        wishlist_service.add_to_wishlist(test_user.id, 99999, db)
    assert exc.value.status_code == 404


def test_remove_idempotent(db: Session, test_user: models.User, test_product: models.Product):
    wishlist_service.add_to_wishlist(test_user.id, test_product.id, db)
    wishlist_service.remove_from_wishlist(test_user.id, test_product.id, db)
    assert wishlist_service.get_wishlist(test_user.id, db) == []
    wishlist_service.remove_from_wishlist(test_user.id, test_product.id, db)


def test_get_empty(db: Session, test_user: models.User):
    assert wishlist_service.get_wishlist(test_user.id, db) == []
