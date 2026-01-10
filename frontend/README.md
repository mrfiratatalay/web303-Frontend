# Smart Campus Frontend

React + TypeScript + Vite frontend for the Smart Campus Ecosystem Management Platform.

## 🌐 Canlı Demo

| Servis           | URL                                             |
| ---------------- | ----------------------------------------------- |
| **Frontend**     | https://web303-frontend.vercel.app              |
| **Backend API**  | https://cen303-web-backend.onrender.com         |
| **Swagger Docs** | https://cen303-web-backend.onrender.com/swagger |

### Test Hesapları

| Rol     | Email                        | Şifre       |
| ------- | ---------------------------- | ----------- |
| Admin   | admin@smartcampus.com        | Admin123!   |
| Faculty | mehmet.sevri@smartcampus.com | Faculty123! |
| Student | can.ahmed@smartcampus.com    | Student123! |

## ✨ Features

### Part 1: Authentication

- Login, Register, Email Verification
- Forgot/Reset Password
- Profile Management

### Part 2: Academic

- Course Catalog & Enrollments
- GPS Attendance Check-in
- Grades & Transcript

### Part 3: Campus Services

- Meal Reservations & Wallet
- Event Registration & Check-in
- Schedule & Classroom Reservations

### Part 4: Analytics & Notifications

- Admin Dashboard & Analytics
- Notification Center
- Notification Preferences

## Prerequisites

- Node.js 18+ (recommended) and npm
- Backend reachable via `VITE_API_BASE_URL` (local default `http://localhost:5000/api/v1`)

## Installation

```bash
cd frontend
npm install
```

## Scripts

- `npm run dev` - start Vite dev server (default http://localhost:5173)
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm test` - run vitest + Testing Library (jsdom)

## Project Structure

```
src/
  assets/           # static assets
  components/       # UI components (layout, forms, feedback, routing)
  context/          # Auth context/provider
  hooks/            # useAuth, etc.
  pages/            # auth, dashboard, profile, error pages
  services/         # apiClient + API wrappers
  types/            # shared TS types
  utils/            # validation schemas, storage, error helpers
  __tests__/        # vitest + Testing Library specs
  setupTests.ts     # global test setup/mocks
App.tsx             # routes
main.tsx            # app entry
```

## Environment Setup

The frontend uses `VITE_API_BASE_URL` to know where the backend API lives.

### Local development

1. Copy the example env file:

   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Edit `.env` and make sure it points to your local backend (Docker default):

   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

The app runs at `http://localhost:5173` and talks to the backend at `http://localhost:5000/api/v1`.

### Production (Vercel) with live backend

When deploying to Vercel:

- Build command: `npm run build`
- Output directory: `dist`
- Framework preset: Vite (or Static Site if auto-detected)

In Vercel project settings, under **Environment Variables**, add:

- `VITE_API_BASE_URL = https://smart-campus-api-g53d.onrender.com/api/v1`

After deploy, the frontend will call the live backend at `https://smart-campus-api-g53d.onrender.com/api/v1`.

`.env.example` is tracked in git; `.env` is local-only. Use the same codebase for local and production by switching `VITE_API_BASE_URL`.

## Deployment – Vercel (Frontend)

1. Connect the GitHub repo to Vercel (framework preset: **Vite**).
2. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Environment variables:
   - `VITE_API_BASE_URL = https://smart-campus-api-g53d.onrender.com/api/v1`
4. Deploy and verify:
   - Open the Vercel URL (e.g. `https://<your-vercel-domain>.vercel.app`).
   - Load the login page, then try logging in and opening dashboard/profile.
   - In DevTools Network tab, confirm calls go to `https://smart-campus-api-g53d.onrender.com/api/v1/...`.
   - If you see CORS errors, add your Vercel domain to the backend `FRONTEND_URL` list.

## Routing

- Public: `/login`, `/register`, `/forgot-password`, `/reset-password/:token`, `/verify-email/:token`
- Protected: `/dashboard`, `/profile`
- Fallback: 404 page

## Auth Flow

- Login: saves tokens via AuthContext/localStorage; redirects to `/dashboard`.
- Register: posts confirmPassword, uses backend department UUIDs, shows success message, auto-redirects to `/login`.
- Email verify: `/verify-email/:token` posts `{ token }`, shows success/error, redirects to `/login` after a few seconds.
- Forgot/reset password: wired to backend endpoints with same password rules as backend.
- ProtectedRoute guards dashboard/profile; Axios interceptor adds `Authorization: Bearer <token>` and clears auth + redirects on 401/403 (non-auth endpoints).

## Profile & Dashboard

- Dashboard: protected, welcome message + placeholder cards.
- Profile: summary card (role/department/student/faculty info), edit form (name/phone), photo upload (JPG/PNG, max 5MB, correct URL building), change-password form wired to PUT `/users/me/password`.

## Testing

- Stack: Vitest + @testing-library/react + jsdom.
- Tests: `src/__tests__/LoginPage.test.tsx`, `src/__tests__/RegisterPage.test.tsx`.
- Windows EMFILE avoidance: `setupTests.ts` mocks `@mui/icons-material` and PasswordInput in tests to reduce file handles.

## Development Notes

- Strict TypeScript (`strict`, `noImplicitAny`, `strictNullChecks`).
- RHF + Yup for all auth forms; validation messages in Turkish matching backend rules.
- Department dropdown uses backend UUIDs (seeded departments).
- Axios base URL comes from `VITE_API_BASE_URL`.

## Quick Start

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Then open http://localhost:5173.

---
