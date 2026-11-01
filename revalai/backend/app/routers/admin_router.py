from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from .. import models, schemas, auth
from ..database import get_db
from ..services.audit import log_action

router = APIRouter(prefix="/admin", tags=["admin"])


def _require_admin(user: models.User = Depends(auth.require_roles("admin"))):
    return user


class CreateUserRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str
    department: str | None = None


@router.get("/users")
def list_users(user: models.User = Depends(_require_admin), db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return [{"id": u.id, "name": u.name, "email": u.email, "role": u.role.value, "department": u.department} for u in users]


@router.post("/users")
def create_user(payload: CreateUserRequest, user: models.User = Depends(_require_admin), db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(400, "A user with this email already exists")
    if payload.role not in [r.value for r in models.RoleEnum]:
        raise HTTPException(400, "Invalid role")
    new_user = models.User(
        name=payload.name, email=payload.email, role=payload.role,
        department=payload.department, hashed_password=auth.hash_password(payload.password),
    )
    db.add(new_user)
    db.commit()
    log_action(db, actor=user.name, action=f"Created user {payload.name} ({payload.role})", category="config")
    return {"status": "created", "id": new_user.id}


@router.get("/audit-logs", response_model=list[schemas.AuditLogOut])
def audit_logs(user: models.User = Depends(_require_admin), db: Session = Depends(get_db)):
    return db.query(models.AuditLog).order_by(models.AuditLog.created_at.desc()).limit(200).all()


@router.get("/analytics")
def analytics(user: models.User = Depends(_require_admin), db: Session = Depends(get_db)):
    total = db.query(models.RevaluationApplication).count()
    flagged = db.query(models.RevaluationApplication).filter(
        (models.RevaluationApplication.duplicate_flag == True) | (models.RevaluationApplication.anomaly_flag == True)  # noqa: E712
    ).count()
    by_status = {}
    for status in models.ApplicationStatus:
        by_status[status.value] = db.query(models.RevaluationApplication).filter(models.RevaluationApplication.status == status).count()
    evaluators = db.query(models.User).filter(models.User.role == models.RoleEnum.evaluator).count()
    return {
        "total_applications": total,
        "flagged": flagged,
        "active_evaluators": evaluators,
        "by_status": by_status,
    }


class RubricUpdate(BaseModel):
    id: int
    criterion: str
    max_marks: float


@router.get("/rubrics/{subject_id}")
def get_rubric(subject_id: int, user: models.User = Depends(_require_admin), db: Session = Depends(get_db)):
    return db.query(models.RubricCriterion).filter(models.RubricCriterion.subject_id == subject_id).all()


@router.put("/rubrics")
def update_rubric(items: list[RubricUpdate], user: models.User = Depends(_require_admin), db: Session = Depends(get_db)):
    for item in items:
        row = db.query(models.RubricCriterion).filter(models.RubricCriterion.id == item.id).first()
        if row:
            row.criterion = item.criterion
            row.max_marks = item.max_marks
    db.commit()
    log_action(db, actor=user.name, action="Updated rubric configuration", category="config")
    return {"status": "updated"}
