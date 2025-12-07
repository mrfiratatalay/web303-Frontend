Seni anladım, önce **birinci README**’yi tam detaylı, taş gibi yazalım.
Bunu istersen `README_FRONTEND_PART1.md` veya `AGENT_FRONTEND_PART1_README.md` diye kaydedebilirsin.

Aşağıyı **direkt dosya olarak** kopyalayıp koyabilirsin:

````md
# Frontend – Part 1 (Authentication & User Management)

Bu README, **Final Project – Part 1** kapsamındaki **FRONTEND** geliştirmesinin
nasıl yapılacağını ve hangi kurallara uyulacağını anlatan ana dokümandır.

> ⚠️ ÖNEMLİ:
> - **Backend “read-only”dir.** Hiçbir şekilde backend kodunu, veritabanını, migration’ları, modelleri DEĞİŞTİRMEYECEĞİZ.
> - Biz sadece **hocanın yazdığı/verdigi backend API’ye bağlanan React frontend’ini** geliştiriyoruz.
> - Tüm davranışlar, Final Project Assignment dokümanındaki **Part 1 – Frontend Görevleri** ile uyumlu olmak zorunda.

---

## 1. Amaç (Purpose)

Bu projenin Part 1 aşamasında frontend tarafında amaçlarımız:

1. Proje için **temel React frontend yapısını** kurmak.
2. Hocanın verdiği backend ile tam uyumlu çalışan bir **kimlik doğrulama (authentication)** ve **kullanıcı yönetimi (user management)** arayüzü geliştirmek.
3. Kullanıcının (öğrenci / akademisyen / admin) aşağıdaki işlemleri **arayüz üzerinden, gerçek backend’e istek atarak** yapabilmesini sağlamak:
   - Kayıt olma (register)
   - E-posta doğrulama (email verification)
   - Giriş yapma (login)
   - Şifre unutma / sıfırlama (forgot / reset password)
   - Profil görüntüleme
   - Profil bilgilerini güncelleme
   - Profil fotoğrafı yükleme
4. Tüm bu akışları **modern, temiz ve maintainable** bir React mimarisi ile kodlamak.

---

## 2. Altın Kurallar (Golden Rules)

Bu bölüm AI ajanları ve geliştirici için **kırmızı çizgileri** belirler.

### 2.1 Backend’e Dokunmak YASAK

- Backend kodu (Node, Express, PostgreSQL, ORM, migration, seed vb.) bu projenin bu kısmında **sabit** kabul edilir.
- Backend’i:
  - Değiştirmeyeceğiz,
  - Refactor etmeyeceğiz,
  - Yeni endpoint eklemeyeceğiz,
  - Database şemasını değiştirmeyeceğiz.
- Bizim görevimiz: **“Hazır backend’i doğru şekilde kullanabilen bir frontend yazmak.”**

### 2.2 Gerçek API “kaynak”tır

- Endpoint isimleri, request/response formatı, hata mesajları vb. için **esas olan gerçek çalışan backend**’dir.
- Eğer:
  - Hocanın PDF’inde yazan ile
  - Gerçek backend’in davranışı arasında fark olursa,
  → **Frontend gerçek backend’e uymak zorundadır.**
- İç dökümanlarda ideal bir API sözleşmesi (contract) kullanılabilir, ama son karar:
  - `console.log(realResponseFromBackend)` → **gerçek response ne diyorsa o**.

### 2.3 Hocanın Çerçevesine Bağlılık

- Part 1 için frontend’de geliştireceğimiz sayfalar, bileşenler ve akışlar **Final Project Assignment** dokümanındaki listeye birebir karşılık gelecek.
- Ekstra “uçan kaçan” özellikler, **hocanın beklediği temel davranışı bozmadığı sürece** eklenebilir (örn: daha güzel toast mesajları, daha hoş loader animasyonları), ama:
  - API sözleşmesini bozmayacağız,
  - Kullanıcı akışını radikal şekilde değiştirmeyeceğiz.

### 2.4 Mock Data Sadece Geliştirme / Test İçin

- Gerçek uygulamada (production/teslim modunda):
  - Tüm data gerçek backend’den gelecek.
- Mock, sadece:
  - Jest/RTL testlerinde,
  - Gerekirse küçük, izole dev playground’larında (örneğin Storybook tarzı) kullanılabilir.

### 2.5 Temiz Kod ve Okunabilirlik

- Component’ler:
  - Tek sorumluluk prensibine göre tasarlanmalı.
  - Tek dosya aşırı büyürse (örneğin 150+ satır), bölünmeli.
- Dosya isimleri, component isimleri, hook isimleri **anlamlı** olmalı.
- “Çalışıyor ama çorba” kod yerine, **yavaş ama temiz** kod tercih edilir.

