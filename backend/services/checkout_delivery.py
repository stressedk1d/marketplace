"""Serialize checkout delivery fields into order.comment (JSON)."""

from __future__ import annotations

import json

from schemas import CheckoutRequest


def build_delivery_comment(body: CheckoutRequest | None) -> str | None:
    if body is None:
        return None

    payload: dict[str, str] = {}
    if body.full_name and body.full_name.strip():
        payload["full_name"] = body.full_name.strip()
    if body.phone and body.phone.strip():
        payload["phone"] = body.phone.strip()
    if body.city and body.city.strip():
        payload["city"] = body.city.strip()
    if body.address and body.address.strip():
        payload["address"] = body.address.strip()
    if body.pay_method and body.pay_method.strip():
        payload["pay_method"] = body.pay_method.strip()
    if body.comment and body.comment.strip():
        payload["user_comment"] = body.comment.strip()

    if not payload:
        return None
    return json.dumps(payload, ensure_ascii=False)
