# AGENT UI GUIDELINES

**Frontend UI Rules for AI Agents (Cannot Be Ignored)**

> MUI ana kütüphane, Tailwind sadece layout için yardımcıdır. Yeni UI kütüphanesi eklemek yasak.

## 1. UI Tech Stack (Sabit)
1. **Material UI (MUI)** — **PRIMARY**
2. **Tailwind CSS** — sadece layout/spacing
3. İkonlar: `@mui/icons-material` veya Lucide

## 2. Kurallar
- Tüm buton/input/card/alert vb. **MUI** komponentleriyle.
- Tailwind: `flex`, `grid`, `gap`, `p-*`, `bg-*` gibi layout/spacing.
- Yeni UI framework ekleme, custom CSS design system yazma yok.
- Tutarlılık: aynı spacing, aynı buton varyantları.

## 3. Form Paterni (Login/Register/Forgot/Reset/Verify/Profile)
- **React Hook Form + Yup**
- **MUI TextField** + `error` & `helperText`
- **MUI Button** (primary: `variant="contained"` fullWidth)
- Hatalar: MUI `<Alert severity="error">`
- Layout: ortada card/paper, `p-6`/`p-8`, `max-w-md` (register için genişleyebilir ama aynı padding), üstte başlık + açıklama, altta yönlendirme linki.

Örnek:
```tsx
<Box className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
  <Paper className="w-full max-w-md p-6">
    <Typography variant="h5">Login</Typography>
    {error && <Alert severity="error">{error}</Alert>}
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <TextField {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
      <Button type="submit" variant="contained" fullWidth>Login</Button>
    </Box>
  </Paper>
</Box>
```

## 4. Layout
- Navbar + Sidebar + Content (Layout bileşeni) MUI + Tailwind layout.
- Sidebar desktop’ta görünür (`md:block`), mobilde gizli (Part 1’de drawer zorunlu değil).
- Sayfalar arası spacing tutarlı (`Container` + `py-4`).

## 5. Alert / Toast
- Statik mesajlar: MUI `<Alert severity="...">`
- Geçici bildirim: MUI `<Snackbar>` + `<Alert>`

## 6. Yasaklar
- Bootstrap/Chakra/Ant/Mantine/DaisyUI vb. eklemek yok.
- Raw `<input>` ile form kurma yok (MUI TextField varken).
- Rastgele spacing, inconsistent button stilleri yok.

## 7. Checklist
- [ ] MUI komponentleri kullanıldı
- [ ] Tailwind sadece layout/spacing
- [ ] Formlar RHF + Yup + TextField + Button
- [ ] Hata mesajları `error + helperText` veya Alert
- [ ] Card/Paper layout, tutarlı padding/spacing
- [ ] ProtectedRoute + Layout ile Navbar/Sidebar tutarlı
