from sqladmin import Admin, ModelView
from app.models import Lead


def format_description(model, attribute):
    limit = 20
    if model.description and len(model.description) > limit:
        return f"{model.description[:limit]}..."
    return model.description


class LeadAdmin(ModelView, model=Lead):
    column_list = [c.name for c in Lead.__table__.columns]

    column_formatters = {
        Lead.description: format_description
    }
