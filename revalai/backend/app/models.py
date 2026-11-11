import enum
import datetime as dt
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text, Enum
)
from sqlalchemy.orm import relationship
from .database import Base


def now():
    return dt.datetime.utcnow()


class RoleEnum(str, enum.Enum):
    student = "student"
    evaluator = "evaluator"
    officer = "officer"
    admin = "admin"


class ApplicationStatus(str, enum.Enum):
    submitted = "Submitted"
    ai_screening = "AI Screening"
    pending_verification = "Pending Verification"
    verified = "Verified"
    evaluator_assigned = "Evaluator Assigned"
    under_evaluation = "Under Evaluation"
    officer_review = "Officer Review"
    published = "Published"
    rejected = "Rejected"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    department = Column(String, nullable=True)
    roll_number = Column(String, nullable=True)
    created_at = Column(DateTime, default=now)

    applications = relationship("RevaluationApplication", back_populates="student",
                                 foreign_keys="RevaluationApplication.student_id")


class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True)
    code = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    department = Column(String, nullable=True)


class Result(Base):
    __tablename__ = "results"
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    marks = Column(Float, nullable=False)
    max_marks = Column(Float, default=100)
    eligible_for_revaluation = Column(Boolean, default=True)

    student = relationship("User")
    subject = relationship("Subject")


class RubricCriterion(Base):
    __tablename__ = "rubric_criteria"
    id = Column(Integer, primary_key=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    question_label = Column(String, nullable=False)
    criterion = Column(String, nullable=False)
    max_marks = Column(Float, nullable=False)


class QuestionPaper(Base):
    __tablename__ = "question_papers"
    id = Column(Integer, primary_key=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), unique=True)
    paper_code = Column(String, nullable=False)
    total_marks = Column(Float, default=100)
    duration_hours = Column(Float, default=3.0)
    instructions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=now)

    subject = relationship("Subject")
    questions = relationship("ExamQuestion", back_populates="paper", cascade="all, delete-orphan")


class ExamQuestion(Base):
    __tablename__ = "exam_questions"
    id = Column(Integer, primary_key=True)
    paper_id = Column(Integer, ForeignKey("question_papers.id"))
    question_number = Column(String, nullable=False)  # e.g. "Q1", "Q2", "Q3"
    part = Column(String, default="Part A")           # "Part A" | "Part B"
    question_text = Column(Text, nullable=False)
    max_marks = Column(Float, nullable=False)
    expected_answer_key = Column(Text, nullable=True) # Expected solution key for AI comparison

    paper = relationship("QuestionPaper", back_populates="questions")


class RevaluationApplication(Base):
    __tablename__ = "revaluation_applications"
    id = Column(Integer, primary_key=True)
    code = Column(String, unique=True, nullable=False)  # e.g. REV-2026-1042
    student_id = Column(Integer, ForeignKey("users.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    result_id = Column(Integer, ForeignKey("results.id"))
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.submitted)
    fee_amount = Column(Float, default=700)
    fee_paid = Column(Boolean, default=False)
    documents_uploaded = Column(Boolean, default=False)
    duplicate_flag = Column(Boolean, default=False)
    anomaly_flag = Column(Boolean, default=False)
    assigned_evaluator_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    revised_marks = Column(Float, nullable=True)
    created_at = Column(DateTime, default=now)
    updated_at = Column(DateTime, default=now, onupdate=now)

    student = relationship("User", foreign_keys=[student_id], back_populates="applications")
    evaluator = relationship("User", foreign_keys=[assigned_evaluator_id])
    subject = relationship("Subject")
    result = relationship("Result")
    history = relationship("StatusHistory", back_populates="application", cascade="all, delete-orphan")

    @property
    def question_paper(self):
        from .database import SessionLocal
        db = SessionLocal()
        try:
            return db.query(QuestionPaper).filter_by(subject_id=self.subject_id).first()
        finally:
            db.close()


class StatusHistory(Base):
    __tablename__ = "revaluation_status_history"
    id = Column(Integer, primary_key=True)
    application_id = Column(Integer, ForeignKey("revaluation_applications.id"))
    status = Column(String, nullable=False)
    note = Column(String, nullable=True)
    actor = Column(String, nullable=True)
    created_at = Column(DateTime, default=now)

    application = relationship("RevaluationApplication", back_populates="history")


class AIAnalysis(Base):
    __tablename__ = "ai_analysis"
    id = Column(Integer, primary_key=True)
    application_id = Column(Integer, ForeignKey("revaluation_applications.id"))
    ocr_text = Column(Text, nullable=True)
    suggested_marks = Column(Float, nullable=True)
    max_marks = Column(Float, nullable=True)
    confidence = Column(Float, nullable=True)
    explanation = Column(Text, nullable=True)
    question_breakdown_json = Column(Text, nullable=True) # JSON string of question-by-question scoring
    provider = Column(String, default="LocalMockProvider")
    created_at = Column(DateTime, default=now)


class Evaluation(Base):
    __tablename__ = "evaluations"
    id = Column(Integer, primary_key=True)
    application_id = Column(Integer, ForeignKey("revaluation_applications.id"))
    evaluator_id = Column(Integer, ForeignKey("users.id"))
    final_marks = Column(Float, nullable=False)
    comments = Column(Text, nullable=True)
    deviated_from_ai = Column(Boolean, default=False)
    created_at = Column(DateTime, default=now)


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(String, nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=now)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True)
    actor = Column(String, nullable=False)
    action = Column(String, nullable=False)
    entity = Column(String, nullable=True)
    category = Column(String, default="general")  # ai | verify | evaluation | submit | config
    created_at = Column(DateTime, default=now)
