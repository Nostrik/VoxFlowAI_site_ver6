import asyncio
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.client.default import DefaultBotProperties
from aiogram.enums.parse_mode import ParseMode
from aiogram.filters import Command
from app.core.config import setup_logging, settings
from aiogram.client.session.aiohttp import AiohttpSession

setup_logging()
logger = logging.getLogger("app")

TOKEN = settings.BOT_TOKEN
CHAT_ID = settings.CHAT_ID

bot = Bot(token=TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
dp = Dispatcher()


@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    await message.answer(f"Привет, {message.from_user.full_name}! Я запущен в 🐳 <b>Docker</b>.")


async def on_startup(bot: Bot):
    if CHAT_ID:
        try:
            logger.info(f'Bot startup successful CHAT_ID is {CHAT_ID}')
            await bot.send_message(CHAT_ID, "🚀 <b>Контейнер запущен!</b> Бот онлайн.")
        except Exception as e:
            logger.error(f"Не удалось отправить уведомление: {e}")


async def main():
    dp.startup.register(on_startup)
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Бот выключен")
