# Frontend – Part 1 Task Board (Detailed)

Bu doküman, **Final Project – Part 1** kapsamında frontend tarafında yapılacak işleri
adım adım listeleyen detaylı bir görev panosudur.

> ⚠️ Kurallar:
>
> - Backend **read-only**: hiçbir backend kodu/DB/migration değiştirilmez.
> - Sadece hocanın verdiği backend API’ye bağlanan React frontend yazılır.
> - Frontend tarafında **test (Jest, RTL vb.) YAZILMAYACAK**.
> - Bu liste yaşayan bir dokümandır: maddeler tamamlandıkça işaretlenebilir, yeni maddeler eklenebilir.

---

## 0. Ön Hazırlık

- [ ] Hocanın verdiği **backend projesini** lokalde çalıştır:

  - [ ] Gerekli `.env` ayarlarını yap.
  - [ ] `npm install` ve `npm run dev` / `npm start` (backend ekranında ne gerekiyorsa).
  - [ ] Backend’in hangi portta çalıştığını not al (ör: `http://localhost:5000`).

- [ ] Backend’in **auth ve user endpoint’lerini** Postman/Insomnia ile test et:
  - [ ] `/auth/register`
  - [ ] `/auth/login`
  - [ ] `/auth/verify-email`
  - [ ] `/auth/forgot-password`
  - [ ] `/auth/reset-password`
  - [ ] `/users/me`
  - [ ] `/users/me` (PUT)
  - [ ] `/users/me/profile-picture`
  - [ ] `/users` (admin only – şimdilik sadece görmek için)

> Amaç: Gerçek backend’in request/response formatını görmek ve frontend’i buna göre yazmak.

---

## 1. Frontend Proje Kurulumu

- [ ] `frontend/` klasöründe Vite React projesi oluştur:

  - [ ] `npm create vite@latest frontend -- --template react` (veya benzer komut).

- [ ] Proje bağımlılıklarını yükle:

  - [ ] `react-router-dom`
  - [ ] `axios`
  - [ ] `react-hook-form`
  - [ ] `yup`
  - [ ] `@hookform/resolvers` (Yup ile entegrasyon için)
  - [ ] `tailwindcss` + `postcss` + `autoprefixer`

- [ ] Tailwind CSS’i yapılandır:

  - [ ] `npx tailwindcss init -p`
  - [ ] `tailwind.config.js` içine `content` ayarlarını ekle:
    - `./index.html`, `./src/**/*.{js,jsx}` vb.
  - [ ] `src/index.css` içine Tailwind base/component/utilities import’larını ekle:
    - `@tailwind base;`
    - `@tailwind components;`
    - `@tailwind utilities;`

- [ ] `package.json` script’leri kontrol et:
  - [ ] `dev`, `build`, `preview` komutları düzgün çalışıyor mu test et (`npm run dev`).

---

## 2. Proje Yapısını Oluşturma

### 2.1 Klasörler & Boş Dosyalar

- [ ] `src/assets/` oluştur:

  - [ ] `default-avatar.png` (placeholder) ekle (gerekirse).

- [ ] `src/components/` altında alt klasörler oluştur:

  - [ ] `components/layout/`
    - [ ] `Navbar.jsx` (boş bileşen)
    - [ ] `Sidebar.jsx` (boş bileşen)
    - [ ] `Layout.jsx` (boş bileşen)
  - [ ] `components/form/`
    - [ ] `TextInput.jsx`
    - [ ] `PasswordInput.jsx`
    - [ ] `SelectInput.jsx`
    - [ ] `CheckboxInput.jsx`
  - [ ] `components/feedback/`
    - [ ] `Alert.jsx`
    - [ ] `Toast.jsx`
    - [ ] `LoadingSpinner.jsx`
  - [ ] `components/routing/`
    - [ ] `ProtectedRoute.jsx`

- [ ] `src/context/`:

  - [ ] `AuthContext.jsx` dosyasını oluştur.

- [ ] `src/hooks/`:

  - [ ] `useAuth.js`
  - [ ] `useAxiosAuth.js` (opsiyonel, istersen sonra doldurursun)

- [ ] `src/pages/`:

  - [ ] `auth/`
    - [ ] `LoginPage.jsx`
    - [ ] `RegisterPage.jsx`
    - [ ] `VerifyEmailPage.jsx`
    - [ ] `ForgotPasswordPage.jsx`
    - [ ] `ResetPasswordPage.jsx`
  - [ ] `dashboard/`
    - [ ] `DashboardPage.jsx`
  - [ ] `profile/`
    - [ ] `ProfilePage.jsx`
  - [ ] `error/`
    - [ ] `NotFoundPage.jsx`

