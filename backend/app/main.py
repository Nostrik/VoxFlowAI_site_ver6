import os
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from sqladmin import Admin
from starlette.middleware.sessions import SessionMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from app.core.config import setup_logging, settings
from app.database import engine, Base
from app.routers import reviews
from app.routers import applications
from app.auth import authentication_backend
from app.middleware import log_requests_middleware
from app.admin.leads import LeadAdmin
from app.admin.reviews import ReviewAdmin
from app.admin.users import UserAdmin

load_dotenv()
APP_SECRET_KEY = os.getenv("SECRET_KEY_APP")
setup_logging()
logger = logging.getLogger(__name__)


# 1. Lifespan: действия при запуске и остановке приложения
@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


# 2. Инициализация приложения
app = FastAPI(
    title="voxflowai-api",
    description="Backend for FastAPI + SQLAlchemy + Telegram Bot",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    ProxyHeadersMiddleware,
    trusted_hosts="*"
)


@app.middleware("http")
async def add_logging(request: Request, call_next):
    return await log_requests_middleware(request, call_next)


# 3. Настройка CORS
# В .env BACKEND_CORS_ORIGINS=["http://localhost:3000", "https://yourdomain.com"]
origins = [str(origin) for origin in settings.BACKEND_CORS_ORIGINS]
app.add_middleware(
    SessionMiddleware,
    secret_key=APP_SECRET_KEY,
    https_only=True,
    same_site="none"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Разрешенные адреса фронтенда
    allow_credentials=True,           # Разрешить передачу Cookies/Auth-headers
    allow_methods=["*"],               # Разрешить все методы (GET, POST, etc.)
    allow_headers=["*"],               # Разрешить все заголовки
)


# 4. Тестовый роут
@app.get("/")
async def root():
    logger.info('get root is OK')
    return {"message": "FastAPI работает!"}


@app.get("/api/healthcheck")
async def health_check():
    logger.info('api/healthcheck is OK')
    return {"status": "ok", "database": "sqlite"}


# 5. Подключение роутеров
app.include_router(reviews.router, prefix="/api")
app.include_router(applications.router, prefix="/api")


# 6 Инициализируем админ-панель
admin = Admin(
    app=app,
    engine=engine,
    authentication_backend=authentication_backend,
    base_url="/admin",
)

# 7 Регистрируем представления
admin.add_view(LeadAdmin)
admin.add_view(ReviewAdmin)
admin.add_view(UserAdmin)
