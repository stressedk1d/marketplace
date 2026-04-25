from collections.abc import Generator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

import models
from database import Base, get_db
from routers.auth import router as auth_router
from routers.cart import router as cart_router
from routers.catalog import router as catalog_router
from routers.orders import router as orders_router


@pytest.fixture(scope="function")
def client() -> Generator[TestClient, None, None]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db() -> Generator[Session, None, None]:
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app = FastAPI(title="Smoke Test API")
    app.include_router(auth_router)
    app.include_router(catalog_router)
    app.include_router(cart_router)
    app.include_router(orders_router)
    app.dependency_overrides[get_db] = override_get_db

    seed = TestingSessionLocal()
    try:
        brand = models.Brand(
            name="Smoke Brand",
            slug="smoke-brand",
            logo_url="/images/brands/smoke-brand/logo.svg",
            is_celebrity=False,
        )
        other_brand = models.Brand(
            name="Second Brand",
            slug="second-brand",
            logo_url="/images/brands/second-brand/logo.svg",
            is_celebrity=False,
        )
        category = models.Category(name="Smoke Category")
        seed.add_all([brand, other_brand, category])
        seed.flush()

        collection = models.Collection(
            name="Smoke Collection",
            slug="smoke-collection",
            description="Smoke collection for API checks",
            brand_id=brand.id,
            is_featured=True,
        )
        seed.add(collection)
        seed.flush()

        product = models.Product(
            name="Smoke Product",
            description="Smoke product description",
            price=1999.0,
            image_url="/images/products/smoke-product.webp",
            category_id=category.id,
            brand_id=brand.id,
            collection_id=collection.id,
            product_type=models.ProductType.shoes,
        )
        product_2 = models.Product(
            name="Smoke Product 2",
            description="Smoke product description 2",
            price=2499.0,
            image_url="/images/products/smoke-product-2.webp",
            category_id=category.id,
            brand_id=other_brand.id,
            collection_id=collection.id,
            product_type=models.ProductType.clothing,
        )
        seed.add_all([product, product_2])
        seed.commit()
    finally:
        seed.close()

    with TestClient(app) as test_client:
        yield test_client

    Base.metadata.drop_all(bind=engine)
    engine.dispose()


def _register_and_login(client: TestClient) -> str:
    register_payload = {
        "email": "smoke@example.com",
        "password": "smoke-pass-123",
        "full_name": "Smoke User",
    }
    register_res = client.post("/auth/register", json=register_payload)
    assert register_res.status_code == 200

    login_res = client.post(
        "/auth/login",
        json={"email": register_payload["email"], "password": register_payload["password"]},
    )
    assert login_res.status_code == 200
    token = login_res.json().get("access_token")
    assert isinstance(token, str) and token
    return token


def test_get_products_returns_200_and_structure(client: TestClient) -> None:
    res = client.get("/products")

    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, dict)
    assert set(data.keys()) == {"items", "total", "limit", "offset", "facets"}
    assert isinstance(data["items"], list)
    assert isinstance(data["total"], int)
    assert isinstance(data["limit"], int)
    assert isinstance(data["offset"], int)
    assert isinstance(data["facets"], dict)
    assert isinstance(data["facets"]["brands"], list)
    assert isinstance(data["facets"]["product_types"], list)
    assert isinstance(data["facets"]["price_ranges"], list)
    assert len(data["items"]) >= 1
    first = data["items"][0]
    assert isinstance(first["id"], int)
    assert isinstance(first["name"], str)
    assert isinstance(first["price"], (int, float))
    assert isinstance(first["image_url"], str)


def test_get_brands_returns_200(client: TestClient) -> None:
    res = client.get("/brands")

    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_get_collections_returns_200(client: TestClient) -> None:
    res = client.get("/collections")

    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_get_orders_without_token_returns_401(client: TestClient) -> None:
    res = client.get("/orders/my")

    assert res.status_code == 401


