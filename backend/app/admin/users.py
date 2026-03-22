from sqladmin import Admin, ModelView
from app.models import User


class UserAdmin(ModelView, model=User):
    column_list = [c.name for c in User.__table__.columns]
