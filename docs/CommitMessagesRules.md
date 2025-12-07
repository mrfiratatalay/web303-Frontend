# AGENT Commit Message Conventions

**AI Agents için Commit Yazım Standartları**

Bu doküman, projede görev yapan tüm **AI ajanlarının** commit mesajlarını nasıl yazması gerektiğini tanımlar.
Her commit mesajı, _modern endüstri standartlarına uygun_, _anlamlı_, _temiz_ ve _tutarlı_ olmalıdır.

Bu kurallar, ajanların otomatik olarak commit mesajı oluştururken **insan senior developer kalitesinde** bir dil üretmesini sağlar.

---

## 📌 1. Genel İlke

Bir commit mesajı:

1. **Kısa, öz ve direkt olarak yapılan değişikliği anlatmalı.**
2. **Conventional Commit formatını** takip etmeli.
3. “Ne yaptığını” değil → **Ne değiştiğini / ne eklendiğini** anlatmalı.
4. İngilizce olmalı.
5. Takım tarafından kolayca takip edilebilir olmalı.
6. Gerektiğinde ek açıklama içererek çok adımlı değişiklikleri netleştirmeli.

---

## 📌 2. Commit Mesajı Formatı (Conventional Commit)

Ajanların kullanması gereken format şudur:

```

<type>: <short summary>

<body> (optional, multi-line)
```

### ✔️ `<type>` listesi

| type          | Ne zaman kullanılır?                                    |
| ------------- | ------------------------------------------------------- |
| **feat:**     | Yeni bir özellik eklendiğinde                           |
| **fix:**      | Bug / hata düzeltildiğinde                              |
| **chore:**    | Config, setup, dosya taşıma, script ekleme              |
| **refactor:** | Kodun davranışı değişmeden temizlenmesi                 |
| **style:**    | UI düzeni, CSS iyileştirmeleri, responsive düzenlemeler |
| **docs:**     | README veya markdown güncellemeleri                     |
| **perf:**     | Performans iyileştirmesi                                |
| **remove:**   | Kod / dosya / modül silindiğinde                        |
| **build:**    | Build sistemine ilişkin değişiklikler                   |

---

## 📌 3. Kısa Özet (short summary) Kuralları

Ajanlar kısa özeti şu şekilde yazmalıdır:

- **Küçük harfle başlar.**
- **En fazla 60 karakter** olmalıdır.
- Cümle değil → kısa teknik açıklama olmalıdır.
- Sonunda nokta olmaz.

✔️ **Doğru:**

```
feat: implement login page with form validation
```

❌ **Yanlış:**

```
feat: I implemented the login page and added validation to the form.
```

---

## 📌 4. Body (Opsiyonel Açıklama) Kuralları

Ajan commit body yazarken şu kurallara uyar:

- Değişikliğin _neden_ yapıldığını açıklar.
- Gerekiyorsa bullet list kullanır.
- Teknik detay verir, gereksiz laf kalabalığı yoktur.

Örnek body:

```
feat: implement profile picture upload flow

- added file input component
- integrated /users/me/profile-picture endpoint
- updated AuthContext to refresh user avatar after upload
```

---

## 📌 5. Ajanların Commit Atarken İzlemesi Gereken Strateji

Ajan commit atmadan önce aşağıdaki soruları kendine sorar:

1. **Bu değişiklik tek bir mantıksal işi mi yapıyor?**

   - Eğer commit birden fazla işi yapıyorsa → bölünür.

2. **Bu değişiklik kullanıcıya yeni bir fonksiyon mu sağlıyor?**

   - Evet → `feat:`

3. **Bir UI düzeni mi?**

   - Evet → `style:`

4. **Kod yeniden düzenlendi ama davranış değişmedi mi?**

   - Evet → `refactor:`

5. **Sadece konfigurasyon veya altyapı ayarı mı?**

   - Evet → `chore:`

6. **Bir sorunu, bug'ı düzelttim mi?**

   - Evet → `fix:`

7. **Belgelendirme mi güncelleniyor?**

   - Evet → `docs:`

Ajan bu sorulara göre commit türünü seçer.

---

## 📌 6. Her Ajanın Uyması Gereken Ek Kurallar

### ✔️ 6.1 Commit mesajında asla:

- “me”, “I”, “we”, “agent” kelimeleri kullanılmaz.
- Kişisel ifadeler yoktur.
- Cümle çok uzun olmaz.
- Türkçe commit yazılmaz → **Sadece İngilizce**.

### ✔️ 6.2 Ajanlar commit mesajlarında _insan gibi_ davranmak zorundadır:

- Teknik, temiz, minimal.
- Senior engineer ciddiyeti.

### ✔️ 6.3 Kod yazılmadan commit mesajı yazılmaz

Önce değişiklik uygulanır → sonra commit atılır.

---

## 📌 7. Sık Kullanılacak Commit Mesajı Örnekleri

Ajanların **Part 1** boyunca sıklıkla kullanacağı örnek commit mesajları:

### 🔹 Proje başlangıcı

```
chore: initialize frontend project with Vite
```

```
chore: setup Tailwind CSS configuration
```

```
chore: create initial folder structure
```

---

### 🔹 Context & API Layer

```
feat: implement AuthContext with basic auth state management
```

```
feat: add axios apiClient with auth header interceptor
```

```
feat: implement authApi with login, register, verify and reset endpoints
```

---

### 🔹 Reusable Components

```
feat: add reusable TextInput and PasswordInput components
```

```
feat: implement Alert and Toast feedback components
```

```
feat: create ProtectedRoute and main Layout structure
```

---

### 🔹 Auth Pages

```
feat: implement LoginPage with react-hook-form and yup validation
```

```
feat: implement RegisterPage with conditional fields and validation
```

```
feat: add VerifyEmailPage with token validation logic
```

---

### 🔹 Dashboard & Profile

```
feat: create DashboardPage with welcome message and role-based UI
```

```
feat: implement ProfilePage with user fetch and profile update
```

```
feat: add profile picture upload flow with multipart form-data
```

---

### 🔹 UI / Refactor / Style

```
style: improve spacing, button styles and responsive layout
```

```
refactor: extract repeated logic into custom hook useAxiosAuth
```

```
chore: update .env.example with backend API url
```

---

## 📌 8. Tek Committe Çok İş Yapmak YASAK

Ajanlar şu hatayı yapamaz:

❌ **Yanlış örnek:**

```
feat: implement login page and also created layout component and updated api client
```

Doğrusu → commit 3’e bölünür:

```
feat: implement LoginPage with validation
feat: create Layout component for authenticated pages
refactor: update apiClient to attach Authorization header
```

---

## 📌 9. Pull Request Mesaj Şablonu (Ajanlar İçin)

Pull request açılırsa şu format kullanılmalı:

```
## Summary
Kısa özet.

## Changes
- Madde 1
- Madde 2
- Madde 3

## Notes
Gerekiyorsa teknik notlar.

## Testing
Bu PR'ın doğru çalıştığı nasıl doğrulandı?
Manual test açıklaması yazılabilir.
```

---

## 📌 10. Son Kural:

**Ajanların attığı her commit tek bir amacı net şekilde ifade etmeli.**
Eğer commit mesajı “bunu yazsam yeterli mi?” sorusunu uyandırıyorsa → yetersizdir.

Ajanlar şu 3 şeye dikkat eder:

1. **Netlik**
2. **Kısa & öz**
3. **Tutarlılık**

---

Bu commit konvansiyonu → tüm AI ajanlarının tek tip, profesyonel, temiz commit mesajları üretmesini sağlar.
Senior level bir developer’ın kullandığı standardın aynısıdır.
