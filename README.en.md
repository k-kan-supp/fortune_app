# Four Pillars of Destiny (四柱推命アプリ)

[日本語](README.md) | English

A web app that calculates and reads a Four Pillars of Destiny (Bazi / Saju) chart
from a date and time of birth.

The UI is available in Japanese and English. The language switch sits in the top-right
corner; the initial language follows the browser's language setting and the choice is
remembered in `localStorage`. The frontend sends the selected language as an
`Accept-Language` header, so API messages and the sign-up email come back in the
same language.

## Stack

| Layer    | Tech                      | Directory   |
| -------- | ------------------------- | ----------- |
| Frontend | React + Vite + TypeScript | `frontend/` |
| Backend  | Python + FastAPI          | `backend/`  |

All Four Pillars calculations (stems and branches, ten gods, hidden stems) live in the
backend under `app/services/saju/`, so the frontend only handles input and display.

## Setup

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env

# Start PostgreSQL (Docker)
docker compose up -d db

# Apply DB migrations
alembic upgrade head

# Run the server
uvicorn app.main:app --reload
# → API docs at http://localhost:8000/docs
```

#### Trying sign-up in development

Emails are not actually sent — the sign-up URL is printed to the server log
(`EMAIL_BACKEND=console`).

1. Submit your email address on `/register`
2. Open the `.../auth/verify?token=...` URL printed in the `uvicorn` terminal
3. The token is verified and you are logged in (the JWT is stored in `localStorage`)

To send real email in production, add an SMTP / Resend implementation under
`app/services/email/` and branch on it in `get_email_sender()`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
# → http://localhost:5173
```

## Adding or changing translations

- UI strings: `frontend/src/i18n/messages/ja.ts` and `en.ts`. `ja.ts` defines the
  shape, so a missing or misspelled key in `en.ts` fails the type check.
- Four Pillars terminology (stems, branches, ten gods): `frontend/src/features/fortune/terms.ts`
- Prefecture names: `frontend/src/i18n/prefectures.ts` (values stay Japanese, only the
  display is translated)
- API messages and email text: `backend/app/core/i18n.py`

## Directory layout

See [docs/architecture.md](docs/architecture.md) (Japanese).
