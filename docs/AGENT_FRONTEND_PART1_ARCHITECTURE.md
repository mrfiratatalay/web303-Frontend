# Frontend – Part 1 Architecture

Bu doküman, **Final Project – Part 1** için geliştireceğimiz **React frontend uygulamasının mimarisini** anlatır.

Bu dosyayı okuyan herkes (sen + AI ajanlar):

- Proje hangi teknolojileri kullanıyor?
- Klasör yapısı nasıl?
- Auth nerede, context nerede, routing nerede?
- Axios, form, layout ve bileşenler nasıl organize edildi?

sorularının cevabını burada bulmalı.

> ⚠️ Hatırlatma:
>
> - Backend tamamen **read-only** (hiçbir şekilde değiştirmiyoruz).
> - Bu mimari, **hocanın verdiği mevcut backend’e bağlanan** bir frontend için tasarlanmıştır.
> - **Frontend tarafında test (Jest, RTL vb.) yazılmayacaktır.**

---

## 1. Teknoloji Kararları (Frontend Stack)

### 1.1 Ana Teknolojiler

- **React 18+**
- **Vite** (önerilen bundler; hızlı dev deneyimi)
- **React Router v6** (routing)
- **React Hook Form** (form yönetimi)
- **Yup** (form validasyonu – şema tabanlı)
- **Axios** (HTTP istekleri)
- **Tailwind CSS** (stil ve layout)

### 1.2 Neden Bu Kararlar?

- **React Hook Form + Yup**
  - Bir sürü form var: login, register, forgot password, reset password, profile…
  - Performanslı, basit ve tekrar kullanılabilir component yapısını destekliyor.
- **Axios + Interceptors**
  - Tek yerden base URL, header’lar ve auth token yönetimi.
  - Hata yönetimini merkezi hâle getirmek kolaylaşıyor.
- **Tailwind CSS**
  - Utility-first, hızlı layout ve responsive tasarım.
  - Tasarım sistemi kurarken küçük bileşenlerle ilerlemeyi kolaylaştırıyor.

> Not: Test kütüphaneleri (Jest, React Testing Library vb.) **kullanılmayacak**.

---

## 2. Klasör Yapısı (Folder Structure)

Proje kök dizini:

```txt
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── layout/
│   │   ├── form/
│   │   ├── feedback/
│   │   └── routing/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── error/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── .env
├── .env.example
├── index.html
├── package.json
└── README.md
```

````

Her klasörün rolünü netleştirelim.

---

### 2.1 `src/assets/`

- Statik görseller, ikonlar, logolar:

  - Örnek:

    - `src/assets/logo.svg`
    - `src/assets/default-avatar.png`

---

### 2.2 `src/components/`

Sayfalardan bağımsız, tekrar kullanılabilir UI bileşenleri.

#### 2.2.1 `components/layout/`

```txt
components/layout/
├── Navbar.jsx
├── Sidebar.jsx
└── Layout.jsx
```

- `Navbar.jsx`

  - Uygulama başlığı/logo.
  - Kullanıcı adı + avatar + dropdown (Profile, Logout).

- `Sidebar.jsx`

  - `/dashboard`, `/profile` gibi linkleri içeren navigasyon menüsü.

- `Layout.jsx`

  - Authenticated layout:

    - Üstte `Navbar`
    - Solda `Sidebar`
    - Sağda/ortada içerik (React Router `<Outlet />` ile)

#### 2.2.2 `components/form/`

```txt
components/form/
├── TextInput.jsx
├── PasswordInput.jsx
├── SelectInput.jsx
└── CheckboxInput.jsx
```

- Hepsi **React Hook Form** ile uyumlu tasarlanacak.
- `TextInput`:

  - Label, input, hata mesajı, opsiyonel açıklama.

- `PasswordInput`:

  - `TextInput` + şifre göster/gizle butonu.

- `SelectInput`:

  - Department, userType (student/faculty) gibi dropdown seçimler için.

- `CheckboxInput`:

  - Remember me, Terms & Conditions gibi checkbox’lar için.

Bu sayede sayfa kodları sade kalacak, form UI davranışını bileşenler handle edecek.

#### 2.2.3 `components/feedback/`

```txt
components/feedback/
├── Alert.jsx
├── Toast.jsx
└── LoadingSpinner.jsx
```

- `Alert.jsx`:

  - Sayfanın üstünde “danger / success / info” mesaj kutusu.

- `Toast.jsx`:

  - Sağ üst köşede kısa süre görünen bildirimler.

- `LoadingSpinner.jsx`:

  - Buton içinde veya sayfa ortasında kullanılan loader.

#### 2.2.4 `components/routing/`

```txt
components/routing/
└── ProtectedRoute.jsx
```

- `ProtectedRoute`:

  - Kullanıcı **giriş yapmamışsa**:

    - `/login`’e yönlendirir.

  - Giriş yapmışsa:

    - İçerideki çocuk bileşenleri render eder.

