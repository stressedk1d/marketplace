from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import MessageResponse, TokenResponse, UserCreate, UserLogin
from services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=MessageResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)) -> MessageResponse:
    auth_service.register_user(user_data.email, user_data.password, user_data.full_name, db)
    return MessageResponse(message="Регистрация успешна")


@router.post("/login", response_model=TokenResponse)
def login(user_data: UserLogin, db: Session = Depends(get_db)) -> TokenResponse:
    token = auth_service.login_user(user_data.email, user_data.password, db)
    return TokenResponse(access_token=token)
