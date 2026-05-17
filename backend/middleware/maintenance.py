from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from database import SessionLocal
from services import maintenance_service

_MAINTENANCE_EXEMPT_PREFIXES = (
    "/site/status",
    "/auth/",
    "/admin/",
    "/docs",
    "/redoc",
    "/openapi.json",
)


class MaintenanceMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        if any(path.startswith(prefix) for prefix in _MAINTENANCE_EXEMPT_PREFIXES):
            return await call_next(request)

        db = SessionLocal()
        try:
            enabled, message = maintenance_service.get_maintenance_status(db)
        finally:
            db.close()

        if not enabled:
            return await call_next(request)

        return JSONResponse(
            status_code=503,
            content={
                "detail": message,
                "maintenance": True,
            },
        )
