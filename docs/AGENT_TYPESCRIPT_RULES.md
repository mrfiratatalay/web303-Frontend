# AGENT TYPESCRIPT RULES

## Temel Ayarlar
- **Strict mode açık:** `strict: true`
- **noImplicitAny:** `true`
- **strictNullChecks:** `true`
- TS config dosyaları: `tsconfig.json` + `tsconfig.node.json`

## Kodlama Kuralları
- `any` yasak (zorunluysa tip tanımla).
- Backend response’larını unwrap ederken tip belirt (`<T>` generic veya tipli helper).
- React bileşenleri için proper prop tipleri (örn. `ReactNode`, `SubmitHandler<T>`).
- Custom hook’lar context null dönerse guard et (örn. `useAuth` içinde throw).
- Form tipleri için interface/`type` kullan (örn. `LoginForm`, `ProfileForm`).

## UI + TS
- MUI bileşenlerinde RHF register kullanırken bileşen prop tipleriyle çakışan alanları omit et (örn. `Omit<TextFieldProps, 'name' | 'error'>`).
- Alert/Toast gibi bileşenlerde MUI tiplerini (`AlertColor`, `SnackbarCloseReason`) kullan.

## Doğrulama
- Yup şemaları ASCII tutulur (özel karakterler sorun çıkarıyorsa). 
- Şema tiplerini RHF ile bağla (`yupResolver`).

## Çalıştırma
- `npm run build` TypeScript hatalarını yakalar; build kırılmamalı.
- Yeni tip eklerken `import type { ... }` kullanarak tree-shake dostu kal.
