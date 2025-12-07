I want to make sure that the frontend fully implements all required features for Part 1, with no missing pieces.
Please treat the following as a checklist and:

verify each item,

implement what is missing,

and at the end give me a short summary of what you changed or confirmed.

1. Project structure & core setup

Please confirm:

The project has a clean structure like:

src/
assets/
components/
context/
hooks/
pages/
services/
utils/
App.tsx
main.tsx (or index.tsx)

React Router v6 is used with a clear public/protected route setup.

There is a shared Axios instance (e.g. apiClient.ts) with:

baseURL set to the backend API

an interceptor that adds Authorization: Bearer <accessToken> for authenticated requests

interceptor handling for 401 responses (optional refresh flow or logout).

There is an Auth Context (or similar) that manages:

user object

accessToken (and refresh token if used)

login(), logout(), and refreshToken() functions

on app start, it checks localStorage for an existing token and restores auth state if valid.

If any of these are missing or inconsistent, please implement/fix them.

2. Pages and flows (Part 1)

Please make sure the following routes and behaviors exist and work:

2.1 Login Page – /login

UI:

Email input

Password input

Optional “Remember me” checkbox

“Şifremi unuttum” link to /forgot-password

Behavior:

Form validation (required fields, email format)

Shows backend error messages (wrong credentials, unverified email, etc.)

Loading state: while logging in, button is disabled and shows a spinner or clear loading state

On success:

Saves accessToken (and refreshToken if used) to localStorage

Updates Auth Context user

Redirects to /dashboard

2.2 Register Page – /register

Fields:

First name, Last name (or Full name split)

Email

Password

Confirm password

User type: student / faculty

If student selected: show Student number field

Department (dropdown with backend department IDs)

“Terms & conditions” checkbox (must be checked to submit)

Behavior:

Validation:

Password: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit (and matches backend regex)

Email format

Confirm password equals password

Student number required when role is student

On successful register:

Show backend success message: e.g.
“Kayıt başarılı. Email adresinizi doğrulamak için gelen kutunuzu kontrol edin.”

Automatically redirect to /login after a short delay (e.g. 3s).

2.3 Email Verification Page – /verify-email/:token

Reads :token from route params.

On mount, calls:

POST /api/v1/auth/verify-email with { token }

States:

Loading: show a message like “Email adresiniz doğrulanıyor…”

Success:

Show: “Email doğrulandı, birkaç saniye içinde giriş sayfasına yönlendirileceksiniz.”

After ~3 seconds, redirect to /login

Error:

Show: “Geçersiz veya süresi dolmuş doğrulama linki.”

2.4 Forgot Password Page – /forgot-password

Single email input.

“Şifre sıfırlama linki gönder” button.

Validation: email required + format.

On submit:

Call appropriate backend endpoint (e.g. /auth/forgot-password).

On success: show message like “Şifre sıfırlama linki email adresinize gönderildi.”

Handle loading and error states properly.

2.5 Reset Password Page – /reset-password/:token

Reads :token from route params.

Fields:

New password

Confirm new password

Validation:

Same password rules as register

Confirm matches new password

On submit:

Call appropriate backend endpoint (e.g. /auth/reset-password)

On success: show success message and redirect to /login

On error: show backend message (invalid/expired token, etc.)

2.6 Dashboard Page – /dashboard (Protected)

Protected route: only accessible when user is authenticated.

Shows at least:

A welcome message like “Hoşgeldin, {user.first_name}”

Simple placeholders for future parts (cards/sections per role: student/faculty/admin) – basic is enough for Part 1.

2.7 Profile Page – /profile (Protected)

Shows current user information from /api/v1/users/me:

Name, Email, Role

If student: student number + department

If faculty: employee number + title + department

Profile picture or placeholder avatar.

Profile edit form:

Editable fields (name, phone, etc. according to backend)

Calls PUT /api/v1/users/me

Has loading state on submit

Shows success and error messages.

Profile photo upload:

File input / button “Profil fotoğrafını değiştir”

Only jpg/png, max 5MB (enforced on frontend)

Calls POST /api/v1/users/me/profile-picture with FormData and correct field name

On success, updates displayed profile photo.

Change password section:

UI for old password, new password, new password confirm (even if backend endpoint is not fully used yet)

If backend endpoint exists, connect it; otherwise keep UI consistent for Part 1.

3. Shared components & layout

Please verify and/or implement:

Navbar

When user is logged in:

Shows profile/menu with links to Profile, Dashboard, and Logout.

When user is not logged in:

Shows Login and Register links.

Sidebar

Used on dashboard layout (and maybe profile), with vertical navigation.

For now, at least basic items (Dashboard, Profile); ready for future features.

ProtectedRoute component

Wraps protected routes (/dashboard, /profile, etc.).

If not authenticated, redirects to /login.

Optionally supports role-based access (allowedRoles).

Loading Spinner

Reusable loading indicator used on:

login/register requests

profile update

email verify, forgot/reset password, etc.

Alert/Toast system

Centralized way to show success, error, and info messages.

Can be built with MUI Alert + Snackbar or similar.

Reusable form inputs

Components like TextInput, PasswordInput, SelectInput integrated with React Hook Form or Formik.

4. Auth flow & token handling

Please ensure:

On successful login:

Tokens and user info are stored in Auth Context.

Tokens are persisted (localStorage or cookies).

On app refresh:

Auth Context rehydrates from storage and keeps user logged in if token is valid.

Axios interceptor:

Attaches Authorization header with Bearer token on secure requests.

Handles 401 responses (e.g. try refresh token or force logout).

Email verification:

When backend returns 401 with “Email adresinizi doğrulamanız gerekiyor”, the message is displayed clearly on the login form.

Register + /verify-email/:token + login flow works end-to-end.

5. Routing & 404

Confirm the following routes exist and work:

Public:

/login

/register

/forgot-password

/reset-password/:token

/verify-email/:token

Protected:

/dashboard

/profile

404:

An accessible “Page not found” screen for unknown routes.

6. Styling & UX expectations

Layout is responsive (mobile, tablet, desktop).

Consistent theme:

Colors, typography, button styles, card layouts.

Auth pages (/login, /register, /forgot-password, /reset-password, /verify-email) use a shared Auth layout:

Centered card, title, description, and “Already have an account? / Don’t have an account?” links at the top or bottom.

Please also double-check that the Register/Login/Profile UIs look clean and consistent with the existing design.

7. Minimal tests

If possible for Part 1, add or confirm:

A test for Login form:

Shows validation messages for invalid/empty input.

A test for Register form:

Shows validation errors when fields are empty or passwords don’t match.

(Nice-to-have) A basic auth flow test that verifies redirect to /dashboard after successful login.

Finally, after you go through this checklist:

Fix anything that’s missing or broken.

Then send me a short summary of:

Which items were already OK

What you implemented or changed

Anything that is intentionally left as a placeholder for later parts.

The goal is: for Part 1, the frontend should completely satisfy the assignment requirements with no missing features.
