from services.checkout_delivery import build_delivery_comment
from schemas import CheckoutRequest


def test_build_delivery_comment_serializes_fields() -> None:
    body = CheckoutRequest(
        full_name="Иван",
        phone="+79991234567",
        city="Москва",
        address="ул. Пример, 1",
        pay_method="card",
        comment="Позвонить",
    )
    raw = build_delivery_comment(body)
    assert raw is not None
    assert "Иван" in raw
    assert "Москва" in raw
    assert "card" in raw


def test_build_delivery_comment_empty() -> None:
    assert build_delivery_comment(None) is None
    assert build_delivery_comment(CheckoutRequest()) is None
