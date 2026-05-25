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


def get_profile(user: models.User) -> dict:
    return {"email": user.email, "full_name": user.full_name}


def update_profile(
    user: models.User,
    full_name: str | None,
    current_password: str | None,
    new_password: str | None,
    db: Session,
) -> None:
    if full_name is not None:
        user.full_name = full_name
    if new_password:
        if not current_password or not utils.verify_password(current_password, user.password_hash):
            raise HTTPException(status_code=400, detail="Текущий пароль неверен")
        user.password_hash = utils.get_password_hash(new_password)
    db.commit()
