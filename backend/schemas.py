from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

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


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MessageResponse(BaseModel):
    message: str


class ProfileUpdateRequest(BaseModel):
    full_name: str | None = None
    current_password: str | None = None
    new_password: str | None = None


class ProfileResponse(BaseModel):
    email: str
    full_name: str | None = None
    loyalty_points: int = 0


class CheckoutRequest(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    city: str | None = None
    address: str | None = None
    comment: str | None = None
    pay_method: str | None = None
    promo_code: str | None = None


class PromoValidateResponse(BaseModel):
    code: str | None
    discount: float
    subtotal: float
    total: float


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


class ProductVariantResponse(BaseModel):
    size: str
    stock: int


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    images: list[str] = Field(default_factory=list)
    category_id: Optional[int] = None
    brand_id: Optional[int] = None
    collection_id: Optional[int] = None
    views_count: int = 0
    product_type: str
    brand: Optional[BrandBrief] = None
    collection: Optional[CollectionBrief] = None
    avg_rating: Optional[float] = None
    review_count: int = 0
    variants: list[ProductVariantResponse] = Field(default_factory=list)


class FacetBrandCount(BaseModel):
    slug: str
    name: str = ""
    count: int
    selected: bool = False


class FacetProductTypeCount(BaseModel):
    value: str
    count: int
    selected: bool = False


class FacetPriceRangeCount(BaseModel):
    min: int
    max: Optional[int] = None
    count: int
    selected: bool = False


class ProductFacets(BaseModel):
    brands: list[FacetBrandCount] = Field(default_factory=list)
    product_types: list[FacetProductTypeCount] = Field(default_factory=list)
    price_ranges: list[FacetPriceRangeCount] = Field(default_factory=list)


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    limit: int
    offset: int
    facets: ProductFacets = Field(default_factory=ProductFacets)


# ── Cart ──────────────────────────────────────────────────────────────────────

class AddToCart(BaseModel):
    product_id: int
    quantity: int = 1
    size: Optional[str] = None


class UpdateCartQuantity(BaseModel):
    quantity: int


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    name: str
    price: float
    quantity: int
    image_url: Optional[str] = None
    size: str = ""


# ── Orders ────────────────────────────────────────────────────────────────────

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    name: Optional[str] = None
    image_url: Optional[str] = None
    quantity: int
    price_at_purchase: float
    size: str = ""


class OrderResponse(BaseModel):
    id: int
    status: OrderStatus
    total_amount: float
    discount_amount: float = 0
    promo_code: Optional[str] = None
    comment: Optional[str] = None
    created_at: Optional[str] = None
    items: list[OrderItemResponse] = []


class CheckoutResponse(BaseModel):
    order_id: int
    status: OrderStatus
    total_amount: float
    discount_amount: float = 0
    promo_code: Optional[str] = None
    loyalty_points_earned: int = 0
    items_count: int


class EmailLogResponse(BaseModel):
    id: int
    order_id: Optional[int] = None
    to_email: str
    subject: str
    body_preview: str
    sent: bool
    created_at: Optional[str] = None


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


# ── Reviews ──────────────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    text: str | None = None


class ReviewResponse(BaseModel):
    id: int
    user_id: int
    user_name: str | None = None
    product_id: int
    rating: int
    text: str | None = None
    created_at: str | None = None


# ── Admin ─────────────────────────────────────────────────────────────────────

class AdminMeResponse(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    is_admin: bool = True


class AdminStatsResponse(BaseModel):
    users_count: int
    products_count: int
    orders_count: int
    revenue_total: float


class AdminAnalyticsDay(BaseModel):
    date: str
    orders_count: int
    revenue: float


class AdminStatusCount(BaseModel):
    status: str
    count: int


class AdminAnalyticsResponse(BaseModel):
    days: list[AdminAnalyticsDay]
    orders_by_status: list[AdminStatusCount]


class AdminUserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    is_verified: bool
    is_admin: bool


class AdminOrderResponse(OrderResponse):
    user_id: int
    user_email: Optional[str] = None
    user_full_name: Optional[str] = None


# ── Site / maintenance ────────────────────────────────────────────────────────

class MaintenanceStatusResponse(BaseModel):
    enabled: bool
    message: str


class MaintenanceUpdateRequest(BaseModel):
    enabled: bool
    message: Optional[str] = None


# ── Admin product management ─────────────────────────────────────────────────

class AdminProductCreate(BaseModel):
    name: str
    description: str | None = None
    price: float
    image_url: str | None = None
    brand_id: int | None = None
    collection_id: int | None = None
    product_type: str = "clothing"

class AdminProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    image_url: str | None = None
    brand_id: int | None = None
    collection_id: int | None = None
    product_type: str | None = None
