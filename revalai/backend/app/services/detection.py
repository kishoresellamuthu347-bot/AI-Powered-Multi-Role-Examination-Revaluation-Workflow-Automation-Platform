import datetime as dt
from sqlalchemy.orm import Session
from .. import models


def detect_duplicate(db: Session, student_id: int, subject_id: int, exclude_id: int) -> bool:
    """Flags true if the same student already has another non-rejected
    application for the same subject."""
    existing = (
        db.query(models.RevaluationApplication)
        .filter(
            models.RevaluationApplication.student_id == student_id,
            models.RevaluationApplication.subject_id == subject_id,
            models.RevaluationApplication.id != exclude_id,
            models.RevaluationApplication.status != models.ApplicationStatus.rejected,
        )
        .first()
    )
    return existing is not None


def detect_anomaly(db: Session, application: models.RevaluationApplication) -> bool:
    """Flags true if the paid fee doesn't match the expected fee, or if
    documents were never uploaded before payment (real, checkable rules —
    not just randomness)."""
    expected_fee = 700
    if application.fee_paid and abs(application.fee_amount - expected_fee) > 0.01:
        return True
    if application.fee_paid and not application.documents_uploaded:
        return True
    return False
