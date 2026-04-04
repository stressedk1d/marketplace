import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session

import models
import utils
from models import OrderStatus
from services import auth_service, cart_service, orders_service


# ── Auth ──────────────────────────────────────────────────────────────────────

def test_register_success(db: Session):
    auth_service.register_user("new@example.com", "pass123", "New User", db)
    user = db.query(models.User).filter(models.User.email == "new@example.com").first()
    assert user is not None
    assert user.is_verified is True
    assert user.full_name == "New User"


def test_register_duplicate_email(db: Session, test_user: models.User):
    with pytest.raises(HTTPException) as exc:
        auth_service.register_user(test_user.email, "pass123", "Another", db)
    assert exc.value.status_code == 400


def test_login_success(db: Session, test_user: models.User):
    token = auth_service.login_user(test_user.email, "password123", db)
    assert isinstance(token, str)
    assert len(token) > 0


def test_login_wrong_password(db: Session, test_user: models.User):
    with pytest.raises(HTTPException) as exc:
        auth_service.login_user(test_user.email, "wrongpassword", db)
    assert exc.value.status_code == 400


def test_login_nonexistent_user(db: Session):
    with pytest.raises(HTTPException) as exc:
        auth_service.login_user("ghost@example.com", "pass123", db)
    assert exc.value.status_code == 400


# ── Cart ──────────────────────────────────────────────────────────────────────

def test_add_to_cart(db: Session, test_user: models.User, test_product: models.Product):
    cart_service.add_to_cart(test_user.id, test_product.id, 2, db)
    items = cart_service.get_cart(test_user.id, db)
    assert len(items) == 1
    assert items[0].quantity == 2
    assert items[0].product_id == test_product.id


def test_add_to_cart_increments_quantity(db: Session, test_user: models.User, test_product: models.Product):
    cart_service.add_to_cart(test_user.id, test_product.id, 1, db)
    cart_service.add_to_cart(test_user.id, test_product.id, 3, db)
    items = cart_service.get_cart(test_user.id, db)
    assert items[0].quantity == 4


def test_get_cart_empty(db: Session, test_user: models.User):
    items = cart_service.get_cart(test_user.id, db)
    assert items == []


def test_remove_from_cart(db: Session, test_user: models.User, test_product: models.Product):
    cart_service.add_to_cart(test_user.id, test_product.id, 1, db)
    items = cart_service.get_cart(test_user.id, db)
    cart_service.remove_from_cart(test_user.id, items[0].id, db)
    assert cart_service.get_cart(test_user.id, db) == []


def test_remove_nonexistent_cart_item(db: Session, test_user: models.User):
    with pytest.raises(HTTPException) as exc:
        cart_service.remove_from_cart(test_user.id, 9999, db)
    assert exc.value.status_code == 404


# ── Orders ────────────────────────────────────────────────────────────────────

def test_checkout_success(db: Session, test_user: models.User, test_product: models.Product):
    cart_service.add_to_cart(test_user.id, test_product.id, 2, db)
    result = orders_service.checkout(test_user.id, db)

    assert result.order_id is not None
    assert result.status == "created"
    assert result.total_amount == test_product.price * 2
    assert result.items_count == 1


def test_checkout_clears_cart(db: Session, test_user: models.User, test_product: models.Product):
    cart_service.add_to_cart(test_user.id, test_product.id, 1, db)
    orders_service.checkout(test_user.id, db)
    assert cart_service.get_cart(test_user.id, db) == []


def test_checkout_empty_cart(db: Session, test_user: models.User):
    with pytest.raises(HTTPException) as exc:
        orders_service.checkout(test_user.id, db)
    assert exc.value.status_code == 400


def test_get_user_orders(db: Session, test_user: models.User, test_product: models.Product):
    cart_service.add_to_cart(test_user.id, test_product.id, 1, db)
    orders_service.checkout(test_user.id, db)

    orders = orders_service.get_user_orders(test_user.id, db)
    assert len(orders) == 1
    assert len(orders[0].items) == 1
    assert orders[0].items[0].price_at_purchase == test_product.price


def test_status_flow_created_to_delivered(db: Session, test_user: models.User, test_product: models.Product):
    cart_service.add_to_cart(test_user.id, test_product.id, 1, db)
    out = orders_service.checkout(test_user.id, db)
    oid = out.order_id

    orders_service.update_order_status(oid, test_user.id, OrderStatus.paid, db)
    orders_service.update_order_status(oid, test_user.id, OrderStatus.shipped, db)
    orders_service.update_order_status(oid, test_user.id, OrderStatus.delivered, db)

    orders = orders_service.get_user_orders(test_user.id, db)
    assert orders[0].status == OrderStatus.delivered


def test_status_cancel_from_created(db: Session, test_user: models.User, test_product: models.Product):
    cart_service.add_to_cart(test_user.id, test_product.id, 1, db)
    oid = orders_service.checkout(test_user.id, db).order_id
    orders_service.update_order_status(oid, test_user.id, OrderStatus.cancelled, db)
    assert orders_service.get_user_orders(test_user.id, db)[0].status == OrderStatus.cancelled


def test_status_delivered_cannot_cancel(db: Session, test_user: models.User, test_product: models.Product):
    cart_service.add_to_cart(test_user.id, test_product.id, 1, db)
    oid = orders_service.checkout(test_user.id, db).order_id
    for s in (OrderStatus.paid, OrderStatus.shipped, OrderStatus.delivered):
        orders_service.update_order_status(oid, test_user.id, s, db)
    with pytest.raises(HTTPException) as exc:
        orders_service.update_order_status(oid, test_user.id, OrderStatus.cancelled, db)
    assert exc.value.status_code == 400


def test_status_wrong_user_forbidden(db: Session, test_user: models.User, test_product: models.Product):
    cart_service.add_to_cart(test_user.id, test_product.id, 1, db)
    oid = orders_service.checkout(test_user.id, db).order_id
    other = models.User(
        email="other@example.com",
        password_hash=utils.get_password_hash("x"),
        full_name="O",
        is_verified=True,
    )
    db.add(other)
    db.commit()
    db.refresh(other)
    with pytest.raises(HTTPException) as exc:
        orders_service.update_order_status(oid, other.id, OrderStatus.paid, db)
    assert exc.value.status_code == 403


def test_status_invalid_transition(db: Session, test_user: models.User, test_product: models.Product):
    cart_service.add_to_cart(test_user.id, test_product.id, 1, db)
    oid = orders_service.checkout(test_user.id, db).order_id
    with pytest.raises(HTTPException) as exc:
        orders_service.update_order_status(oid, test_user.id, OrderStatus.shipped, db)
    assert exc.value.status_code == 400