---

## 3. Part 1’te Frontend’in Kapsamı

Bu bölümde, Part 1’te frontend tarafında **NELERİ YAPACAĞIZ** ve **NELERİ YAPMAYACAĞIZ** netleştiriliyor.

### 3.1 Dahil Olanlar (IN SCOPE)

Hocanın dokümanındaki **Frontend Görevleri** kısmına göre, Part 1 için frontend kapsamı:

#### 3.1.1 Proje Kurulumu

- React projesi oluşturma:
  - `npx create-react-app` **veya** `npm create vite@latest`
- Gerekli paketler:
  - `react-router-dom`
  - `axios`
  - `react-hook-form` **veya** `formik`
  - `yup`
  - Styling için:
    - Tailwind CSS **veya** Material-UI (bu projede varsayılan: **Tailwind**)
- Klasör yapısının oluşturulması:

```txt
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx (veya index.jsx)
├── .env.example
├── package.json
└── README.md
````

#### 3.1.2 Sayfalar

Her sayfa **hocanın PDF’inde tanımlandığı şekilde** React’te implement edilecek:

1. **Login Page** – `/login`
2. **Register Page** – `/register`
3. **Email Verification Page** – `/verify-email/:token`
4. **Forgot Password Page** – `/forgot-password`
5. **Reset Password Page** – `/reset-password/:token`
6. **Dashboard Page** – `/dashboard`
7. **Profile Page** – `/profile`

Her sayfanın detayı, aşağıda “Sayfalar ve Akışlar” bölümünde ayrıca anlatılacak.

#### 3.1.3 Ortak Bileşenler

* Navbar (kullanıcı menüsü + logout)
* Sidebar (navigasyon menüsü)
* ProtectedRoute (giriş yapmamış kullanıcıları login’e yönlendiren guard)
* Loading spinner
* Alert / Toast bildirimleri
* Form input bileşenleri:

  * TextInput
  * PasswordInput
  * SelectInput
  * CheckboxInput

#### 3.1.4 State Yönetimi ve Token Yönetimi

* Auth Context:

  * `user`, `accessToken`, `isLoading`, `error` vs.
  * `login`, `logout`, `loadCurrentUser`, `setUser` gibi fonksiyonlar.
* Token’ların localStorage / cookie üzerinden saklanması (backend’in desteklediği şekle göre).
* Axios instance + interceptors:

  * Her isteğe otomatik `Authorization: Bearer <accessToken>` header’ı ekleme.
  * 401 durumunda gerekirse refresh token akışı (backend destekliyorsa).

---

### 3.2 HARİÇ Olanlar (OUT OF SCOPE – Part 1 için)

Aşağıdakiler Part 1’te **frontend görevi değildir**:

* Akademik yönetim sayfaları (ders planlama, yoklama vs.).
* GPS attendance arayüzleri.
* Yemekhane, etkinlik, scheduling UI’ları.
* Admin tarafında detaylı analytics, statistik dashboard’lar.
* Backend tarafında:

  * Node.js projesi oluşturma,
  * Migration yazma,
  * Seed data ekleme,
  * Middleware, service, util geliştirme,
  * Backend testleri.

Bunlar proje genelinde var, ama **bizim şu anda sorumluluğumuz değil**.

---

## 4. Backend ile Entegrasyon Kuralları

### 4.1 Ortam Değişkenleri (Environment Variables)

Frontend, backend URL’sini `.env` üzerinden alır:

```bash
# .env (lokalde)
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

veya

```bash
REACT_APP_API_BASE_URL=http://localhost:5000/api/v1
```

> Vite kullanıyorsak `VITE_` prefix, CRA kullanıyorsak `REACT_APP_` prefix kullanılır.

### 4.2 Endpoint Kullanımı

* Her sayfa, kendi ihtiyacı olan backend endpoint’lerini kullanır.
* Endpoint isimleri, HTTP metotları ve body structure:

  * Başta hocanın dokümanındaki tanımlara göre tasarlanır,
  * Sonra mümkünse **gerçek backend’e istek atılıp test edilerek** netleştirilir.
* Örnek (teorik, gerçek backend’e göre güncellenecek):

```text
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/verify-email
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
GET  /api/v1/users/me
PUT  /api/v1/users/me
POST /api/v1/users/me/profile-picture
```

### 4.3 Hata Yönetimi

* Backend’ten gelen hata response’ları:

  * Mümkün oldukça olduğu gibi loglanır,
  * Kullanıcıya gösterilirken:

    * Türkçe, anlaşılır ve nazik bir mesaja dönüştürülür.
