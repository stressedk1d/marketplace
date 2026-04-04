import enum
from datetime import UTC, datetime

from sqlalchemy import Boolean, Column, DateTime, Enum, Float, ForeignKey, Integer, PickleType, String, UniqueConstraint
from sqlalchemy.orm import relationship

from database import Base


class OrderStatus(str, enum.Enum):
    created = "created"
    paid = "paid"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    full_name = Column(String)
    is_verified = Column(Boolean, default=False)
    verification_code = Column(String, nullable=True)
    code_expires_at = Column(DateTime, nullable=True)

    cart_items = relationship("CartItem", back_populates="user")
    orders = relationship("Order", back_populates="user")
    wishlist_items = relationship("WishlistItem", back_populates="user")


class Brand(Base):
    __tablename__ = "brands"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    slug = Column(String, unique=True, nullable=False, index=True)
    logo_url = Column(String, nullable=True)
    is_celebrity = Column(Boolean, nullable=False, default=False)

    collections = relationship("Collection", back_populates="brand")
    products = relationship("Product", back_populates="brand")


class Collection(Base):
    __tablename__ = "collections"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    description = Column(String, nullable=True)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=True, index=True)
    is_featured = Column(Boolean, nullable=False, default=False)

    brand = relationship("Brand", back_populates="collections")
    products = relationship("Product", back_populates="collection")


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    image_url = Column(String)
    category_id = Column(Integer, ForeignKey("categories.id"))
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=True, index=True)
    collection_id = Column(Integer, ForeignKey("collections.id"), nullable=True, index=True)
    image_embedding = Column(PickleType, nullable=True)
    views_count = Column(Integer, nullable=False, default=0)

    category = relationship("Category", back_populates="products")
    brand = relationship("Brand", back_populates="products")
    collection = relationship("Collection", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")
    wishlist_entries = relationship("WishlistItem", back_populates="product")


class WishlistItem(Base):
    __tablename__ = "wishlist_items"
    __table_args__ = (
        UniqueConstraint("user_id", "product_id", name="uq_wishlist_user_product"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)

    user = relationship("User", back_populates="wishlist_items")
    product = relationship("Product", back_populates="wishlist_entries")


class CartItem(Base):
    __tablename__ = "cart_items"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)

    user = relationship("User", back_populates="cart_items")
    product = relationship("Product")


class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    status = Column(
        Enum(OrderStatus, native_enum=False, length=20),
        nullable=False,
        default=OrderStatus.created,
    )
    total_amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)
    price_at_purchase = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
