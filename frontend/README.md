# Smart Campus Frontend (Part 1)

React + TypeScript + Vite frontend for the Smart Campus backend. Implements full Part 1 auth and profile flows with MUI and React Hook Form.

## Prerequisites
- Node.js 18+ (recommended) and npm
- Backend running at `http://localhost:5000/api/v1`
  - `.env` should contain `VITE_API_BASE_URL=http://localhost:5000/api/v1`

## Installation
```bash
cd frontend
npm install
```

## Scripts
- `npm run dev` – start Vite dev server (default http://localhost:5173)
- `npm run build` – production build
- `npm run preview` – preview production build
- `npm test` – run vitest + Testing Library (jsdom)

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

## Environment
Create `frontend/.env`:
```
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

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
echo "VITE_API_BASE_URL=http://localhost:5000/api/v1" > .env
npm run dev
```
Then open http://localhost:5173.
