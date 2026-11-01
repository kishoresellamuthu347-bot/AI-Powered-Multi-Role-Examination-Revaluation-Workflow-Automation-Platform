from sqlalchemy.orm import Session
from .. import models


def notify_user(db: Session, user_id: int, message: str):
    n = models.Notification(user_id=user_id, message=message)
    db.add(n)
    db.commit()
    return n
