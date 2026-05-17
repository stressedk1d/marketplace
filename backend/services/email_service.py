import logging
import smtplib
from email.mime.text import MIMEText
from email.utils import formataddr

from settings import settings

logger = logging.getLogger(__name__)


def is_smtp_configured() -> bool:
    return bool(settings.smtp_host and settings.smtp_user and settings.smtp_password)


def _smtp_envelope_from() -> str:
    """Адрес отправителя для SMTP (Gmail принимает только свой ящик или проверенный alias)."""
    return settings.smtp_user or settings.email_from


def _from_header() -> str:
    """Заголовок From: имя «VogueWay» и при необходимости отдельный адрес."""
    address = (settings.email_from_address or settings.email_from).strip()
    name = (settings.email_from_name or "").strip()
    if name:
        return formataddr((name, address))
    return address


def send_email(to_email: str, subject: str, body: str) -> bool:
    """
    Отправляет plain-text письмо через SMTP.
    Если SMTP не настроен — пишет текст в лог (удобно для локальной разработки).
  """
    if not is_smtp_configured():
        logger.warning(
            "[EMAIL FALLBACK] SMTP не настроен. Письмо для %s | тема: %s\n%s",
            to_email,
            subject,
            body,
        )
        print(f"[EMAIL FALLBACK] To: {to_email}\nSubject: {subject}\n{body}\n")
        return False

    envelope_from = _smtp_envelope_from()
    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = subject
    msg["From"] = _from_header()
    msg["To"] = to_email
    msg["Reply-To"] = envelope_from

    try:
        if settings.smtp_use_ssl:
            with smtplib.SMTP_SSL(
                settings.smtp_host, settings.smtp_port, timeout=15
            ) as server:
                server.login(settings.smtp_user, settings.smtp_password)
                server.sendmail(envelope_from, [to_email], msg.as_string())
        else:
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as server:
                server.ehlo()
                if settings.smtp_use_tls:
                    server.starttls()
                    server.ehlo()
                server.login(settings.smtp_user, settings.smtp_password)
                server.sendmail(envelope_from, [to_email], msg.as_string())
        return True
    except Exception:
        logger.exception("Не удалось отправить письмо на %s", to_email)
        print(f"[EMAIL ERROR] Не удалось отправить на {to_email}. Тема: {subject}")
        return False


def send_welcome_email(to_email: str, full_name: str | None) -> None:
    name = (full_name or "").strip() or "покупатель"
    body = (
        f"Здравствуйте, {name}!\n\n"
        "Добро пожаловать в VogueWay — вы успешно зарегистрировались.\n"
        "Теперь можно войти в аккаунт и оформлять заказы.\n\n"
        "Если вы не регистрировались — проигнорируйте это письмо.\n\n"
        "С уважением,\nкоманда VogueWay"
    )
    send_email(to_email, "VogueWay — добро пожаловать", body)


def send_order_confirmation_email(
    to_email: str,
    full_name: str | None,
    order_id: int,
    total_amount: float,
    items: list[tuple[str, int, float]],
) -> None:
    """items: (название, количество, цена за единицу на момент покупки)."""
    name = (full_name or "").strip() or "покупатель"
    lines = [
        f"Здравствуйте, {name}!",
        "",
        f"Вы оформили заказ №{order_id}.",
        f"Сумма: {total_amount:,.2f} ₽".replace(",", " "),
        "",
        "Состав заказа:",
    ]
    for product_name, quantity, price in items:
        line_sum = price * quantity
        lines.append(
            f"  • {product_name} — {quantity} шт. × {price:,.2f} ₽ = {line_sum:,.2f} ₽".replace(
                ",", " "
            )
        )
    lines.extend(
        [
            "",
            "Статус заказа можно посмотреть в личном кабинете после входа.",
            "",
            "Спасибо за покупку!",
            "VogueWay",
        ]
    )
    send_email(to_email, f"VogueWay — заказ №{order_id} оформлен", "\n".join(lines))
