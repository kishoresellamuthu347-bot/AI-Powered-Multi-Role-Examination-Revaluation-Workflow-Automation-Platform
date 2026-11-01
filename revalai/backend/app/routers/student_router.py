from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db
from ..services.detection import detect_duplicate, detect_anomaly
from ..services.audit import log_action
from ..services.notify import notify_user

router = APIRouter(prefix="/student", tags=["student"])


def _require_student(user: models.User = Depends(auth.require_roles("student"))):
    return user


@router.get("/results", response_model=list[schemas.ResultOut])
def my_results(user: models.User = Depends(_require_student), db: Session = Depends(get_db)):
    return db.query(models.Result).filter(models.Result.student_id == user.id).all()


@router.get("/applications", response_model=list[schemas.ApplicationOut])
def my_applications(user: models.User = Depends(_require_student), db: Session = Depends(get_db)):
    return (
        db.query(models.RevaluationApplication)
        .filter(models.RevaluationApplication.student_id == user.id)
        .order_by(models.RevaluationApplication.created_at.desc())
        .all()
    )


@router.post("/apply", response_model=schemas.ApplicationOut)
def apply(payload: schemas.ApplyRequest, user: models.User = Depends(_require_student), db: Session = Depends(get_db)):
    result = db.query(models.Result).filter(models.Result.id == payload.result_id, models.Result.student_id == user.id).first()
    if not result:
        raise HTTPException(404, "Result not found")
    if not result.eligible_for_revaluation:
        raise HTTPException(400, "This subject is not eligible for revaluation")

    count = db.query(models.RevaluationApplication).count()
    code = f"REV-2026-{1041 + count}"

    app_row = models.RevaluationApplication(
        code=code,
        student_id=user.id,
        subject_id=result.subject_id,
        result_id=result.id,
        status=models.ApplicationStatus.submitted,
        fee_amount=700,
        documents_uploaded=payload.documents_uploaded,
    )
    db.add(app_row)
    db.commit()
    db.refresh(app_row)

    db.add(models.StatusHistory(application_id=app_row.id, status="Submitted", actor=user.name))
    db.commit()

    log_action(db, actor=user.name, action=f"Submitted application {app_row.code}", category="submit")
    return app_row


@router.post("/applications/{application_id}/pay", response_model=schemas.ApplicationOut)
def pay(application_id: int, user: models.User = Depends(_require_student), db: Session = Depends(get_db)):
    app_row = _get_owned_application(db, application_id, user.id)
    if app_row.fee_paid:
        raise HTTPException(400, "Fee already paid")

    app_row.fee_paid = True
    app_row.status = models.ApplicationStatus.ai_screening
    db.add(models.StatusHistory(application_id=app_row.id, status="AI Screening", actor="System", note="Payment confirmed"))
    db.commit()

    # Real duplicate/anomaly detection runs at this point in the lifecycle
    app_row.duplicate_flag = detect_duplicate(db, user.id, app_row.subject_id, app_row.id)
    app_row.anomaly_flag = detect_anomaly(db, app_row)
    app_row.status = models.ApplicationStatus.pending_verification
    db.add(models.StatusHistory(
        application_id=app_row.id, status="Pending Verification", actor="AI System",
        note="Duplicate/anomaly screening complete" + (" — flag raised" if (app_row.duplicate_flag or app_row.anomaly_flag) else "")
    ))
    db.commit()
    db.refresh(app_row)

    if app_row.duplicate_flag or app_row.anomaly_flag:
        log_action(db, actor="AI System", action=f"Flagged {app_row.code} ("
                   + ",".join([f for f, v in [("duplicate", app_row.duplicate_flag), ("anomaly", app_row.anomaly_flag)] if v]) + ")",
                   category="ai")
    log_action(db, actor=user.name, action=f"Paid revaluation fee for {app_row.code}", category="submit")
    notify_user(db, user.id, f"Payment confirmed for {app_row.code}. Your application is now under screening.")
    return app_row


def _get_owned_application(db: Session, application_id: int, student_id: int) -> models.RevaluationApplication:
    app_row = (
        db.query(models.RevaluationApplication)
        .filter(models.RevaluationApplication.id == application_id, models.RevaluationApplication.student_id == student_id)
        .first()
    )
    if not app_row:
        raise HTTPException(404, "Application not found")
    return app_row


@router.get("/notifications", response_model=list[schemas.NotificationOut])
def my_notifications(user: models.User = Depends(_require_student), db: Session = Depends(get_db)):
    return (
        db.query(models.Notification)
        .filter(models.Notification.user_id == user.id)
        .order_by(models.Notification.created_at.desc())
        .all()
    )
