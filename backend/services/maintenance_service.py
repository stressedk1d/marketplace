from sqlalchemy import false as sa_false
from sqlalchemy.orm import Session

import models

SITE_CONFIG_ID = 1
DEFAULT_MESSAGE = (
    "Сайт временно недоступен — ведутся технические работы. Зайдите позже."
)


def ensure_site_config(db: Session) -> models.SiteConfig:
    config = db.query(models.SiteConfig).filter(models.SiteConfig.id == SITE_CONFIG_ID).first()
    if config:
        return config
    config = models.SiteConfig(
        id=SITE_CONFIG_ID,
        maintenance_enabled=sa_false(),
        maintenance_message=DEFAULT_MESSAGE,
    )
    db.add(config)
    db.commit()
    db.refresh(config)
    return config


def get_maintenance_status(db: Session) -> tuple[bool, str]:
    config = ensure_site_config(db)
    return bool(config.maintenance_enabled), config.maintenance_message or DEFAULT_MESSAGE


def set_maintenance(db: Session, enabled: bool, message: str | None = None) -> tuple[bool, str]:
    config = ensure_site_config(db)
    config.maintenance_enabled = enabled
    if message is not None:
        text = message.strip()
        if text:
            config.maintenance_message = text
    db.commit()
    db.refresh(config)
    return bool(config.maintenance_enabled), config.maintenance_message or DEFAULT_MESSAGE
