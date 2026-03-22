from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

# 1. Создаем асинхронный движок (Engine)
engine = create_async_engine(
    "sqlite+aiosqlite:///./data/database.db",
    connect_args={"check_same_thread": False},
    echo=False
)

# 2. Создаем фабрику сессий
async_session = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)


# 3. Базовый класс для моделей
class Base(DeclarativeBase):
    pass


# 4. Dependency для FastAPI (получение сессии в эндпоинты)
async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
