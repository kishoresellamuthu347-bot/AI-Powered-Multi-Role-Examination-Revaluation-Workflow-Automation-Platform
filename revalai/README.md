# RevalAI — Working Prototype

A real, runnable full-stack prototype of the examination revaluation platform:

- **Backend**: FastAPI + SQLite, JWT auth, role-based access control, real
  duplicate/anomaly detection logic, a pluggable AI provider (mock OCR + rubric
  analysis today, swappable for OpenAI/Gemini later), audit logging, notifications.
- **Frontend**: React + Vite + Tailwind, calling the real backend API — every
  button performs a real HTTP request against a real database. No mock data
  baked into the UI.

Deployment (Docker/CI-CD/cloud) is intentionally left out, per your request —
this runs locally.

## 1. Run the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

On first startup the database (`revalai.db`, SQLite) is created and seeded
automatically with demo accounts (password for all: `demo1234`):

| Role      | Email                    |
|-----------|--------------------------|
| Student   | student@revalai.demo     |
| Evaluator | evaluator@revalai.demo   |
| Officer   | officer@revalai.demo     |
| Admin     | admin@revalai.demo       |

API docs (interactive): http://localhost:8000/docs

To use Postgres instead of SQLite, set `DATABASE_URL` before starting, e.g.:
```bash
export DATABASE_URL=postgresql://user:pass@localhost:5432/revalai
```

## 2. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — click any demo account card to sign in instantly.

If your backend runs somewhere other than `localhost:8000`, set:
```bash
echo "VITE_API_URL=http://your-backend-host:8000" > .env
```

## 3. Try the full lifecycle end-to-end

1. **Student** — Results tab → "Apply for revaluation" on CS301 or MA205 →
   go to Track Applications → pay the fee. Watch the AI screening run for
   real (duplicate/anomaly detection against the actual database).
2. **Officer** — Application Queue → Review → Verify & approve → assign an
   evaluator.
3. **Evaluator** — Assignments → Evaluate → "Run OCR & AI analysis" (a real
   backend call that returns a deterministic mock OCR transcript + AI
   suggested mark + confidence + explanation) → adjust marks if you like →
   Submit final evaluation.
4. **Officer** — Publish Results tab → Approve & publish.
5. **Student** — Track Applications now shows "Published" and the revised
   marks.
6. **Admin** — Analytics/User Management/Audit Logs show everything that
   just happened, pulled live from the database.

## What's real vs. simulated

| Feature | Status |
|---|---|
| Auth, roles, permissions | Real (JWT, bcrypt, DB-backed) |
| Application lifecycle & status history | Real (persisted, enforced server-side) |
| Duplicate / anomaly detection | Real heuristic logic against the DB |
| Audit log | Real, immutable, DB-backed |
| Notifications | Real, DB-backed |
| OCR text extraction | **Simulated** — deterministic mock text (no real image processing). Swap in `pdf-reading`/Tesseract in `ai_provider.py`. |
| AI mark suggestion | **Simulated** — deterministic mock scoring via `LocalMockProvider`. Swap in a real LLM call by implementing another `AIProvider` subclass and setting `AI_PROVIDER`/`AI_API_KEY`. |
| Payment | Simulated (marks fee as paid instantly — no real payment gateway) |
| Deployment (Docker/CI-CD) | Not included, per your request |

## Project structure

```
backend/
  app/
    main.py            FastAPI app + startup seeding
    database.py         SQLAlchemy engine/session
    models.py            ORM models (users, applications, results, etc.)
    schemas.py           Pydantic request/response models
    auth.py              JWT + password hashing + RBAC
    ai_provider.py        Pluggable AI/OCR abstraction
    seed.py               Demo data seeding
    services/
      detection.py        Duplicate & anomaly detection
      audit.py             Audit log writer
      notify.py            Notification writer
    routers/
      auth_router.py, student_router.py, evaluator_router.py,
      officer_router.py, admin_router.py
frontend/
  src/
    api.js               API client
    App.jsx              Routing + auth guard
    pages/               Login, Student/Evaluator/Officer/Admin dashboards
    components/          Shell (layout), ui (shared atoms)
```

## Swapping in a real AI model

Everything AI-related goes through `AIProvider` in `app/ai_provider.py`.
To use a real model, add a class like:

```python
class OpenAIProvider(AIProvider):
    name = "OpenAIProvider"
    def __init__(self, api_key): ...
    def run_ocr(self, application_code): ...       # call a vision/OCR API
    def analyze_answer(self, ocr_text, criteria): ...  # call an LLM with the rubric
```

and set `AI_PROVIDER=openai` / `AI_API_KEY=...` as environment variables.
No other code needs to change.
