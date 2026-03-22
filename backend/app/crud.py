import logging
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models import Lead, Review
from app.schemas import LeadCreate, ReviewCreate

logger = logging.getLogger(__name__)


async def create_lead(db: AsyncSession, lead_data: LeadCreate) -> Lead:
    """
    Creates a new request in the database.
    """
    db_lead = Lead(
        email=lead_data.email,
        company=lead_data.company,
        phone=lead_data.phone,
        description=lead_data.description
    )

    db.add(db_lead)
    await db.commit()
    await db.refresh(db_lead)

    logger.info(f"New application (Lead ID: {db_lead.id}) successfully added to DB.")

    return db_lead


async def get_leads(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Lead]:
    """
    Retrieves a paginated list of all requests from the database.
    """
    query = select(Lead).offset(skip).limit(limit)
    result = await db.execute(query)
    leads = result.scalars().all()

    logger.info(f"List of applications: {len(leads)} records (skip={skip}, limit={limit}).")

    return leads


async def create_review(db: AsyncSession, review_data: ReviewCreate) -> Review:
    """
    Creates a new review in the database.
    """
    db_review = Review(
        name=review_data.name,
        company=review_data.company,
        phone=review_data.phone,
        review_text=review_data.review_text
    )

    db.add(db_review)
    await db.commit()
    await db.refresh(db_review)

    logger.info(f"New review (Review ID: {db_review.id}) successfully added.")

    return db_review


async def get_reviews(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Review]:
    """
    Gets a paginated list of all reviews from the database.
    """
    query = select(Review).offset(skip).limit(limit)
    result = await db.execute(query)
    reviews = result.scalars().all()

    logger.info(f"List of reviews received: {len(reviews)} records (skip={skip}, limit={limit}).")

    return reviews


async def get_reviews_is_published_true(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Review]:
    """
    Gets a paginated list of published reviews ordered by newest first.
    """
    query = (
        select(Review)
        .where(Review.is_published.is_(True))
        .order_by(desc(Review.created_at))
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    reviews = result.scalars().all()

    logger.info(f"List of published reviews received: {len(reviews)} (skip={skip}, limit={limit}).")

    return reviews
