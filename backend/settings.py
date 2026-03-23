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


class Settings:
    secret_key: str = os.getenv("SECRET_KEY", "change-me-in-env")
    algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    telegram_bot_token: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    # Опционально: socks5://127.0.0.1:1080 — если VPN даёт локальный прокси (нужен пакет aiohttp-socks)
    telegram_proxy: str | None = (os.getenv("TELEGRAM_PROXY") or "").strip() or None
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

    # Comma-separated list: http://localhost:3000,http://127.0.0.1:3000
    cors_origins_raw: str = os.getenv("CORS_ORIGINS", "http://localhost:3000")

    # Для локальных путей /images/... при скачивании картинок на бэкенде (ИИ-поиск, эмбеддинги)
    frontend_base_url: str = os.getenv("FRONTEND_BASE_URL", "http://127.0.0.1:3000")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins_raw.split(",") if origin.strip()]


settings = Settings()
