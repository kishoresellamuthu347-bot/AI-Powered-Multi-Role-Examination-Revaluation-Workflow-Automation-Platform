from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    clean_pass = payload.password.strip()
    print(f"DEBUG: Login attempt for '{clean_email}', password length: {len(clean_pass)}")
    user = db.query(models.User).filter(models.User.email.ilike(clean_email)).first()
    if not user:
        print(f"DEBUG: User not found for '{clean_email}'")
        raise HTTPException(status_code=401, detail="User account not found. Please register first.")
    
    # Try with raw and trimmed password
    match = auth.verify_password(payload.password, user.hashed_password) or auth.verify_password(clean_pass, user.hashed_password)
    print(f"DEBUG: Password match result: {match}")
    if not match:
        raise HTTPException(status_code=401, detail="Incorrect password. Please check your password.")

    token = auth.create_access_token({"sub": str(user.id), "role": user.role.value})
    return schemas.Token(access_token=token, role=user.role.value, name=user.name, user_id=user.id)


@router.post("/register", response_model=schemas.Token)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")
    
    role_val = payload.role.lower()
    if role_val not in [r.value for r in models.RoleEnum]:
        role_val = models.RoleEnum.student.value

    user = models.User(
        name=payload.name,
        email=payload.email,
        hashed_password=auth.hash_password(payload.password),
        role=models.RoleEnum(role_val),
        department=payload.department,
        roll_number=payload.roll_number,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # If new user is a student, attach initial results for demo eligibility
    if user.role == models.RoleEnum.student:
        subjects = db.query(models.Subject).all()
        if subjects:
            r1 = models.Result(student_id=user.id, subject_id=subjects[0].id, marks=52, max_marks=100, eligible_for_revaluation=True)
            db.add(r1)
            if len(subjects) > 1:
                r2 = models.Result(student_id=user.id, subject_id=subjects[1].id, marks=68, max_marks=100, eligible_for_revaluation=True)
                db.add(r2)
            db.commit()

    token = auth.create_access_token({"sub": str(user.id), "role": user.role.value})
    return schemas.Token(access_token=token, role=user.role.value, name=user.name, user_id=user.id)


@router.get("/me")
def me(user: models.User = Depends(auth.get_current_user)):
    return {
        "id": user.id,
        "name": user.name,
        "role": user.role.value,
        "department": user.department,
        "roll_number": user.roll_number,
    }