- [ ] `src/services/`:

  - [ ] `apiClient.js`
  - [ ] `authApi.js`

- [ ] `src/utils/`:
  - [ ] `storage.js`
  - [ ] `validationSchemas.js`

---

## 3. Ortam Değişkenleri (.env)

- [ ] Proje kökünde `.env.example` oluştur:
  - [ ] İçine `VITE_API_BASE_URL=http://localhost:5000/api/v1` gibi bir satır ekle.
- [ ] Kendi makinen için `.env` oluştur:
  - [ ] Backend gerçek URL’sini yaz.

> NOT: `.env` dosyası Git’e push edilmeyecek, `.env.example` edilecek.

---

## 4. Ana Giriş Noktaları (main.jsx & App.jsx)

### 4.1 `main.jsx`

- [ ] `BrowserRouter` ve `AuthProvider`’ı saracak şekilde düzenle:
  - [ ] `ReactDOM.createRoot(...)`
  - [ ] `BrowserRouter` içinde `AuthProvider`, onun içinde `App`.

### 4.2 `App.jsx`

- [ ] `Routes` ve `Route` yapılarını oluştur:
  - [ ] Public routes:
    - [ ] `/login` → `LoginPage`
    - [ ] `/register` → `RegisterPage`
    - [ ] `/verify-email/:token` → `VerifyEmailPage`
    - [ ] `/forgot-password` → `ForgotPasswordPage`
    - [ ] `/reset-password/:token` → `ResetPasswordPage`
  - [ ] Protected routes:
    - [ ] `ProtectedRoute` + `Layout` sarmalı:
      - [ ] `/dashboard` → `DashboardPage`
      - [ ] `/profile` → `ProfilePage`
  - [ ] 404 route:
    - [ ] `*` → `NotFoundPage`

---

## 5. AuthContext ve Genel Auth Akışı

### 5.1 `AuthContext.jsx`

- [ ] `AuthContext` objesini oluştur ve export et.
- [ ] `AuthProvider` bileşenini oluştur:
  - [ ] State:
    - `user` (başlangıçta `null`)
    - `accessToken` (başlangıçta `null`)
    - `isLoading` (başlangıçta `true`)
    - `error` (başlangıçta `null`)
  - [ ] `useEffect` ile uygulama açıldığında:
    - [ ] `storage.loadAuth()` ile localStorage’dan auth bilgisi al.
    - [ ] Token varsa:
      - [ ] İstersen `/users/me` çağırıp user’ı doğrula.
    - [ ] Sonuçta `isLoading` false yap.
  - [ ] Sağlanan fonksiyonlar:
    - [ ] `login(credentials)`:
      - [ ] `authApi.login` çağır.
      - [ ] Başarılıysa: `user` + `accessToken` state + storage’a yaz.
      - [ ] Hatalıysa: `error` state’ini ayarla.
    - [ ] `logout()`:
      - [ ] `user` ve `accessToken` state’ten sil.
      - [ ] `storage.clearAuth()` çağır.
    - [ ] `setUser(user)`:
      - [ ] Profil güncelleme sonrası user’ı güncellemek için.

### 5.2 `useAuth.js`

- [ ] `AuthContext`’i `useContext` ile kullanan basit bir hook yaz:
  - [ ] `export const useAuth = () => useContext(AuthContext);`

---

## 6. API Katmanı: Axios ve Auth API Fonksiyonları

### 6.1 `apiClient.js`

- [ ] `axios.create` ile instance oluştur:
  - [ ] `baseURL: import.meta.env.VITE_API_BASE_URL`
  - [ ] Gerekirse `withCredentials: true`
- [ ] Request interceptor ekle:
  - [ ] `localStorage` veya başka bir yerden `accessToken` al.
  - [ ] Token varsa `Authorization: Bearer <token>` header’ını ekle.
- [ ] Response interceptor ekle:
  - [ ] Genel hata loglama veya 401 durumunda logout (istersen).

### 6.2 `authApi.js`

- [ ] Backend’e uygun fonksiyonları tanımla:
  - [ ] `login(data)` → `POST /auth/login`
  - [ ] `register(data)` → `POST /auth/register`
  - [ ] `verifyEmail(token)` → `POST /auth/verify-email`
  - [ ] `forgotPassword(email)` → `POST /auth/forgot-password`
  - [ ] `resetPassword({ token, password })` → `POST /auth/reset-password`
  - [ ] `getCurrentUser()` → `GET /users/me`
  - [ ] `updateProfile(data)` → `PUT /users/me`
  - [ ] `uploadProfilePicture(file)` → `POST /users/me/profile-picture` (form-data)

