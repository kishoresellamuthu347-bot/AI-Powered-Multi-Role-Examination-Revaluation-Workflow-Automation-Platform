from sqlalchemy.orm import Session
from .. import models


def log_action(db: Session, actor: str, action: str, category: str = "general", entity: str = None):
    entry = models.AuditLog(actor=actor, action=action, category=category, entity=entity)
    db.add(entry)
    db.commit()
    return entry
