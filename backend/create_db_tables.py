# import asyncio
# from sqlalchemy import create_engine
# from app.database import Base
# from app.core.config import settings
#
# # Используйте синхронный URL для создания движка
# # URL должен выглядеть как 'sqlite:///./sql_app.db'
# SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL.replace("sqlite+aiosqlite", "sqlite")
#
# engine = create_engine(SQLALCHEMY_DATABASE_URL)
#
#
# def create_db_tables():
#     print("Создаю таблицы базы данных...")
#     Base.metadata.create_all(bind=engine)
#     print("Готово.")
#
#
# if __name__ == "__main__":
#     create_db_tables()
import asyncio
from sqlalchemy import create_engine
from app.database import Base
from app.core.config import settings

# 1. Отрезаем асинхронный драйвер, если он есть в строке
# Было: sqlite+aiosqlite:///... -> Стало: sqlite:///...
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL.replace("sqlite+aiosqlite", "sqlite")

# 2. Создаем синхронный движок
# connect_args нужны для SQLite, чтобы разрешить работу из разных потоков (FastAPI это любит)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)


def create_db_tables():
    print(f"Подключение к: {SQLALCHEMY_DATABASE_URL}")
    print("Создаю таблицы базы данных...")
    # Base.metadata.create_all — это синхронная операция
    Base.metadata.create_all(bind=engine)
    print("Готово.")


if __name__ == "__main__":
    create_db_tables()