> Buradaki path ve body’leri gerçek backend’e göre uyarlamak kritik.

---

## 7. Utils: storage & validationSchemas

### 7.1 `storage.js`

- [ ] Aşağıdaki helper fonksiyonları yaz:
  - [ ] `saveAuth({ user, accessToken })`
  - [ ] `loadAuth()`:
    - [ ] localStorage’dan okur, yoksa `null` döner.
  - [ ] `clearAuth()`:
    - [ ] auth ile ilgili tüm key’leri temizler (`auth_access_token`, `auth_user` vb.).

### 7.2 `validationSchemas.js`

- [ ] Yup şemalarını oluştur:

  - [ ] `loginSchema`
  - [ ] `registerSchema`
  - [ ] `forgotPasswordSchema`
  - [ ] `resetPasswordSchema`
  - [ ] (Opsiyonel) `profileSchema`

- [ ] Password kuralları:
  - [ ] min 8 karakter
  - [ ] en az 1 büyük harf
  - [ ] en az 1 rakam
- [ ] Confirm password:
  - [ ] `password` ile `confirmPassword` eşleşmek zorunda.

---

## 8. Reusable Form Bileşenleri

### 8.1 `TextInput.jsx`

- [ ] Props:
  - `label`, `name`, `type`, `placeholder`, `register`, `error`, vs.
- [ ] İçerik:
  - Label + input + hata mesajı.
- [ ] Tailwind class’ları ile basic form stili ver.

### 8.2 `PasswordInput.jsx`

- [ ] `TextInput` yapısına ek olarak:
  - [ ] Şifreyi göster/gizle butonu.
- [ ] `type` dinamik: `password` ↔ `text`.

### 8.3 `SelectInput.jsx`

- [ ] Department veya userType seçimleri için:
  - [ ] Props: `label`, `name`, `options`, `register`, `error`.

### 8.4 `CheckboxInput.jsx`

- [ ] Remember me, Terms & Conditions için:
  - [ ] Checkbox + label + hata (gerekirse).

---

## 9. Feedback Bileşenleri

### 9.1 `Alert.jsx`

- [ ] Tip: `variant` prop (`success`, `error`, `info`).
- [ ] İçerik: İkon + mesaj.

### 9.2 `Toast.jsx`

- [ ] Basit bir global toast sistemi (istersen context’li, ister page-level).
- [ ] Kısa süre sonra kendiliğinden kapanan mesajlar.

### 9.3 `LoadingSpinner.jsx`

- [ ] Tailwind ile sade bir spinner (ör: border animasyonlu daire).

---

## 10. ProtectedRoute ve Layout

### 10.1 `ProtectedRoute.jsx`

- [ ] `useAuth()` ile `user` ve `isLoading` değerlerini oku.
- [ ] `isLoading === true` ise:
  - [ ] Tam sayfa `LoadingSpinner` göster.
- [ ] `user == null` ise:
  - [ ] `<Navigate to="/login" replace />` ile yönlendir.
- [ ] Aksi durumda:
  - [ ] `children`’ı render et.

### 10.2 `Layout.jsx`

- [ ] Authenticated layout:
  - [ ] Üstte `Navbar`
  - [ ] Solda `Sidebar` (md ve üzeri için)
  - [ ] Sağda/ortada `Outlet` (React Router)

---

## 11. Sayfaların Geliştirilmesi

### 11.1 Login Page (`/login`)

- [ ] Form alanları:
  - [ ] `email`
  - [ ] `password`
  - [ ] `rememberMe` (opsiyonel)
- [ ] React Hook Form + `loginSchema` entegrasyonu.
- [ ] Submit:
  - [ ] `authApi.login` çağrısı.
  - [ ] Başarılı:
    - [ ] `AuthContext.login` → user + token state’e yaz.
    - [ ] `/dashboard`’a redirect.
  - [ ] Hatalı:
    - [ ] Form altına veya üstüne hata mesajı.
    - [ ] Toast veya Alert göster.

### 11.2 Register Page (`/register`)

- [ ] Form alanları:
  - [ ] `fullName`
  - [ ] `email`
  - [ ] `password`
  - [ ] `confirmPassword`
  - [ ] `userType` (student/faculty)
  - [ ] `studentNumber` (student ise)
  - [ ] `departmentId`
  - [ ] `acceptTerms` (checkbox)
