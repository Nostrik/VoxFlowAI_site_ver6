from sqladmin import Admin, ModelView
from app.models import Lead


class LeadAdmin(ModelView, model=Lead):
    column_list = [c.name for c in Lead.__table__.columns]