def test_full_auth_cart_checkout_orders_flow(client: TestClient) -> None:
    token = _register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    products_res = client.get("/products")
    assert products_res.status_code == 200
    product_id = products_res.json()["items"][0]["id"]

    add_res = client.post(
        "/cart/add",
        json={"product_id": product_id, "quantity": 2},
        headers=headers,
    )
    assert add_res.status_code == 200
    cart_res = client.get("/cart", headers=headers)
    assert cart_res.status_code == 200
    cart_items = cart_res.json()
    assert len(cart_items) == 1
    assert cart_items[0]["product_id"] == product_id
    assert cart_items[0]["quantity"] == 2

    checkout_res = client.post("/orders/checkout", headers=headers)
    assert checkout_res.status_code == 200
    checkout_data = checkout_res.json()
    assert checkout_data["status"] == "created"
    assert checkout_data["items_count"] >= 1
    assert checkout_data["total_amount"] > 0

    orders_res = client.get("/orders/my", headers=headers)
    assert orders_res.status_code == 200
    orders = orders_res.json()
    assert isinstance(orders, list)
    assert len(orders) == 1
    assert orders[0]["status"] == "created"
    assert len(orders[0]["items"]) >= 1
    cart_after_checkout = client.get("/cart", headers=headers)
    assert cart_after_checkout.status_code == 200
    assert cart_after_checkout.json() == []


def test_products_min_price_greater_than_max_price_returns_400(client: TestClient) -> None:
    res = client.get("/products?min_price=1000&max_price=100")

    assert res.status_code == 400


def test_products_limit_zero_returns_422(client: TestClient) -> None:
    res = client.get("/products?limit=0")

    assert res.status_code == 422


def test_products_pagination_limit_and_offset(client: TestClient) -> None:
    page = client.get("/products?limit=1&offset=1")

    assert page.status_code == 200
    data = page.json()
    assert data["limit"] == 1
    assert data["offset"] == 1
    assert len(data["items"]) == 1


def test_products_unknown_brand_slug_returns_empty_list(client: TestClient) -> None:
    res = client.get("/products?brand_slug=unknown-brand-slug")

    assert res.status_code == 200
    data = res.json()
    assert data["items"] == []
    assert data["total"] == 0


def test_products_facets_counts(client: TestClient) -> None:
    res = client.get("/products")
    assert res.status_code == 200
    facets = res.json()["facets"]

    brands = {item["slug"]: item["count"] for item in facets["brands"]}
    product_types = {item["value"]: item["count"] for item in facets["product_types"]}
    price_ranges = {(item["min"], item["max"]): item["count"] for item in facets["price_ranges"]}

    assert brands["smoke-brand"] == 1
    assert brands["second-brand"] == 1
    assert product_types["shoes"] == 1
    assert product_types["clothing"] == 1
    assert price_ranges[(300, None)] == 2


def test_products_filter_by_brand_slug(client: TestClient) -> None:
    res = client.get("/products?brand_slug=smoke-brand")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["brand"]["slug"] == "smoke-brand"
    # Facets for brand are counted without current brand filter.
    brand_facets = {item["slug"]: item["count"] for item in data["facets"]["brands"]}
    assert brand_facets["smoke-brand"] == 1
    assert brand_facets["second-brand"] == 1
    selected_brand = next(item for item in data["facets"]["brands"] if item["slug"] == "smoke-brand")
    assert selected_brand["selected"] is True


def test_products_filter_by_product_type(client: TestClient) -> None:
    res = client.get("/products?product_type=shoes")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["product_type"] == "shoes"
    # Facets for product type are counted without current product_type filter.
    type_facets = {item["value"]: item["count"] for item in data["facets"]["product_types"]}
    assert type_facets["shoes"] == 1
    assert type_facets["clothing"] == 1
    selected_type = next(item for item in data["facets"]["product_types"] if item["value"] == "shoes")
    assert selected_type["selected"] is True
    assert data["facets"]["brands"]
    assert data["facets"]["price_ranges"]


def test_products_invalid_product_type_returns_400(client: TestClient) -> None:
    res = client.get("/products?product_type=invalid")
    assert res.status_code == 400
