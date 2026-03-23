import asyncio
import socket
import sys

from aiogram import Bot, Dispatcher, types
from aiogram.client.session.aiohttp import AiohttpSession
from aiogram.filters import Command

from settings import settings


if not settings.telegram_bot_token:
    raise RuntimeError("TELEGRAM_BOT_TOKEN is not set")


class IPv4AiohttpSession(AiohttpSession):
    """
    Принудительно IPv4: через VPN/провайдера IPv6 к api.telegram.org часто рвётся (10054).
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._connector_init["family"] = socket.AF_INET


def _make_bot_session() -> IPv4AiohttpSession:
    proxy = settings.telegram_proxy
    if proxy:
        return IPv4AiohttpSession(proxy=proxy)
    return IPv4AiohttpSession()


bot = Bot(token=settings.telegram_bot_token, session=_make_bot_session())
dp = Dispatcher()


@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    chat_id = message.chat.id
    await message.answer(
        f"Привет! Твой Telegram ID: {chat_id}\n"
        f"Введи его на сайте при регистрации, чтобы получить код подтверждения."
    )


async def main():
    print("Бот запущен...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    # На Windows ProactorEventLoop иногда даёт SSL/таймауты к api.telegram.org через VPN;
    # SelectorEventLoop чаще стабильнее для aiohttp/aiogram.
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
