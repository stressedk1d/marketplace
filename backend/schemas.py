from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr

from models import OrderStatus


class ProductSort(str, Enum):
    price_asc = "price_asc"
    price_desc = "price_desc"
    name_asc = "name_asc"
    name_desc = "name_desc"
    popular = "popular"


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

class BrandBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    is_celebrity: bool = False


class CollectionBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str


class BrandResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    logo_url: Optional[str] = None
    is_celebrity: bool = False


class CollectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    description: Optional[str] = None
    brand_id: Optional[int] = None
    is_featured: bool = False
    brand: Optional[BrandBrief] = None


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    brand_id: Optional[int] = None
    collection_id: Optional[int] = None
    views_count: int = 0
    brand: Optional[BrandBrief] = None
    collection: Optional[CollectionBrief] = None


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    limit: int
    offset: int


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
    status: OrderStatus
    total_amount: float
    created_at: Optional[str] = None
    items: list[OrderItemResponse] = []


class CheckoutResponse(BaseModel):
    order_id: int
    status: OrderStatus
    total_amount: float
    items_count: int


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