- [ ] React Hook Form + `registerSchema`.
- [ ] Conditional alanlar:
  - [ ] `userType` = `student` → `studentNumber` göster.
  - [ ] `userType` = `faculty` ise ekstra alan gerekirse (backend’e göre).
- [ ] Submit:
  - [ ] `authApi.register` çağrısı.
  - [ ] Başarılı:
    - [ ] “Email doğrulama linki gönderildi” mesajı.

### 11.3 Verify Email Page (`/verify-email/:token`)

- [ ] `useParams` ile `token` al.
- [ ] `useEffect` içinde:
  - [ ] `authApi.verifyEmail(token)` çağır.
- [ ] Sonuç:
  - [ ] Success mesajı.
  - [ ] Error mesajı (token geçersiz/süresi dolmuş).
- [ ] Birkaç saniye sonra:
  - [ ] `/login`’e redirect (örn. `setTimeout`).

### 11.4 Forgot Password Page (`/forgot-password`)

- [ ] Tek input: `email`.
- [ ] Yup schema ile email validasyonu.
- [ ] Submit:
  - [ ] `authApi.forgotPassword(email)`.
- [ ] Success mesajı:
  - [ ] “Eğer bu email ile kayıtlı bir kullanıcı varsa, şifre sıfırlama linki gönderildi.”

### 11.5 Reset Password Page (`/reset-password/:token`)

- [ ] `useParams` ile `token` al.
- [ ] Form:
  - [ ] `password`
  - [ ] `confirmPassword`
- [ ] Yup schema ile yeni şifre validasyonu.
- [ ] Submit:
  - [ ] `authApi.resetPassword({ token, password })`.
- [ ] Success:
  - [ ] Mesaj + `/login` redirect.

### 11.6 Dashboard Page (`/dashboard`)

- [ ] `ProtectedRoute` içinde.
- [ ] `user`’ı `useAuth()` ile al.
- [ ] Göster:
  - [ ] “Hoş geldin, {user.fullName}”
  - [ ] Kullanıcının rolüne göre basit placeholder menü:
    - [ ] student → öğrenci görünümü
    - [ ] faculty → öğretim üyesi görünümü
    - [ ] admin → admin görünümü

### 11.7 Profile Page (`/profile`)

- [ ] `ProtectedRoute` içinde.
- [ ] İlk açılışta:
  - [ ] `getCurrentUser()` ile backend’den profil bilgisi çek.
- [ ] Göster:
  - [ ] İsim, email, rol, department, numara vs.
- [ ] Profil düzenleme formu:
  - [ ] Örn: `fullName`, `phone`.
  - [ ] Submit → `updateProfile(data)`.
  - [ ] Başarılı → `AuthContext.setUser(updatedUser)` + success mesajı.
- [ ] Profil fotoğrafı upload:
  - [ ] File input.
  - [ ] Submit → `uploadProfilePicture(file)` (form-data).
  - [ ] Backend’ten dönen `profilePictureUrl` ile avatarı güncelle.

---

## 12. Hata Yönetimi ve UX İyileştirmeleri

- [ ] Her API çağrısında:
  - [ ] Loading state kullan (buton veya sayfa genelinde).
  - [ ] Hataları kullanıcı dostu mesajlara çevir.
- [ ] Global error handling stratejisi belirle:
  - [ ] Örneğin `apiClient.interceptors.response` içinde genel durumları yakalayarak.

---

## 13. Dokümantasyon ve Son Hazırlık (Frontend Perspektifi)

- [ ] `.env.example` dosyasını güncel tut.
- [ ] Frontend `README.md` içine:
  - [ ] Proje kurulumu (npm komutları).
  - [ ] `.env` ayarları.
  - [ ] “Nasıl çalıştırılır?” adımları.
- [ ] Hocanın istediği resmi markdown’lar için (PROJECT_OVERVIEW, USER_MANUAL_PART1 vs.):
  - [ ] Gerekli ekran görüntülerini al (Login, Register, Dashboard, Profile vb.).
  - [ ] Gerekirse bu frontend dokümanını referans alarak kullanıcı adımlarını yaz.

---

## 14. Bonus / İsteğe Bağlı

Zaman kalırsa (hocanın işi bittikten sonra ekstra güzellik):

- [ ] Register & reset password sayfalarına **password strength meter** ekle.
- [ ] Profil sayfasına basit tasarım iyileştirmeleri (card layout, grid vs.).
- [ ] Navbar’da mini kullanıcı menüsü (dropdown animasyonu, vs.).
