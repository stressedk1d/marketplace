import random
import smtplib
from datetime import UTC, datetime, timedelta
from email.mime.text import MIMEText

import bcrypt
import jwt

from settings import settings


SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def generate_code() -> str:
    return str(random.randint(100000, 999999))


def send_verification_email(to_email: str, code: str) -> None:
    """
    Отправляет код подтверждения на email через SMTP.
    Fallback: если SMTP не настроен — выводит код в лог.
    """
    if not settings.smtp_host or not settings.smtp_user:
        print(f"[EMAIL FALLBACK] Verification code for {to_email}: {code}")
        return

    msg = MIMEText(
        f"Ваш код подтверждения: {code}\n\n"
        f"Код действителен {settings.verification_code_ttl_minutes} минут.",
        "plain",
        "utf-8",
    )
    msg["Subject"] = "Код подтверждения"
    msg["From"] = settings.email_from
    msg["To"] = to_email

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(settings.smtp_user, settings.smtp_password)
        server.sendmail(settings.email_from, [to_email], msg.as_string())
