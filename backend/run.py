import uvicorn
# Импортируем функцию, которая возвращает словарь
from app.core.config import get_logging_config

if __name__ == "__main__":
    # Получаем готовый словарь конфигурации
    log_config_dict = get_logging_config()

    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_config=log_config_dict # Передаем СВОЙ конфиг
    )

