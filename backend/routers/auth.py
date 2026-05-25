from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
from database import get_db
from deps import get_current_user
from schemas import (
    MessageResponse,
    ProfileResponse,
    ProfileUpdateRequest,
    TokenResponse,
    UserCreate,
    UserLogin,
)
from services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=MessageResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)) -> MessageResponse:
    auth_service.register_user(user_data.email, user_data.password, user_data.full_name, db)
    return MessageResponse(message="Регистрация успешна. Добро пожаловать!")


@router.post("/login", response_model=TokenResponse)
def login(user_data: UserLogin, db: Session = Depends(get_db)) -> TokenResponse:
    token = auth_service.login_user(user_data.email, user_data.password, db)
    return TokenResponse(access_token=token)


@router.get("/profile", response_model=ProfileResponse)
def get_profile(current_user: models.User = Depends(get_current_user)) -> ProfileResponse:
    result = auth_service.get_profile(current_user)
    return ProfileResponse(**result)


@router.patch("/profile", response_model=MessageResponse)
def update_profile(
    body: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> MessageResponse:
    auth_service.update_profile(current_user, body.full_name, body.current_password, body.new_password, db)
    return MessageResponse(message="Профиль обновлён")
