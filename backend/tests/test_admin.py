import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session

import models
from deps import get_current_admin
from models import OrderStatus
from services import admin_service, cart_service, orders_service


def test_admin_stats(db: Session, test_user: models.User, test_product: models.Product):
    test_user.is_admin = True
    db.commit()

    stats = admin_service.get_stats(db)
    assert stats.users_count >= 1
    assert stats.products_count >= 1


def test_get_current_admin_requires_flag(db: Session, test_user: models.User):
    test_user.is_admin = False
    db.commit()

    with pytest.raises(HTTPException) as exc:
        get_current_admin(user=test_user)
    assert exc.value.status_code == 403


def test_admin_update_order_status(db: Session, test_user: models.User, test_product: models.Product):
    test_user.is_admin = True
    db.commit()

    cart_service.add_to_cart(test_user.id, test_product.id, 1, db)
    out = orders_service.checkout(test_user.id, db)
    updated = orders_service.admin_update_order_status(out.order_id, OrderStatus.paid, db)
    assert updated.status == OrderStatus.paid
