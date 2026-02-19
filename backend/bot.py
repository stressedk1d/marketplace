import asyncio

from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command

from settings import settings


if not settings.telegram_bot_token:
    raise RuntimeError("TELEGRAM_BOT_TOKEN is not set")

bot = Bot(token=settings.telegram_bot_token)
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
    asyncio.run(main())
