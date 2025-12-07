# Frontend – Part 1 Task Board (Updated)

## Kurallar
- Backend read-only; sadece verilen API’ye bağlanan frontend.
- Test (Jest/RTL) yok.
- UI: **MUI ana kütüphane**, Tailwind sadece layout/spacing.
- TypeScript strict (`strict`, `noImplicitAny`, `strictNullChecks`).

## 1) Proje Kurulumu
- Vite React + TypeScript oluştur.
- Bağımlılıklar: `react-router-dom`, `axios`, `react-hook-form`, `yup`, `@hookform/resolvers`, `@mui/material`, `@mui/icons-material`, `tailwindcss` + `postcss` + `autoprefixer`.
- Tailwind init (`content` globlarına ts/tsx ekle); index.css’de tailwind base/components/utilities.
- `.env.example` içine `VITE_API_BASE_URL` ekle; `.env` lokal ayarla.
- Scripts: `dev`, `build`, `preview` çalışıyor.

## 2) Yapı
- `src/components/` (layout, form, feedback, routing)
- `src/context/` AuthContext
- `src/hooks/` useAuth
- `src/pages/` auth, dashboard, profile, error
- `src/services/` apiClient, authApi
- `src/utils/` storage, validationSchemas, error
- `src/types/` auth

## 3) Auth Akışı
- RHF + Yup şemaları.
- apiClient interceptor: Authorization header; 401/403 -> storage temizle + login’e yönlendir (auth endpointleri hariç).
- AuthContext: login/logout/loadCurrentUser/setUser; storage persist.

## 4) UI & Form Pattern
- Formlar: MUI TextField + Button, Alert; RHF + yupResolver.
- Layout: Navbar + Sidebar + Content (ProtectedRoute ile sarılı).
- Auth sayfaları: ortada Paper/card, tutarlı padding; başlık + açıklama + form + alt link.

## 5) Sayfalar
- `/login`, `/register`, `/verify-email/:token`, `/forgot-password`, `/reset-password/:token` (public)
- `/dashboard`, `/profile` (ProtectedRoute + Layout)
- `*` -> NotFound
- Profile: `/users/me` yükle; profil güncelle + foto yükle (backend kontratı).

## 6) Tipler
- `types/auth.ts` user/token tipleri.
- RHF form tipleri (LoginForm, RegisterForm, ProfileForm, vb.).

## 7) Çalıştırma
- `npm run dev`
- `npm run build` (strict TS hatasız)

Bu tahta, Part 1 kapsamındaki işleri takip etmek için güncel tutulmalıdır.
