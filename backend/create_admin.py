import asyncio
import getpass
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import User, hash_password, Base
from app.database import engine


async def create_admin_user():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    username = input("Username: ")
    password = getpass.getpass("Password: ")

    raw_password = password
    hashed_pwd = hash_password(raw_password)

    admin_user = User(
        username=username,
        hashed_password=hashed_pwd
    )

    async with AsyncSession(engine) as session:
        session.add(admin_user)
        try:
            await session.commit()
            print(f"User {username} successfully created with encrypted password.")
        except Exception as e:
            await session.rollback()
            print(f"Error creating user: {e}")


if __name__ == "__main__":
    asyncio.run(create_admin_user())
