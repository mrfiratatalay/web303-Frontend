# Smart Campus – Part 1 (Backend + Frontend)

This workspace hosts the Part 1 deliverables:
- **Backend** (Render): see sibling repo `../CEN303-web-backend/backend` (API base path `/api/v1`, default `PORT=5000`).
- **Frontend** (Vercel): this repo under `frontend/` (Vite + React + TypeScript).

## Quick Start (Local)

1. Backend
   ```bash
   cd ../CEN303-web-backend/backend
   cp .env.example .env    # update DB credentials if needed
   docker-compose up       # or npm run dev if running Postgres yourself
   ```
   Local API base URL: `http://localhost:5000/api/v1`

2. Frontend
   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```
   Open http://localhost:5173 and it will call the backend via `VITE_API_BASE_URL`.

## Production (Part 1)

- Backend (Render): https://smart-campus-api-g53d.onrender.com  
- API base URL: https://smart-campus-api-g53d.onrender.com/api/v1  
- Frontend (Vercel): https://<your-vercel-domain>.vercel.app (set `VITE_API_BASE_URL` to the production API URL)

For detailed frontend instructions, see `frontend/README.md`. Backend details and CORS/env notes live in `../CEN303-web-backend/backend/README.md`.
