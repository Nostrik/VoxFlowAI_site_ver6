from sqladmin import Admin, ModelView
from app.models import Review


def format_review_text(model, attribute):
    limit = 20
    if model.review_text and len(model.review_text) > limit:
        return f"{model.review_text[:limit]}..."
    return model.review_text


class ReviewAdmin(ModelView, model=Review):
    column_list = [c.name for c in Review.__table__.columns]

    column_formatters = {
        Review.review_text: format_review_text
    }
