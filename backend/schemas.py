from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    telegram_id: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class VerifyRequest(BaseModel):
    email: EmailStr
    verification_code: str


class AddToCart(BaseModel):
    product_id: int
    quantity: int = 1
