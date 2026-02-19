from contextlib import asynccontextmanager
from io import BytesIO

import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image as PILImage
from sentence_transformers import SentenceTransformer

import models
from database import SessionLocal, engine
from routers.ai_search import router as ai_router
from routers.auth import router as auth_router
from routers.cart import router as cart_router
from routers.catalog import router as catalog_router
from routers.orders import router as orders_router
from settings import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n[STARTUP] Запуск SAVEPOINT API...")
    if settings.auto_create_schema:
        models.Base.metadata.create_all(bind=engine)
    else:
        print("[DB] AUTO_CREATE_SCHEMA disabled, expecting Alembic migrations.")

    print("[AI] Загрузка нейросети CLIP...")
    model_ai = SentenceTransformer("clip-ViT-B-32")
    app.state.model_ai = model_ai
    print("[AI] Нейросеть готова!")

    db = SessionLocal()
    try:
        if not db.query(models.Product).first():
            print("[DB] Наполнение базы стартовыми товарами...")
            cat = models.Category(name="Одежда")
            db.add(cat)
            db.commit()
            db.refresh(cat)

            products_data = [
                {"name": "Белое худи", "url": "https://images.unsplash.com/photo-1564859228273-274232fdb516?w=600"},
                {"name": "Красные кроссовки", "url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"},
                {"name": "Черная косуха", "url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600"},
                {"name": "Синие джинсы", "url": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600"},
            ]

            headers = {"User-Agent": "Mozilla/5.0"}
            for product in products_data:
                emb = None
                try:
                    resp = requests.get(product["url"], headers=headers, timeout=5)
                    img = PILImage.open(BytesIO(resp.content)).convert("RGB")
                    emb = model_ai.encode(img)
                except Exception:
                    pass

                db.add(
                    models.Product(
                        name=product["name"],
                        description="Классика коллекции",
                        price=2900.0,
                        category_id=cat.id,
                        image_url=product["url"],
                        image_embedding=emb,
                    )
                )
            db.commit()
            print("[DB] Каталог инициализирован.")
    finally:
        db.close()

    print("[STARTUP] Система готова к работе!\n")
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
