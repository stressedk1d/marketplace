from contextlib import asynccontextmanager
from threading import Lock

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

import models
from database import SessionLocal
from seed_recrent import seed_recrent_catalog
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
            db.query(models.Product).first()
        except OperationalError as exc:
            raise RuntimeError(
                "Database schema is not initialized. Run migrations via "
                "'scripts\\migrate_backend.cmd' (or 'alembic upgrade head')."
            ) from exc

        # Демо-каталог Recrent (картинки из frontend/public/images/products)
        seed_recrent_catalog(db)
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