---

### 2.3 `src/context/`

Global state’ler (özellikle auth) için.

```txt
context/
└── AuthContext.jsx
```

- `AuthContext.jsx`:

  - `AuthContext` nesnesi ve `AuthProvider` komponenti.
  - İçindeki state:

    - `user`
    - `accessToken`
    - `isLoading`
    - `error`

  - Sağladığı fonksiyonlar:

    - `login(credentials)`
    - `logout()`
    - `setUser(user)`
    - `initializeAuth()` (app ilk açıldığında storage’dan token yükleyip `/users/me` çağırmak için)

---

### 2.4 `src/hooks/`

Custom hook’lar:

```txt
hooks/
├── useAuth.js
└── useAxiosAuth.js   # (opsiyonel)
```

- `useAuth.js`:

  - `AuthContext`’i rahatça kullanmak için basit bir wrapper.

- `useAxiosAuth.js` (istersek):

  - Auth bilgisine göre axios instance hazırlayan yardımcı hook.

---

### 2.5 `src/pages/`

Uygulamadaki sayfalar.

```txt
pages/
├── auth/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── VerifyEmailPage.jsx
│   ├── ForgotPasswordPage.jsx
│   └── ResetPasswordPage.jsx
├── dashboard/
│   └── DashboardPage.jsx
├── profile/
│   └── ProfilePage.jsx
└── error/
    └── NotFoundPage.jsx
```

- `auth/` içindekiler → login/register/forgot/reset/verify akışları.
- `dashboard/` → giriş sonrası ana sayfa.
- `profile/` → profil görüntüleme & güncelleme.
- `error/NotFoundPage.jsx` → 404 sayfası.

---

### 2.6 `src/services/`

API katmanı:

```txt
services/
├── apiClient.js
└── authApi.js
```

- `apiClient.js`:

  - `axios.create()` ile oluşturulmuş tek bir instance.
  - `baseURL`: `.env` → `VITE_API_BASE_URL`.
  - Request interceptor:

    - `Authorization: Bearer <token>` header’ı ekler (token varsa).

  - Response interceptor:

    - Hata yönetimi yapılır (örneğin 401 durumda kullanıcıyı logout etmek).

- `authApi.js`:

  - Backend ile konuşmak için küçük helper fonksiyonlar:

    - `login(data)`
    - `register(data)`
    - `verifyEmail(token)`
    - `forgotPassword(email)`
    - `resetPassword({ token, password })`
    - `getCurrentUser()`
    - `updateProfile(data)`
    - `uploadProfilePicture(file)`

Endpoint path’leri **gerçek backend’e göre** ayarlanacaktır.

---

### 2.7 `src/utils/`

Yardımcı fonksiyonlar ve şemalar:

```txt
utils/
├── storage.js
└── validationSchemas.js
```

- `storage.js`:

  - `localStorage` işlemlerini merkezileştirir:

    - `saveAuth({ user, accessToken })`
    - `loadAuth()`
    - `clearAuth()`

- `validationSchemas.js`:

  - Tüm Yup şemaları tek yerde:

    - `loginSchema`
    - `registerSchema`
    - `forgotPasswordSchema`
    - `resetPasswordSchema`
    - `profileSchema` (gerekirse)

---

### 2.8 `main.jsx` ve `App.jsx`

#### `main.jsx`

- Uygulamanın giriş noktası:

  - `BrowserRouter`
  - `AuthProvider`
  - Tailwind CSS import’u

Örnek iskelet:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css'; // Tailwind giriş dosyası

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
```

#### `App.jsx`

- Tüm route’ların tanımlandığı yer:

```jsx
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/routing/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotFoundPage from './pages/error/NotFoundPage';
import Layout from './components/layout/Layout';

