import datetime as dt
from typing import Optional, List
from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str
    user_id: int


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "student"
    department: Optional[str] = "CSE"
    roll_number: Optional[str] = None


class SubjectOut(BaseModel):
    id: int
    code: str
    name: str
    class Config: from_attributes = True


class ResultOut(BaseModel):
    id: int
    marks: float
    max_marks: float
    eligible_for_revaluation: bool
    subject: SubjectOut
    class Config: from_attributes = True


class ApplyRequest(BaseModel):
    result_id: int
    documents_uploaded: bool = True


class PayRequest(BaseModel):
    application_id: int


class StatusHistoryOut(BaseModel):
    status: str
    note: Optional[str] = None
    actor: Optional[str] = None
    created_at: dt.datetime
    class Config: from_attributes = True


class ApplicationOut(BaseModel):
    id: int
    code: str
    status: str
    fee_amount: float
    fee_paid: bool
    duplicate_flag: bool
    anomaly_flag: bool
    assigned_evaluator_id: Optional[int] = None
    student_id: Optional[int] = None
    revised_marks: Optional[float] = None
    created_at: dt.datetime
    subject: SubjectOut
    history: List[StatusHistoryOut] = []
    class Config: from_attributes = True


class OfficerActionRequest(BaseModel):
    application_id: int
    note: Optional[str] = None


class AssignEvaluatorRequest(BaseModel):
    application_id: int
    evaluator_id: int


class RunAIRequest(BaseModel):
    application_id: int


class AIAnalysisOut(BaseModel):
    ocr_text: str
    suggested_marks: float
    max_marks: float
    confidence: float
    explanation: str
    provider: str
    class Config: from_attributes = True


class SubmitEvaluationRequest(BaseModel):
    application_id: int
    final_marks: float
    comments: Optional[str] = None


class EvaluatorOut(BaseModel):
    id: int
    name: str
    department: Optional[str] = None
    class Config: from_attributes = True


class NotificationOut(BaseModel):
    id: int
    message: str
    read: bool
    created_at: dt.datetime
    class Config: from_attributes = True


class AuditLogOut(BaseModel):
    actor: str
    action: str
    category: str
    created_at: dt.datetime
    class Config: from_attributes = True
