from fastapi import APIRouter, Depends, BackgroundTasks, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import Lead, LeadCreate
from app import crud
from app.services.telegram_notifier import send_new_lead_notification

router = APIRouter(prefix="/leads", tags=["Contact Forms"])


@router.post("/", response_model=Lead, status_code=status.HTTP_201_CREATED)
async def create_lead(
    lead_data: LeadCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Receives feedback form data and stores it in the database
    (which now sends a Telegram notification internally).
    """
    db_lead = await crud.create_lead(db=db, lead_data=lead_data)

    background_tasks.add_task(send_new_lead_notification, db_lead)

    return db_lead