function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* PROTECTED ROUTES */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
```

---

## 3. Routing Mimarisi

### 3.1 Route Tablosu

| Path                     | Component            | Erişim    | Açıklama                           |
| ------------------------ | -------------------- | --------- | ---------------------------------- |
| `/login`                 | `LoginPage`          | Public    | Giriş formu                        |
| `/register`              | `RegisterPage`       | Public    | Kayıt formu                        |
| `/verify-email/:token`   | `VerifyEmailPage`    | Public    | Email doğrulama                    |
| `/forgot-password`       | `ForgotPasswordPage` | Public    | Şifre sıfırlama isteği             |
| `/reset-password/:token` | `ResetPasswordPage`  | Public    | Yeni şifre belirleme               |
| `/dashboard`             | `DashboardPage`      | Protected | Hoş geldin ekranı + rol bazlı menü |
| `/profile`               | `ProfilePage`        | Protected | Profil görüntüleme/güncelleme      |
| `*`                      | `NotFoundPage`       | Public    | 404                                |

### 3.2 `ProtectedRoute` Davranışı

Basit mantık:

- Eğer `user` yok → `/login`’e yönlendir.
- Eğer `user` var → çocukları render et.

Pseudo:

```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../feedback/LoadingSpinner';

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
```

---

## 4. Auth Mimarisi

### 4.1 Auth State Yapısı

`AuthContext` içinde tutulacak state:

```js
const initialState = {
  user: null, // backend'ten gelen user objesi
  accessToken: null, // backend'ten gelen JWT
  isLoading: true, // uygulama açılırken auth kontrolü
  error: null, // auth ile ilgili son hata mesajı
};
```

### 4.2 Auth Akışı

- Uygulama açıldığında:

  1. `storage.loadAuth()` ile localStorage’dan token & user bilgisi okunur.
  2. Token varsa istenirse `/users/me` ile doğrulanabilir.
  3. Sonuca göre `user` set edilir veya temizlenir.
  4. `isLoading` false yapılır.

- `login(credentials)`:

  1. `authApi.login(credentials)` → backend’e istek.
  2. Başarılı: `user` + `accessToken` state + storage’a yazılır.
  3. Başarısız: `error` state set edilir, UI’da gösterilir.

- `logout()`:

  1. `user` ve `accessToken` state’ten temizlenir.
  2. `storage.clearAuth()` ile localStorage temizlenir.
  3. İsteğe bağlı: backend’e `/auth/logout` isteği gönderilebilir.

---

## 5. API Katmanı

### 5.1 `apiClient.js`

```js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Vite formatı
  withCredentials: true, // backend cookie kullanıyorsa
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Burada istersen 401 yakalayıp logout yapabilirsin
    // veya error.response.data üzerinden mesaj çıkarabilirsin.
    return Promise.reject(error);
  },
);

export default apiClient;
```

### 5.2 `authApi.js`

```js
import apiClient from './apiClient';

export const login = (data) => apiClient.post('/auth/login', data);
export const register = (data) => apiClient.post('/auth/register', data);

export const verifyEmail = (token) => apiClient.post('/auth/verify-email', { token });

export const forgotPassword = (email) => apiClient.post('/auth/forgot-password', { email });

export const resetPassword = ({ token, password }) =>
  apiClient.post('/auth/reset-password', { token, password });

export const getCurrentUser = () => apiClient.get('/users/me');

export const updateProfile = (data) => apiClient.put('/users/me', data);

export const uploadProfilePicture = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post('/users/me/profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
```

> Endpoint yolları backend’e göre değiştirilebilir; önemli olan frontend’in backend’e uymasıdır.

---

## 6. Form & Validasyon Katmanı

### 6.1 `validationSchemas.js`

```js
import * as Yup from 'yup';

export const loginSchema = Yup.object({
  email: Yup.string().email('Geçerli bir email adresi girin').required('Email zorunludur'),
  password: Yup.string().required('Şifre zorunludur'),
});

export const registerSchema = Yup.object({
  fullName: Yup.string().required('İsim zorunludur'),
  email: Yup.string().email('Geçerli bir email adresi girin').required('Email zorunludur'),
  password: Yup.string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .matches(/[A-Z]/, 'Şifre en az bir büyük harf içermeli')
    .matches(/[0-9]/, 'Şifre en az bir rakam içermeli')
    .required('Şifre zorunludur'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Şifreler eşleşmiyor')
    .required('Lütfen şifreyi tekrar girin'),
  userType: Yup.string()
    .oneOf(['student', 'faculty'], 'Geçerli kullanıcı tipi seçin')
    .required('Kullanıcı tipi zorunludur'),
  // Diğer alanlar (studentNumber, departmentId vb.) backend gereksinimine göre eklenecek
});
```

Formlarda React Hook Form + `yupResolver` kullanılarak bu şemalar bağlanacak.

---

## 7. UI / UX Prensipleri

- **Mobile-first**:

  - Tailwind ile `flex`, `grid`, `p-4`, `gap-4`, `md:` breakpoint’leri.

- **Basit ve okunabilir tasarım**:

  - Az renk, net kontrast, temiz font.

- **Form deneyimi**:

  - Label + input + hata mesajı standardı.
  - Submit sırasında buton disabled + `LoadingSpinner` göstermek.

- **Feedback**:

  - Önemli mesajlar için `Alert`.
  - Kısa bilgi için `Toast` (success/error).

---

## 8. Özet

Bu mimari doküman:

- Projenin frontend klasör yapısını,
- Routing düzenini,
- Auth context ve API katmanını,
- Form ve validasyon yaklaşımını,
- UI/UX prensiplerini

tanımlar.

> **Not:** Frontend tarafında **herhangi bir test (Jest, RTL vb.) yazılmayacaktır.**
> Odak: Temiz mimari + hocanın istediği akışların eksiksiz çalışmasıdır.
````
