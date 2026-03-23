import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

import models
import utils
from database import Base


@pytest.fixture(scope="function")
def db() -> Session:
    """Чистая in-memory SQLite сессия для каждого теста."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(bind=engine)
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def test_user(db: Session) -> models.User:
    """Зарегистрированный и верифицированный пользователь."""
    user = models.User(
        email="user@example.com",
        password_hash=utils.get_password_hash("password123"),
        full_name="Test User",
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_product(db: Session) -> models.Product:
    """Товар в каталоге."""
    category = models.Category(name="Test Category")
    db.add(category)
    db.flush()

    product = models.Product(
        name="Test Product",
        description="Description",
        price=100.0,
        image_url="/images/test.png",
        category_id=category.id,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product