* Örnek:

  * Backend: `{"error": "AUTH_INVALID_CREDENTIALS"}`
  * Frontend kullanıcı mesajı: `"Email veya şifre hatalı."`

---

## 5. Sayfalar ve Kullanıcı Akışları

Bu bölüm, her sayfanın **amacını, URL’ini, backend ile ilişkisini** özetler.

### 5.1 Login Page – `/login`

* Kullanıcıdan:

  * Email
  * Password
  * (Opsiyonel) Remember me
* Validasyon:

  * Email formatı
  * Password boş olamaz
* Akış:

  1. Kullanıcı formu doldurup gönderir.
  2. Frontend → `POST /auth/login` (body: email, password).
  3. Backend doğruysa:

     * Access token + (varsa) refresh token + user bilgisi döner.
  4. Frontend:

     * Token’ları saklar (context + localStorage/cookie),
     * `user` state’ini günceller,
     * Kullanıcıyı `/dashboard`’a yönlendirir.
  5. Hata durumunda:

     * Form alanları altında/üstünde hata mesajı, toast vs.

### 5.2 Register Page – `/register`

* Alanlar:

  * Full name
  * Email
  * Password
  * Confirm password
  * User type (student/faculty)
  * Student number (student ise)
  * Department seçimi
  * Terms & conditions checkbox
* Kurallar:

  * Password en az 8 karakter, en az 1 büyük harf, en az 1 sayı.
  * Terms işaretlenmeden form gönderilemez.
* Akış:

  1. Form submit → `POST /auth/register`.
  2. Backend başarılı ise:

     * Kullanıcıya mail gönderildiğini ifade eden mesaj döner.
  3. Frontend:

     * Başarılı mesajı gösterir: “Lütfen emailinizi kontrol edin, doğrulama linkine tıklayın.”

### 5.3 Email Verification Page – `/verify-email/:token`

* URL’den `token` alınır (`useParams`).
* Component mount olduğunda:

  * `POST /auth/verify-email` (body: token).
* Başarılı:

  * “Email başarıyla doğrulandı, giriş yapabilirsiniz.” mesajı.
  * 2–3 saniye sonra `/login`’e redirect.
* Hatalı:

  * “Token geçersiz veya süresi dolmuş.” mesajı.

### 5.4 Forgot Password Page – `/forgot-password`

* Tek input: Email.
* Submit:

  * `POST /auth/forgot-password`
* Her durumda (güvenlik için):

  * “Eğer bu email ile kayıtlı bir hesap varsa, şifre sıfırlama linki gönderildi.” gibi nötr bir mesaj.

### 5.5 Reset Password Page – `/reset-password/:token`

* URL’den `token` alınır.
* Form:

  * Yeni şifre
  * Yeni şifre tekrar
* Yup ile şifre kuralları + eşleşme kontrolü.
* Submit:

  * `POST /auth/reset-password` (body: { token, password })
* Başarılı:

  * Bilgilendirme mesajı → `/login`’e redirect.

### 5.6 Dashboard Page – `/dashboard`

* ProtectedRoute ile korunur.
* Backende ek istek yapmak zorunda değil (minimum gereksinim).
* Kullanıcıya:

  * “Hoş geldin, {user.fullName}” mesajı.
  * Role bazlı basit menü:

    * student → öğrenci menü placeholder’ı
    * faculty → öğretim üyesi menü placeholder’ı
    * admin → admin menü placeholder’ı

### 5.7 Profile Page – `/profile`

* ProtectedRoute ile korunur.
* İlk açılışta:

  * `GET /users/me` çağrısı ile kullanıcı bilgisi backend’den çekilir.
* Arayüz:

  * Kullanıcının:

    * İsim, email, role, department, student/employee number gibi bilgileri.
  * Güncelleme formu:

    * Örn: isim, telefon, vb. (backend’in izin verdiği alanlar kadar).
  * Profil fotoğrafı yükleme:

    * File input (jpeg/png, max 5MB).
    * `POST /users/me/profile-picture` ile upload.
    * Success sonrası yeni resmin ekranda güncellenmesi.

---

## 6. State Yönetimi ve Auth Mantığı (Özet)

Detay mimari başka bir dokümanda olacak, ama burada özetleyelim:

* `AuthContext`:

  * `user`, `accessToken`, `isLoading`, `error`.
  * `login(credentials)`: backend’e login isteği atar, state’i günceller.
  * `logout()`: localStorage/cookie temizler, user/state sıfırlar.
  * `loadCurrentUser()`: token varsa `/users/me` ile profili çeker.
* `ProtectedRoute`:

  * Eğer `user` yoksa:

    * `/login` sayfasına yönlendirir.
  * Eğer `user` varsa:

    * İstenen sayfayı render eder.

---

