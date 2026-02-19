from io import BytesIO

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from PIL import Image as PILImage
from sentence_transformers import util
from sqlalchemy.orm import Session

import models
from database import get_db

router = APIRouter()


@router.post("/ai/search")
async def ai_photo_search(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    model_ai = getattr(request.app.state, "model_ai", None)
    if model_ai is None:
        raise HTTPException(status_code=503, detail="ИИ загружается")

    image_data = await file.read()
    query_img = PILImage.open(BytesIO(image_data)).convert("RGB")
    query_embedding = model_ai.encode(query_img)

    all_products = db.query(models.Product).all()
    results = []

    for product in all_products:
        if product.image_embedding is not None:
            score = util.cos_sim(query_embedding, product.image_embedding).item()
            results.append((score, product))

    if not results:
        print("[AI] Предупреждение: база не проиндексирована, поиск недоступен.")
        return all_products[:3]

    results.sort(key=lambda x: x[0], reverse=True)
    return [product for score, product in results[:3]]
