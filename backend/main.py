from contextlib import asynccontextmanager
from threading import Lock

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError, ProgrammingError

import models
from database import SessionLocal
from seed_catalog import seed_catalog
from middleware.maintenance import MaintenanceMiddleware
from routers.admin import router as admin_router
from routers.ai_search import router as ai_router
from routers.auth import router as auth_router
from routers.cart import router as cart_router
from routers.catalog import router as catalog_router
from routers.orders import router as orders_router
from routers.site import router as site_router
from routers.reviews import router as reviews_router
from routers.promo import router as promo_router
from routers.wishlist import router as wishlist_router
from services import maintenance_service
from settings import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n[STARTUP] Starting VogueWay API...")
    print("[DB] Expecting schema managed by Alembic migrations.")

    # Lazy AI loading: model initializes only on first /ai/search request.
    app.state.model_ai = None
    app.state.ai_model_lock = Lock()

    db = SessionLocal()
    try:
        try:
            db.query(models.Product).first()
        except (OperationalError, ProgrammingError) as exc:
            raise RuntimeError(
                "База не готова: выполните миграции из папки backend "
                "(alembic upgrade head или scripts\\migrate_backend.cmd) "
                "и проверьте DATABASE_URL в .env."
            ) from exc

        # Демо-каталог Recrent (картинки из frontend/public/images/products)
        seed_catalog(db)
        maintenance_service.ensure_site_config(db)

        if settings.admin_emails:
            updated = 0
            for user in db.query(models.User).all():
                if user.email and user.email.lower() in settings.admin_emails and not user.is_admin:
                    user.is_admin = True
                    updated += 1
            if updated:
                db.commit()
                print(f"[DB] Promoted {updated} user(s) to admin.")
    finally:
        db.close()

    print("[STARTUP] API is ready.\n")
    yield


app = FastAPI(title="VogueWay API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(MaintenanceMiddleware)

app.include_router(site_router)
app.include_router(admin_router)
app.include_router(auth_router)
app.include_router(catalog_router)
app.include_router(cart_router)
app.include_router(orders_router)
app.include_router(reviews_router)
app.include_router(wishlist_router)
app.include_router(ai_router)
app.include_router(promo_router)
