from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db
from ..ai_provider import get_ai_provider
from ..services.audit import log_action
from ..services.notify import notify_user

router = APIRouter(prefix="/evaluator", tags=["evaluator"])


def _require_evaluator(user: models.User = Depends(auth.require_roles("evaluator"))):
    return user


@router.get("/assignments", response_model=list[schemas.ApplicationOut])
def my_assignments(user: models.User = Depends(_require_evaluator), db: Session = Depends(get_db)):
    return (
        db.query(models.RevaluationApplication)
        .filter(models.RevaluationApplication.assigned_evaluator_id == user.id)
        .order_by(models.RevaluationApplication.created_at.desc())
        .all()
    )


def _get_owned_application(db: Session, application_id: int, evaluator_id: int) -> models.RevaluationApplication:
    app_row = (
        db.query(models.RevaluationApplication)
        .filter(models.RevaluationApplication.id == application_id, models.RevaluationApplication.assigned_evaluator_id == evaluator_id)
        .first()
    )
    if not app_row:
        raise HTTPException(404, "Application not found or not assigned to you")
    return app_row


@router.post("/applications/{application_id}/run-ai", response_model=schemas.AIAnalysisOut)
def run_ai(application_id: int, user: models.User = Depends(_require_evaluator), db: Session = Depends(get_db)):
    app_row = _get_owned_application(db, application_id, user.id)

    if app_row.status == models.ApplicationStatus.evaluator_assigned:
        app_row.status = models.ApplicationStatus.under_evaluation
        db.add(models.StatusHistory(application_id=app_row.id, status="Under Evaluation", actor=user.name))
        db.commit()

    existing = db.query(models.AIAnalysis).filter(models.AIAnalysis.application_id == application_id).first()
    if existing:
        return existing

    criteria = db.query(models.RubricCriterion).filter(models.RubricCriterion.subject_id == app_row.subject_id).all()
    provider = get_ai_provider()
    ocr_text = provider.run_ocr(app_row.code)
    suggested, max_marks, confidence, explanation = provider.analyze_answer(ocr_text, criteria)

    analysis = models.AIAnalysis(
        application_id=application_id, ocr_text=ocr_text, suggested_marks=suggested,
        max_marks=max_marks, confidence=confidence, explanation=explanation, provider=provider.name,
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    log_action(db, actor="AI System", action=f"Generated AI recommendation for {app_row.code} ({suggested}/{max_marks}, {int(confidence*100)}% confidence)", category="ai")
    return analysis


@router.post("/applications/{application_id}/submit", response_model=schemas.ApplicationOut)
def submit_evaluation(application_id: int, payload: schemas.SubmitEvaluationRequest, user: models.User = Depends(_require_evaluator), db: Session = Depends(get_db)):
    app_row = _get_owned_application(db, application_id, user.id)
    analysis = db.query(models.AIAnalysis).filter(models.AIAnalysis.application_id == application_id).first()

    deviated = bool(analysis and abs(payload.final_marks - analysis.suggested_marks) > 0.01)

    evaluation = models.Evaluation(
        application_id=application_id, evaluator_id=user.id, final_marks=payload.final_marks,
        comments=payload.comments, deviated_from_ai=deviated,
    )
    db.add(evaluation)

    app_row.revised_marks = payload.final_marks
    app_row.status = models.ApplicationStatus.officer_review
    db.add(models.StatusHistory(application_id=app_row.id, status="Officer Review", actor=user.name,
                                 note=f"Final marks: {payload.final_marks}" + (" (deviated from AI)" if deviated else "")))
    db.commit()

    log_action(db, actor=user.name, action=f"Submitted evaluation for {app_row.code}: {payload.final_marks} marks"
               + (" — deviated from AI suggestion" if deviated else ""), category="evaluation")
    notify_user(db, app_row.student_id, f"Evaluation completed for {app_row.code}. It is now under Officer Review for final approval.")
    db.refresh(app_row)
    return app_row
