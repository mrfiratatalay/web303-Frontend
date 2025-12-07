# ⭐ SENIOR KARAR (kesin ve değişmez):

## 👉 **Frontend kesinlikle TypeScript ile yazılacak.**

## 👉 **Ajanlar JavaScript YASAK.**

## 👉 **React TS template kullanılacak.**

## 👉 **Tüm context, hooks, services, API modelleri TypeScript olacak.**

---

# 💀 JavaScript’in bu projede yaratacağı felaketler:

- API response tipleri kaybolur → hatalar UI’ya kadar taşınır
- Ajanlar yanlış field isimleri kullanır
- Backend’e yanlış payload gönderilir
- “user.fullName undefined” gibi runtime hatalar çıkar
- Büyük dosyalar okunamaz hale gelir
- Refactor yapmak imkânsızlaşır
- Component prop’larında ajanlar yanlış veri kullanır

**TypeScript tüm bunları engelliyor.**

Ve bir senior olarak **TS kullanmamak bu projede intihar**.

Sen beni öldürmeden ben projeyi kurtarıyorum.
Şimdi ajanlar için özel bir **UI + Architecture + Code Writing TypeScript KURALI** yazıyorum.

Bu dosyayı direkt `AGENT_TYPESCRIPT_RULES.md` olarak koyacaksın:

---

# 📄 `AGENT_TYPESCRIPT_RULES.md`

**AI Agents MUST Use TypeScript at All Times**

```md
# AGENT TYPESCRIPT RULES

Mandatory TypeScript Standards for All AI Agents

## 1. TypeScript is REQUIRED

AI agents MUST write ALL frontend code using **TypeScript**.
JavaScript is strictly forbidden.

This includes:

- Components (`.tsx`)
- Hooks (`.ts` or `.tsx`)
- Context files
- API clients
- Utility functions
- Interfaces and types

## 2. Project MUST be created using the TypeScript React template

Agents MUST use:
```

npm create vite@latest frontend -- --template react-ts

````

NOT the JavaScript template.

## 3. All React components MUST be `.tsx` files

Correct:
- `LoginPage.tsx`
- `AuthContext.tsx`

Incorrect:
- `LoginPage.jsx`
- `AuthContext.js`

## 4. All API responses MUST have TypeScript interfaces

Agents MUST declare types like this:

```ts
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: "student" | "faculty" | "admin";
  departmentId?: string;
  profilePictureUrl?: string;
}
````

No “any” type is allowed unless explicitly stated.

## 5. Auth Context MUST have strict types

Agents MUST define:

```ts
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}
```

## 6. Axios services MUST define request/response types

Agents MUST write:

```ts
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const res = await apiClient.post<LoginResponse>('/auth/login', data);
  return res.data;
};
```

No untyped Axios calls allowed.

## 7. Forms MUST have typed form schemas

Correct:

```ts
interface LoginFormValues {
  email: string;
  password: string;
}
```

Incorrect:

```ts
const onSubmit = (data) => { ... } // NO
```

## 8. UI components MUST define prop types properly

Correct:

```ts
interface TextInputProps {
  label: string;
  name: string;
  type?: string;
  error?: string;
}
```

Agents MUST NEVER use:

```tsx
function TextInput(props: any) {} // FORBIDDEN
```

## 9. No "implicit any"

TypeScript config MUST include:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true
  }
}
```

## 10. Violating these rules = invalid output

If an agent writes JavaScript OR untyped TypeScript,
the output MUST be rejected and corrected immediately.

```

---

# 🧨 SON SÖZ (Senior Reality Check)

Senin projen:

- Büyük
- Gerçek kullanıcı rolleri var
- Auth sistemi var
- Form validasyonu çok
- API uçları çok
- Ajanlar yardımıyla gelişecek

**TypeScript ZORUNLU.**
TS olmadan bu proje patlar.

Hoca bile fark eder:
"Bu kod çok güvensiz, çok basit, çok juniorsun" der.

TS kullanınca:
“Vay be… Bu çocuk profesyonel çalışmış.” der.

---
```
