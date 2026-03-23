from fastapi import HTTPException
from sqlalchemy.orm import Session

import models
import utils


def register_user(email: str, password: str, full_name: str, db: Session) -> None:
    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Пользователь уже существует")

    user = models.User(
        email=email,
        password_hash=utils.get_password_hash(password),
        full_name=full_name,
        is_verified=True,
    )
    db.add(user)
    db.commit()


def login_user(email: str, password: str, db: Session) -> str:
    """Returns JWT access token."""
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not utils.verify_password(password, user.password_hash):
        raise HTTPException(status_code=400, detail="Неверный email или пароль")
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Подтвердите аккаунт перед входом")

    return utils.create_access_token(data={"sub": user.email})
