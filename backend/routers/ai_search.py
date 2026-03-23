from io import BytesIO

import requests
from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from PIL import Image as PILImage
from sentence_transformers import SentenceTransformer, util
from sqlalchemy.orm import Session

import models
from database import get_db
from settings import settings


def _resolve_image_url(url: str) -> str:
    if url.startswith("http://") or url.startswith("https://"):
        return url
    if url.startswith("/"):
        base = settings.frontend_base_url.rstrip("/")
        return f"{base}{url}"
    return url

router = APIRouter()


def _get_or_load_model(request: Request) -> SentenceTransformer:
    model_ai = getattr(request.app.state, "model_ai", None)
    if model_ai is not None:
        return model_ai

    lock = request.app.state.ai_model_lock
    with lock:
        model_ai = getattr(request.app.state, "model_ai", None)
        if model_ai is None:
            print("[AI] Lazy loading CLIP model...")
            model_ai = SentenceTransformer("clip-ViT-B-32")
            request.app.state.model_ai = model_ai
            print("[AI] CLIP model loaded.")
    return model_ai


def _ensure_catalog_embeddings(db: Session, model_ai: SentenceTransformer) -> None:
    products = db.query(models.Product).all()
    headers = {"User-Agent": "Mozilla/5.0"}
    updated = False

    for product in products:
        if product.image_embedding is not None:
            continue
        if not product.image_url:
            continue

        try:
            resp = requests.get(_resolve_image_url(product.image_url), headers=headers, timeout=5)
            img = PILImage.open(BytesIO(resp.content)).convert("RGB")
            product.image_embedding = model_ai.encode(img)
            updated = True
        except Exception:
            # Keep nullable embedding; item will be skipped in similarity ranking.
            continue

    if updated:
        db.commit()


@router.post("/ai/search")
async def ai_photo_search(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    model_ai = _get_or_load_model(request)

    image_data = await file.read()
    query_img = PILImage.open(BytesIO(image_data)).convert("RGB")
    query_embedding = model_ai.encode(query_img)

    _ensure_catalog_embeddings(db, model_ai)

    all_products = db.query(models.Product).all()
    results = []
    for product in all_products:
        if product.image_embedding is None:
            continue
        score = util.cos_sim(query_embedding, product.image_embedding).item()
        results.append((score, product))

    if not results:
        print("[AI] Catalog has no embeddings yet, returning fallback products.")
        return all_products[:3]

    results.sort(key=lambda x: x[0], reverse=True)
    return [product for score, product in results[:3]]
