import asyncio
import logging
from aiogram import Bot
from datetime import datetime, timedelta
from aiogram.client.default import DefaultBotProperties
from aiogram.enums.parse_mode import ParseMode
from app.core.config import settings
from app.schemas import Lead, Review

logger = logging.getLogger("app")

bot = Bot(token=settings.BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
CHAT_ID = settings.CHAT_ID


async def send_new_lead_notification(lead: Lead):
    """
    Generates and sends a message to Telegram about a new request using the Lead object data.
    """
    if not CHAT_ID:
        logger.warning("CHAT_ID not installed in settings. No notification will be sent.")
        return

    moscow_time = datetime.now() + timedelta(hours=3)
    date_time_display = moscow_time.strftime("%d.%m.%Y %H:%M:%S")

    message_text = (
        f"🚀 <b>Новая заявка №{lead.id} ({date_time_display})</b>\n\n"
        f"📧 Email: {lead.email}\n"
        f"🏢 Компания: {lead.company}\n"
        f"📞 Телефон: {lead.phone}\n"
        f"📝 Описание: {lead.description}"
    )

    try:
        await asyncio.wait_for(
            bot.send_message(chat_id=CHAT_ID, text=message_text),
            timeout=5
        )
        logger.info(f"Notice for application {lead.id} successfully sent to Telegram.")
    except asyncio.TimeoutError:
        logger.error(f"Telegram timeout while sending notification for lead {lead.id}")
    except Exception as e:
        logger.error(f"Failed to send notification for application {lead.id}: {e}")


async def send_new_review_notification(review: Review):
    """
    Generates and sends a message to Telegram about a new review
    """
    if not CHAT_ID:
        logger.warning("CHAT_ID not installed in settings. No notification will be sent.")
        return

    moscow_time = datetime.now() + timedelta(hours=3)
    date_time_display = moscow_time.strftime("%d.%m.%Y %H:%M:%S")

    message_text = (
        f"🌟 <b>Новый отзыв №{review.id} ({date_time_display})</b>\n\n"
        f"👤 Имя: {review.name}\n"
        f"🏢 Компания: {review.company}\n"
        f"📞 Телефон: {review.phone}\n"
        f"📝 Отзыв: {review.review_text}"
    )

    try:
        await asyncio.wait_for(
            bot.send_message(chat_id=CHAT_ID, text=message_text),
            timeout=5
        )
        logger.info(f"Notice for review {review.id} successfully sent to Telegram.")
    except asyncio.TimeoutError:
        logger.error(f"Telegram timeout while sending notification for review {review.id}")
    except Exception as e:
        logger.error(f"Failed to send notification for application {review.id}: {e}")
