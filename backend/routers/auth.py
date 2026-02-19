from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import utils
from database import get_db
from schemas import UserCreate, UserLogin, VerifyRequest

router = APIRouter()


@router.post("/register")
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Пользователь уже существует")

    code = utils.generate_code()
    utils.send_telegram_message(user_data.telegram_id, f"Ваш код: {code}")
    new_user = models.User(
        email=user_data.email,
        password_hash=utils.get_password_hash(user_data.password),
        full_name=user_data.full_name,
        telegram_id=user_data.telegram_id,
        verification_code=code,
    )
    db.add(new_user)
    db.commit()
    return {"message": "Успех"}


@router.post("/verify")
def verify_user(payload: VerifyRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    if user.verification_code != payload.verification_code:
        raise HTTPException(status_code=400, detail="Неверный код подтверждения")

    user.is_verified = True
    user.verification_code = None
    db.commit()
    return {"message": "Аккаунт подтвержден"}


@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if not user or not utils.verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Ошибка входа")
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Подтвердите аккаунт перед входом")
    token = utils.create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}
