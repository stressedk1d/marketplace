from fastapi import HTTPException
from sqlalchemy.orm import Session

import models
import utils
from services import email_service
from settings import settings


def _sync_admin_flag(user: models.User) -> None:
    if user.email and user.email.lower() in settings.admin_emails:
        user.is_admin = True


def register_user(email: str, password: str, full_name: str, db: Session) -> None:
    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Пользователь уже существует")

    user = models.User(
        email=email,
        password_hash=utils.get_password_hash(password),
        full_name=full_name,
        is_verified=True,
        is_admin=False,
        verification_code=None,
        code_expires_at=None,
    )
    _sync_admin_flag(user)
    db.add(user)
    db.commit()

    email_service.send_welcome_email(email, full_name)


def login_user(email: str, password: str, db: Session) -> str:
    """Returns JWT access token."""
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not utils.verify_password(password, user.password_hash):
        raise HTTPException(status_code=400, detail="Неверный email или пароль")

    if user.email.lower() in settings.admin_emails and not user.is_admin:
        user.is_admin = True
        db.commit()

    return utils.create_access_token(data={"sub": user.email})
