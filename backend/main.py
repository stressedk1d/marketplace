from contextlib import asynccontextmanager
from threading import Lock

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

import models
from database import SessionLocal
from routers.ai_search import router as ai_router
from routers.auth import router as auth_router
from routers.cart import router as cart_router
from routers.catalog import router as catalog_router
from routers.orders import router as orders_router
from settings import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n[STARTUP] Starting SAVEPOINT API...")
    print("[DB] Expecting schema managed by Alembic migrations.")

    # Lazy AI loading: model initializes only on first /ai/search request.
    app.state.model_ai = None
    app.state.ai_model_lock = Lock()

    db = SessionLocal()
    try:
        try:
            has_products = db.query(models.Product).first()
        except OperationalError as exc:
            raise RuntimeError(
                "Database schema is not initialized. Run migrations via "
                "'scripts\\migrate_backend.cmd' (or 'alembic upgrade head')."
            ) from exc

        if not has_products:
            print("[DB] Seeding initial catalog data...")
            category = models.Category(name="Clothes")
            db.add(category)
            db.commit()
            db.refresh(category)

            products_data = [
                {"name": "White hoodie", "url": "https://images.unsplash.com/photo-1564859228273-274232fdb516?w=600"},
                {"name": "Red sneakers", "url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"},
                {"name": "Black jacket", "url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600"},
                {"name": "Blue jeans", "url": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600"},
            ]

            for product in products_data:
                db.add(
                    models.Product(
                        name=product["name"],
                        description="Starter collection item",
                        price=2900.0,
                        category_id=category.id,
                        image_url=product["url"],
                        image_embedding=None,
                    )
                )
            db.commit()
            print("[DB] Catalog seeded.")
    finally:
        db.close()

    print("[STARTUP] API is ready.\n")
    yield


app = FastAPI(title="Savepoint API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(catalog_router)
app.include_router(cart_router)
app.include_router(orders_router)
app.include_router(ai_router)
