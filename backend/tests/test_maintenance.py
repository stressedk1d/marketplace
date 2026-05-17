from sqlalchemy.orm import Session

from services import maintenance_service


def test_maintenance_toggle(db: Session):
    maintenance_service.ensure_site_config(db)
    enabled, _ = maintenance_service.set_maintenance(db, True, "Тестовое сообщение")
    assert enabled is True
    enabled2, msg = maintenance_service.get_maintenance_status(db)
    assert enabled2 is True
    assert "Тестовое" in msg

    enabled3, _ = maintenance_service.set_maintenance(db, False)
    assert enabled3 is False
