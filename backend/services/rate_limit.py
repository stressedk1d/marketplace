"""In-memory rate limiting for demo (per-process)."""

from collections import defaultdict
from time import time

from fastapi import HTTPException

_buckets: dict[str, list[float]] = defaultdict(list)


def check_rate_limit(key: str, *, max_calls: int = 10, window_sec: int = 60) -> None:
    now = time()
    bucket = _buckets[key]
    _buckets[key] = [t for t in bucket if now - t < window_sec]
    if len(_buckets[key]) >= max_calls:
        raise HTTPException(
            status_code=429,
            detail="Слишком много запросов. Попробуйте позже.",
        )
    _buckets[key].append(now)
