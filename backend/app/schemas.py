from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class LeadBase(BaseModel):
    email: EmailStr
    company: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None


class LeadCreate(LeadBase):
    pass


class Lead(LeadBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewBase(BaseModel):
    name: str
    company: Optional[str] = None
    phone: Optional[str] = None
    review_text: str


class ReviewCreate(ReviewBase):
    pass


class Review(ReviewBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
