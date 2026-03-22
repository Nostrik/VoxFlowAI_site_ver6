from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from starlette.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

import os
from dotenv import load_dotenv

from app.models import User
from app.database import engine

load_dotenv()
APP_SECRET_KEY = os.getenv("SECRET_KEY_APP")


class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool | RedirectResponse:
        form = await request.form()
        username = form.get("username")
        password = form.get("password")

        async with AsyncSession(engine) as session:
            stmt = select(User).where(User.username == username)
            result = await session.execute(stmt)
            user = result.scalar_one_or_none()

            if user and user.verify_password(password):
                request.session.update({"token": "authenticated", "user_id": user.id})

                return RedirectResponse(
                    url=request.url_for("admin:list", identity="lead"),
                    status_code=302
                )

        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        token = request.session.get("token")
        if not token:
            print("Authenticate failed: No token in session")
            return False
        print(f"Authenticate successful: Token found: {token}")
        return True


authentication_backend = AdminAuth(secret_key=APP_SECRET_KEY)
