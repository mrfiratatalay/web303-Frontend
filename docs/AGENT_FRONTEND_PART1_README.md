# Frontend – Part 1 (Authentication & User Management)

Bu README, Final Project Part 1 kapsamındaki frontend geliştirme kurallarını ve hedeflerini özetler.

## Altın Kurallar
- Backend **read-only**; sadece mevcut API’ye bağlanan frontend yazılır.
- UI: **MUI ana kütüphane**, Tailwind sadece layout/spacing.
- TypeScript strict: `strict`, `noImplicitAny`, `strictNullChecks`.
- Gerçek backend davranışı kontrattır; mock sadece test playground’larında.

## Kapsam (IN SCOPE)
- Proje kurulumu (Vite + React + TS).
- Auth sayfaları: Login, Register, Verify Email, Forgot Password, Reset Password.
- Dashboard, Profile (profil görüntüle/güncelle, foto yükleme).
- Ortak bileşenler: Navbar, Sidebar, Layout, ProtectedRoute, Alert/Toast, LoadingSpinner, form inputları.
- Auth context + token/storage yönetimi, axios instance + interceptors.

## Dışında (OUT OF SCOPE - Part 1)
- Backend değişiklikleri, migration, seed vb.
- Akademik modüller (ders planlama, yoklama vs.).
- Geniş admin analytics.
- Frontend testleri (Jest/RTL) bu fazda yazılmayacak.

## Entegrasyon Kuralları
- `.env` üzerinden `VITE_API_BASE_URL`.
- Axios interceptor: Authorization header ekle; 401/403’te storage temizle + login’e yönlendir (auth endpointleri hariç).
- Hata mesajları kullanıcı dostu gösterilmeli (MUI Alert/Toast).

## Sayfa Akışları (Özet)
- Login: email + password -> token/user sakla -> `/dashboard`.
- Register: form -> success mesajı “emailinizi doğrulayın”.
- Verify Email: token ile POST -> success/hata mesajı -> login’e yönlendirme.
- Forgot Password: email al -> her durumda nötr mesaj.
- Reset Password: yeni şifre + doğrulama -> success -> login.
- Dashboard: protected, hoş geldin + rol bazlı placeholder.
- Profile: `/users/me` yükle, form ile güncelle, foto yükleme (multipart).

## UI / UX Paterni
- Formlar: RHF + Yup; MUI TextField + Button; Alert/Toast ile hata/bilgi.
- Layout: Navbar + Sidebar + Content (Container); auth sayfaları ortada card/paper, tutarlı padding.

## Klasör Yapısı (kısa)
```
src/
  components/ (layout, form, feedback, routing)
  context/ (AuthContext)
  hooks/ (useAuth)
  pages/ (auth, dashboard, profile, error)
  services/ (apiClient, authApi)
  utils/ (storage, validationSchemas, error)
  types/ (auth)
  App.tsx, main.tsx, index.css
```

Bu kurallara uyulduğundan emin olduktan sonra frontend hocaya gösterilecek teslim kalitesine gelir.
