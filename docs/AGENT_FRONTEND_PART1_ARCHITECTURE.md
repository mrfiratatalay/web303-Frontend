# Frontend – Part 1 Architecture

Bu doküman, Final Project – Part 1 için React frontend uygulamasının mimarisini özetler.

## 1. Teknoloji Kararları (Frontend Stack)
- React 18+ (TypeScript)
- Vite
- React Router v6
- React Hook Form + Yup
- Axios
- Material UI (MUI) ana UI kütüphanesi
- Tailwind CSS sadece layout/spacing için yardımcı
- Test kütüphanesi yok (Part 1 scope)

## 2. Klasör Yapısı (kısaltılmış)
```
frontend/
├─ public/
├─ src/
│  ├─ assets/
│  ├─ components/
│  │  ├─ layout/ (Navbar, Sidebar, Layout)
│  │  ├─ form/ (TextInput, PasswordInput, SelectInput, CheckboxInput)
│  │  ├─ feedback/ (Alert, Toast, LoadingSpinner)
│  │  └─ routing/ (ProtectedRoute)
│  ├─ context/ (AuthContext)
│  ├─ hooks/ (useAuth)
│  ├─ pages/ (auth, dashboard, profile, error)
│  ├─ services/ (apiClient, authApi)
│  ├─ utils/ (storage, error, validationSchemas)
│  ├─ types/ (auth)
│  ├─ App.tsx
│  └─ main.tsx
├─ .env / .env.example
├─ package.json
└─ README.md
```

## 3. Routing
- Public: `/login`, `/register`, `/verify-email/:token`, `/forgot-password`, `/reset-password/:token`
- Protected (ProtectedRoute + Layout): `/dashboard`, `/profile`
- 404: `*`

## 4. Auth Mimarisi
- AuthContext: `user`, `accessToken`, `refreshToken`, `isLoading`, `error`
- Fonksiyonlar: `login`, `logout`, `loadCurrentUser`, `setUser`
- storage helper: access/user/refresh tokenları localStorage’da saklar.
- API: `authApi` login/register/verify/forgot/reset, `users/me`, profil update, profil foto yükleme.
- Axios interceptor: request’te Authorization header ekler; 401/403’te storage temizler + login’e yönlendirir (auth endpointleri hariç).

## 5. Form & Validasyon
- RHF + `yupResolver`
- Yup şemaları `utils/validationSchemas.ts`
- MUI TextField + Button; hatalar `error` + `helperText` veya `Alert`.

## 6. UI / Layout
- MUI komponentleri ana kaynak, Tailwind yalnızca layout/spacing.
- Auth sayfaları: ortada card/paper, tutarlı padding (p-6/p-8), başlık + açıklama + form + alt link.
- Layout: Navbar + Sidebar + Content (Container).
- Feedback: statik mesajlar MUI Alert; toast için Snackbar + Alert.

## 7. TypeScript
- `strict`, `noImplicitAny`, `strictNullChecks` açık.
- Context/hook tipleri tanımlı; form tipleri interface/type ile ayrılmış.
