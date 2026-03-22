FROM python:3.11-slim

# Обновляем версию до 2.0.1
ENV POETRY_VERSION=2.0.1 \
    POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_CREATE=false \
    # Добавляем кэш для ускорения сборки
    POETRY_CACHE_DIR='/tmp/poetry_cache'

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Ставим Poetry через pip (это чище для Docker)
RUN pip install "poetry==$POETRY_VERSION"

WORKDIR /app

# Копируем и lock-файл, чтобы версии пакетов были идентичны вашей разработке
COPY pyproject.toml poetry.lock* ./

# Устанавливаем зависимости (без кэша в итоговом слое)
RUN poetry install --no-root && rm -rf $POETRY_CACHE_DIR

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
