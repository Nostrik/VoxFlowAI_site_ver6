import logging
import sys
import os
from pathlib import Path
from colorlog import ColoredFormatter
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parent
LOG_FILE = ROOT_DIR / "project.log"
LOG_LEVEL = logging.INFO  # logging.DEBUG or logging.INFO


class Settings(BaseSettings):
    BOT_TOKEN: str
    CHAT_ID: str
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/database.db"
    model_config = SettingsConfigDict(env_file=".env")
    secret_key_app: str


settings = Settings()


def setup_logging():
    logging.getLogger("uvicorn").handlers = []
    logging.getLogger("uvicorn.access").handlers = []

    LOG_FILE = "app.log"

    # Используем прямые ANSI-коды для стабильности:
    # \033[33m - желтый
    # \033[0m  - сброс цвета
    console_format = (
        "\033[33m%(asctime)s\033[0m "  # Желтая дата
        "%(log_color)s[%(levelname)s] "  # Цветной уровень
        "\033[35m%(name)s\033[0m: "  # Фиолетовый (пурпурный) логгер
        "%(log_color)s%(message)s"  # Сообщение цветом уровня
    )

    formatter = ColoredFormatter(
        console_format,
        datefmt='%Y-%m-%d %H:%M:%S',
        reset=True,
        log_colors={
            'DEBUG': 'cyan',
            'INFO': 'green',
            'WARNING': 'yellow',
            'ERROR': 'red',
            'CRITICAL': 'bold_red,bg_white',
        }
    )

    # Остальная часть функции остается без изменений
    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setFormatter(formatter)

    file_handler = logging.FileHandler(LOG_FILE, encoding='utf-8')
    file_handler.setFormatter(logging.Formatter('%(asctime)s [%(levelname)s] %(name)s: %(message)s'))

    logger = logging.getLogger("app")
    logger.setLevel(logging.INFO)
    logger.addHandler(stream_handler)
    logger.addHandler(file_handler)

    logger.propagate = False
