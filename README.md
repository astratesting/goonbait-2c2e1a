# Goonbait

AI-powered invoice processing MVP for accounting firms. Goonbait categorizes invoices with a rule-based AI engine, learns from user corrections, routes invoices through configurable approval chains, and includes QuickBooks/Xero integration stubs.

## Stack

- Frontend: Next.js 14 App Router, TypeScript, Tailwind CSS, Clerk auth UI, Supabase client
- Backend: FastAPI, SQLAlchemy, JWT auth, SQLite by default with Postgres-ready `DATABASE_URL`
- Deployment target: Vercel for frontend, any ASGI host for backend

## Features

- Landing page with accounting firm value props
- Protected dashboard route
- Invoice stats, repository table, detail notes
- Search/filter by status, category, vendor, amount range, and date range
- Upload form with AI category confidence preview
- Approval chain builder UI
- QuickBooks and Xero mock sync settings
- Backend auth: `/auth/register`, `/auth/login`, `/auth/me`
- Backend invoice CRUD, categorization, corrections, approval chains, and sync stubs

## Local frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Local backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
uvicorn backend.main:app --reload
```

Open `http://localhost:8000/docs`.

## Docker

```bash
docker compose up --build
```

## Environment

Copy `.env.example` to `.env` and set Clerk + Supabase keys for real auth and data connections. Backend defaults to SQLite for demo use.

## Demo API flow

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@firm.com","password":"password123","name":"Demo User","firm_name":"Demo Firm","role":"admin"}' | python -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

curl -X POST http://localhost:8000/api/approval-chains \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Default firm approval","description":"Manager then partner","steps":[{"step_order":1,"approver_role":"manager"},{"step_order":2,"approver_role":"partner"}]}'

curl -X POST http://localhost:8000/api/invoices \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"vendor":"Stripe","amount":2490,"currency":"USD","invoice_date":"2026-05-01","due_date":"2026-05-30","notes":"Monthly SaaS subscription","approval_chain_id":1}'
```
