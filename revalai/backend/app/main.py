from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import auth_router, student_router, evaluator_router, officer_router, admin_router
from .seed import seed

Base.metadata.create_all(bind=engine)

app = FastAPI(title="RevalAI API", description="AI-Powered Examination Revaluation Management Platform", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(student_router.router)
app.include_router(evaluator_router.router)
app.include_router(officer_router.router)
app.include_router(admin_router.router)


@app.on_event("startup")
def on_startup():
    seed()


@app.get("/")
def root():
    return {"status": "ok", "service": "RevalAI API"}


@app.get("/health")
def health():
    return {"status": "healthy"}
