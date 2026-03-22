import re
import logging
from fastapi import Request

logger = logging.getLogger(__name__)
SENSITIVE_PATTERN = re.compile(
    r'((?:"password"|password)\s*[:=]\s*)'
    r'("[^"]+"|[^\s&]+)',
    re.IGNORECASE
)


async def log_requests_middleware(request: Request, call_next):
    body = await request.body()

    if body:
        try:
            decoded_body = body.decode('utf-8')
            # Заменяем только Группу 2 (значение) на звезды
            masked_body = SENSITIVE_PATTERN.sub(r'\1"*******"', decoded_body)
            logger.info(f"Payload: {masked_body}")
        except Exception:
            logger.info("Payload: [binary data]")

    async def receive():
        return {"type": "http.request", "body": body}

    request._receive = receive
    return await call_next(request)
