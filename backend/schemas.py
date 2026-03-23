from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    verification_code: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MessageResponse(BaseModel):
    message: str


# ── Catalog ───────────────────────────────────────────────────────────────────

class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    category_id: Optional[int] = None


# ── Cart ──────────────────────────────────────────────────────────────────────

class AddToCart(BaseModel):
    product_id: int
    quantity: int = 1


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    name: str
    price: float
    quantity: int
    image_url: Optional[str] = None


# ── Orders ────────────────────────────────────────────────────────────────────

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    name: Optional[str] = None
    image_url: Optional[str] = None
    quantity: int
    price_at_purchase: float


class OrderResponse(BaseModel):
    id: int
    status: str
    total_amount: float
    created_at: Optional[str] = None
    items: list[OrderItemResponse] = []


class CheckoutResponse(BaseModel):
    order_id: int
    status: str
    total_amount: float
    items_count: int
