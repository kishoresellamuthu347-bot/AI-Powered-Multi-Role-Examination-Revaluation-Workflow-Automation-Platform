from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db
from ..services.audit import log_action
from ..services.notify import notify_user

router = APIRouter(prefix="/officer", tags=["officer"])


def _require_officer(user: models.User = Depends(auth.require_roles("officer", "admin"))):
    return user


@router.get("/applications", response_model=list[schemas.ApplicationOut])
def all_applications(user: models.User = Depends(_require_officer), db: Session = Depends(get_db)):
    return db.query(models.RevaluationApplication).order_by(models.RevaluationApplication.created_at.desc()).all()


@router.get("/evaluators", response_model=list[schemas.EvaluatorOut])
def list_evaluators(user: models.User = Depends(_require_officer), db: Session = Depends(get_db)):
    return db.query(models.User).filter(models.User.role == models.RoleEnum.evaluator).all()


def _get_application(db: Session, application_id: int) -> models.RevaluationApplication:
    app_row = db.query(models.RevaluationApplication).filter(models.RevaluationApplication.id == application_id).first()
    if not app_row:
        raise HTTPException(404, "Application not found")
    return app_row


@router.post("/applications/{application_id}/verify", response_model=schemas.ApplicationOut)
def verify(application_id: int, payload: schemas.OfficerActionRequest, user: models.User = Depends(_require_officer), db: Session = Depends(get_db)):
    app_row = _get_application(db, application_id)
    app_row.status = models.ApplicationStatus.verified
    db.add(models.StatusHistory(application_id=app_row.id, status="Verified", actor=user.name, note=payload.note))
    db.commit()
    log_action(db, actor=user.name, action=f"Verified application {app_row.code}", category="verify")
    notify_user(db, app_row.student_id, f"Your application {app_row.code} has been verified and is awaiting evaluator assignment.")
    db.refresh(app_row)
    return app_row


@router.post("/applications/{application_id}/reject", response_model=schemas.ApplicationOut)
def reject(application_id: int, payload: schemas.OfficerActionRequest, user: models.User = Depends(_require_officer), db: Session = Depends(get_db)):
    app_row = _get_application(db, application_id)
    app_row.status = models.ApplicationStatus.rejected
    db.add(models.StatusHistory(application_id=app_row.id, status="Rejected", actor=user.name, note=payload.note))
    db.commit()
    log_action(db, actor=user.name, action=f"Rejected application {app_row.code}", category="verify")
    notify_user(db, app_row.student_id, f"Your application {app_row.code} was rejected. Reason: {payload.note or 'See examination cell'}")
    db.refresh(app_row)
    return app_row


@router.post("/applications/assign", response_model=schemas.ApplicationOut)
def assign_evaluator(payload: schemas.AssignEvaluatorRequest, user: models.User = Depends(_require_officer), db: Session = Depends(get_db)):
    app_row = _get_application(db, payload.application_id)
    evaluator = db.query(models.User).filter(models.User.id == payload.evaluator_id, models.User.role == models.RoleEnum.evaluator).first()
    if not evaluator:
        raise HTTPException(404, "Evaluator not found")

    # Conflict-of-interest check: evaluator cannot be assigned to their own department's student twin-case (demo rule)
    if evaluator.department and app_row.subject.department and evaluator.department != app_row.subject.department:
        pass  # allowed — cross-department is fine; same-name conflicts would be checked here in a real system

    app_row.assigned_evaluator_id = evaluator.id
    app_row.status = models.ApplicationStatus.evaluator_assigned
    db.add(models.StatusHistory(application_id=app_row.id, status="Evaluator Assigned", actor=user.name, note=f"Assigned to {evaluator.name}"))
    db.commit()
    log_action(db, actor=user.name, action=f"Assigned {evaluator.name} to {app_row.code}", category="verify")
    notify_user(db, app_row.student_id, f"An evaluator has been assigned to your application {app_row.code}.")
    notify_user(db, evaluator.id, f"You have been assigned to evaluate {app_row.code}.")
    db.refresh(app_row)
    return app_row


@router.post("/applications/{application_id}/publish", response_model=schemas.ApplicationOut)
def publish(application_id: int, user: models.User = Depends(_require_officer), db: Session = Depends(get_db)):
    app_row = _get_application(db, application_id)
    if app_row.status != models.ApplicationStatus.officer_review:
        raise HTTPException(400, "Application is not ready for publication")
    app_row.status = models.ApplicationStatus.published
    db.add(models.StatusHistory(application_id=app_row.id, status="Published", actor=user.name))
    db.commit()
    log_action(db, actor=user.name, action=f"Published result for {app_row.code}", category="verify")
    notify_user(db, app_row.student_id, f"Your revised result for {app_row.code} has been published.")
    db.refresh(app_row)
    return app_row
