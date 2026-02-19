from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import models
import utils
from database import Base, get_db
from routers.auth import router as auth_router
from routers.cart import router as cart_router
from routers.catalog import router as catalog_router
from routers.orders import router as orders_router


def _build_test_app(db_file: Path, monkeypatch):
    engine = create_engine(
        f"sqlite:///{db_file}",
        connect_args={"check_same_thread": False},
    )
    testing_session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    with testing_session_local() as db:
        category = models.Category(name="Test category")
        db.add(category)
        db.flush()
        db.add(
            models.Product(
                name="Test product",
                description="Test description",
                price=100.0,
                image_url="https://example.com/image.jpg",
                category_id=category.id,
                image_embedding=None,
            )
        )
        db.commit()

    app = FastAPI()
    app.include_router(auth_router)
    app.include_router(catalog_router)
    app.include_router(cart_router)
    app.include_router(orders_router)

    def override_get_db():
        db = testing_session_local()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    monkeypatch.setattr(utils, "send_telegram_message", lambda *_args, **_kwargs: {"ok": True})

    return app, testing_session_local


def test_auth_cart_orders_flow(tmp_path, monkeypatch):
    app, testing_session_local = _build_test_app(tmp_path / "test.db", monkeypatch)
    client = TestClient(app)

    email = "test@example.com"
    password = "StrongPass123"

    register_resp = client.post(
        "/register",
        json={
            "email": email,
            "password": password,
            "full_name": "Test User",
            "telegram_id": "123456789",
        },
    )
    assert register_resp.status_code == 200

    with testing_session_local() as db:
        user = db.query(models.User).filter(models.User.email == email).first()
        assert user is not None
        code = user.verification_code

    verify_resp = client.post(
        "/verify",
        json={
            "email": email,
            "verification_code": code,
        },
    )
    assert verify_resp.status_code == 200

    login_resp = client.post(
        "/login",
        json={
            "email": email,
            "password": password,
        },
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    products_resp = client.get("/products")
    assert products_resp.status_code == 200
    product_id = products_resp.json()[0]["id"]

    add_to_cart_resp = client.post(
        "/cart/add",
        headers=headers,
        json={"product_id": product_id, "quantity": 2},
    )
    assert add_to_cart_resp.status_code == 200

    cart_resp = client.get("/cart", headers=headers)
    assert cart_resp.status_code == 200
    cart_items = cart_resp.json()
    assert len(cart_items) == 1
    assert cart_items[0]["quantity"] == 2

    checkout_resp = client.post("/orders/checkout", headers=headers)
    assert checkout_resp.status_code == 200
    checkout_data = checkout_resp.json()
    assert checkout_data["items_count"] == 1
    assert checkout_data["total_amount"] == 200.0

    cart_after_checkout_resp = client.get("/cart", headers=headers)
    assert cart_after_checkout_resp.status_code == 200
    assert cart_after_checkout_resp.json() == []

    my_orders_resp = client.get("/orders/my", headers=headers)
    assert my_orders_resp.status_code == 200
    orders = my_orders_resp.json()
    assert len(orders) == 1
    assert orders[0]["total_amount"] == 200.0
    assert len(orders[0]["items"]) == 1
    assert orders[0]["items"][0]["product_id"] == product_id
