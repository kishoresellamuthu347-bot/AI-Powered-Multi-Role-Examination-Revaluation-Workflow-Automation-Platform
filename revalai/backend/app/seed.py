from .database import SessionLocal, engine, Base
from . import models
from .auth import hash_password


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(models.User).count() > 0:
            print("Database already seeded — skipping.")
            return

        subjects = [
            models.Subject(code="CS301", name="Data Structures & Algorithms", department="CSE"),
            models.Subject(code="CS304", name="Database Systems", department="CSE"),
            models.Subject(code="MA205", name="Discrete Mathematics", department="Mathematics"),
            models.Subject(code="CS310", name="Operating Systems", department="CSE"),
        ]
        db.add_all(subjects)
        db.commit()
        for s in subjects:
            db.refresh(s)

        users = [
            models.User(name="Ananya Rao", email="student@revalai.demo", role=models.RoleEnum.student,
                        department="CSE", roll_number="21CS114", hashed_password=hash_password("demo1234")),
            models.User(name="Dr. S. Venkatesh", email="evaluator@revalai.demo", role=models.RoleEnum.evaluator,
                        department="CSE", hashed_password=hash_password("demo1234")),
            models.User(name="Dr. Meera Pillai", email="evaluator2@revalai.demo", role=models.RoleEnum.evaluator,
                        department="CSE", hashed_password=hash_password("demo1234")),
            models.User(name="R. Subramaniam", email="officer@revalai.demo", role=models.RoleEnum.officer,
                        department="Examination Cell", hashed_password=hash_password("demo1234")),
            models.User(name="System Admin", email="admin@revalai.demo", role=models.RoleEnum.admin,
                        department="Administration", hashed_password=hash_password("demo1234")),
        ]
        db.add_all(users)
        db.commit()
        for u in users:
            db.refresh(u)
        student = users[0]

        results = [
            models.Result(student_id=student.id, subject_id=subjects[0].id, marks=58, max_marks=100, eligible_for_revaluation=True),
            models.Result(student_id=student.id, subject_id=subjects[1].id, marks=71, max_marks=100, eligible_for_revaluation=False),
            models.Result(student_id=student.id, subject_id=subjects[2].id, marks=49, max_marks=100, eligible_for_revaluation=True),
            models.Result(student_id=student.id, subject_id=subjects[3].id, marks=63, max_marks=100, eligible_for_revaluation=True),
        ]
        db.add_all(results)
        db.commit()

        rubric_seed = {
            "CS301": [("Correctness of algorithm", 6), ("Time/space complexity analysis", 4), ("Edge case handling", 3), ("Clarity of explanation", 2)],
            "CS310": [("Concept definition", 5), ("Worked example", 5), ("Edge case discussion", 3), ("Clarity of explanation", 2)],
            "MA205": [("Proof correctness", 6), ("Notation & rigor", 4), ("Worked example", 3), ("Clarity of explanation", 2)],
        }
        subj_by_code = {s.code: s for s in subjects}
        for code, criteria in rubric_seed.items():
            for label, maxm in criteria:
                db.add(models.RubricCriterion(subject_id=subj_by_code[code].id, question_label="Q1", criterion=label, max_marks=maxm))
        db.commit()

        print("Seed complete. Demo accounts (password: demo1234):")
        for u in users:
            print(f"  {u.role.value:10s} {u.email}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
