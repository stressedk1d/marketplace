import os
from pathlib import Path


def _load_dotenv_if_present() -> None:
    env_path = Path(__file__).resolve().parent / ".env"
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


_load_dotenv_if_present()

_BACKEND_ROOT = Path(__file__).resolve().parent


def _normalize_database_url(url: str) -> str:
    """Фиксирует путь к SQLite относительно папки backend (cwd при запуске uvicorn может быть любым)."""
    if url.startswith("sqlite:///./"):
        relative = url[len("sqlite:///./") :]
        absolute = (_BACKEND_ROOT / relative).resolve()
        return f"sqlite:///{absolute.as_posix()}"
    return url


class Settings:
    secret_key: str = os.getenv("SECRET_KEY", "change-me-in-env")
    algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    database_url: str = _normalize_database_url(os.getenv("DATABASE_URL", "sqlite:///./sql_app.db"))

    # SMTP (регистрация, подтверждение email, уведомления о заказах)
    smtp_host: str = os.getenv("SMTP_HOST", "")
    smtp_port: int = int(os.getenv("SMTP_PORT", "587"))
    smtp_user: str = os.getenv("SMTP_USER", "")
    smtp_password: str = os.getenv("SMTP_PASSWORD", "")
    smtp_use_tls: bool = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
    smtp_use_ssl: bool = os.getenv("SMTP_USE_SSL", "false").lower() == "true"
    # Адрес в SMTP-конверте (для Gmail — тот же, что SMTP_USER)
    email_from: str = os.getenv("EMAIL_FROM", os.getenv("SMTP_USER", "noreply@example.com"))
    # Имя в поле «От кого» в почтовом клиенте (например VogueWay)
    email_from_name: str = os.getenv("EMAIL_FROM_NAME", "VogueWay")
    # Опционально: другой адрес в заголовке From (нужен alias в Gmail → «Отправка от имени»)
    email_from_address: str = os.getenv("EMAIL_FROM_ADDRESS", "")

    # Verification code TTL in minutes
    verification_code_ttl_minutes: int = int(os.getenv("VERIFICATION_CODE_TTL_MINUTES", "10"))
    debug: bool = os.getenv("DEBUG", "true").lower() == "true"

    # Comma-separated list: http://localhost:3000,http://127.0.0.1:3000
    cors_origins_raw: str = os.getenv("CORS_ORIGINS", "http://localhost:3000")

    # Для локальных путей /images/... при скачивании картинок на бэкенде (ИИ-поиск, эмбеддинги)
    frontend_base_url: str = os.getenv("FRONTEND_BASE_URL", "http://127.0.0.1:3000")

    # Email-адреса администраторов (через запятую)
    admin_emails_raw: str = os.getenv("ADMIN_EMAILS", "")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins_raw.split(",") if origin.strip()]

    @property
    def admin_emails(self) -> set[str]:
        return {e.strip().lower() for e in self.admin_emails_raw.split(",") if e.strip()}


settings = Settings()
