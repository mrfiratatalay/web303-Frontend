Tamam, direkt veriyorum. Bunu aynen bir dosya olarak kaydedebilirsin:

**`AGENT_UI_GUIDELINES.md`**

````md
# AGENT UI GUIDELINES

**Frontend UI Rules for AI Agents (Cannot Be Ignored)**

> This document defines EXACTLY how the frontend UI must be built.
> AI agents MUST NOT "decide" UI libraries or styles.
> All decisions are already made by the Senior Developer.
> Agents only FOLLOW these rules.

---

## 1. Purpose

This document tells AI agents **how to build the UI** for the frontend project:

- Which UI libraries to use
- How to structure layouts
- How to build forms
- How to make things responsive
- Which components to use for which job

Agents **MUST NOT**:

- Choose new libraries
- Invent their own design system
- Write random CSS

Agents **MUST**:

- Use the tools defined here
- Follow the patterns defined here
- Keep the UI consistent across all pages

---

## 2. UI Tech Stack (Fixed Decision)

Agents MUST use the following UI stack:

1. **Material UI (MUI)** – **PRIMARY UI LIBRARY**
2. **Tailwind CSS** – SECONDARY utility layer (layout helper)
3. **Icons** – `@mui/icons-material` and/or **Lucide Icons**

Agents are NOT allowed to use any other UI framework.

---

## 3. Golden Rules (Read Carefully)

1. **MUI is the main component library.**

   - Buttons, inputs, forms, cards, dialogs, snackbars, grids, navigation → **MUI components only**.

2. **Tailwind is only for layout and small styling.**

   - Use Tailwind for: spacing, flex, grid, alignment, responsive layout.
   - Do NOT recreate a button with Tailwind if MUI `<Button>` already exists.

3. **No other UI libraries.**

   - ❌ No Bootstrap
   - ❌ No Chakra UI
   - ❌ No Ant Design
   - ❌ No Mantine
   - ❌ No DaisyUI
   - ❌ No random CSS frameworks

4. **No crazy custom CSS.**

   - Only small custom CSS when absolutely necessary.
   - No large `.css` files with custom design systems.
   - Prefer MUI props + Tailwind classes.

5. **Consistency is more important than creativity.**
   - All pages must feel like they belong to the same app.
   - Same button style, same input style, same spacing philosophy.

---

## 4. Components – What to Use for What

### 4.1 Buttons

- Always use MUI `<Button>`.
- Variants:
  - `variant="contained"` → primary actions (e.g. "Login", "Save")
  - `variant="outlined"` → secondary actions
  - `variant="text"` → less important actions (e.g. "Cancel")

**Example:**

```jsx
import Button from '@mui/material/Button';

<Button type="submit" variant="contained" fullWidth disabled={isSubmitting}>
  Login
</Button>;
```
````

---

### 4.2 Text Inputs

- Always use MUI `<TextField>` for inputs in forms.
- Use `error` + `helperText` for validation errors.
- Never create a custom `<input>` if `<TextField>` can do the job.

**Example:**

```jsx
import TextField from '@mui/material/TextField';

<TextField
  label="Email"
  type="email"
  fullWidth
  margin="normal"
  {...register('email')}
  error={!!errors.email}
  helperText={errors.email?.message}
/>;
```

---

### 4.3 Password Input

- Use `<TextField type="password">` with `InputAdornment` + icon to toggle visibility.

**Pattern:**

- Use MUI components:

  - `TextField`
  - `IconButton`
  - `InputAdornment`
  - `Visibility`, `VisibilityOff` icons

Agents MUST follow this pattern, not invent their own.

---

### 4.4 Layout & Containers

- Use MUI `<Box>` + Tailwind classes for layout.
- Or MUI `<Grid>` for more complex responsive layouts.

**Example layout container:**

```jsx
import Box from '@mui/material/Box';

<Box className="min-h-screen flex items-center justify-center bg-slate-50">
  <Box className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">{/* Form content here */}</Box>
</Box>;
```

> Tailwind is used here for flexbox and spacing.
> The content inside uses MUI components.

---

### 4.5 Grid Layout (Responsive)

- Use MUI `<Grid container>` and `<Grid item>`.

**Example:**

```jsx
import Grid from '@mui/material/Grid';

<Grid container spacing={2}>
  <Grid item xs={12} md={6}>
    {/* Left side */}
  </Grid>
  <Grid item xs={12} md={6}>
    {/* Right side */}
  </Grid>
</Grid>;
```

Agents MUST prefer MUI Grid for two-column layouts.

---

### 4.6 Cards

- Use MUI `<Card>`, `<CardContent>`, `<CardHeader>`, `<CardActions>`.

**Example:**

```jsx
import { Card, CardContent, CardHeader } from '@mui/material';

<Card>
  <CardHeader title="Profile" />
  <CardContent>{/* profile details */}</CardContent>
</Card>;
```

---

### 4.7 Alerts and Notifications

- Page-level static messages → MUI `<Alert>`.
- Temporary notifications → MUI `<Snackbar>` (optionally combined with `<Alert>`).

**Example:**

```jsx
import Alert from '@mui/material/Alert';

<Alert severity="error">Invalid email or password.</Alert>;
```

Agents MUST NOT build their own alert styles if `<Alert>` is enough.

---

### 4.8 Dialogs / Modals

- Always use MUI `<Dialog>`, `<DialogTitle>`, `<DialogContent>`, `<DialogActions>`.

No custom modal implementation with Tailwind only.

---

### 4.9 Icons

- Use `@mui/icons-material` or **Lucide Icons** consistently.
- Do NOT import random SVGs from the internet.

**Example:**

```jsx
import { Visibility, VisibilityOff } from '@mui/icons-material';
```

---

## 5. Tailwind Usage Rules

Tailwind is allowed, but ONLY for:

- `flex`, `grid`, `items-center`, `justify-between`, etc.
- `p-*`, `m-*`, `gap-*`
- `w-*`, `h-*`, `max-w-*`
- `rounded-*`, `shadow-*`
- `bg-*` for page backgrounds (not on MUI components if theme used)
- Responsive helpers: `sm:`, `md:`, `lg:`

**Agents MUST NOT:**

- Build custom form components with Tailwind when MUI has existing ones.
- Over-stylize MUI components with too many Tailwind classes.

---

## 6. Forms – Standard Pattern

All forms (Login, Register, Forgot, Reset, Profile) must:

1. Use **React Hook Form** + Yup for validation.
2. Use **MUI TextField** for inputs.
3. Use MUI Button for submit.
4. Show errors under fields using `helperText`.

**Standard structure:**

```jsx
<form onSubmit={handleSubmit(onSubmit)} noValidate>
  <TextField
    label="Email"
    fullWidth
    margin="normal"
    {...register('email')}
    error={!!errors.email}
    helperText={errors.email?.message}
  />

  <TextField
    label="Password"
    type="password"
    fullWidth
    margin="normal"
    {...register('password')}
    error={!!errors.password}
    helperText={errors.password?.message}
  />

  <Button type="submit" variant="contained" fullWidth disabled={isSubmitting} sx={{ mt: 2 }}>
    Login
  </Button>
</form>
```

Agents MUST reuse this pattern instead of inventing a new form style every time.

---

## 7. Page Layout Standards

### 7.1 Auth Pages (login, register, forgot, reset, verify)

- Centered card on a light background.
- Max width: around `max-w-md` or MUI `maxWidth="sm"`.
- Use MUI Paper/Card OR a `Box` with Tailwind `shadow` + `rounded`.

**Example:**

```jsx
<Box className="min-h-screen flex items-center justify-center bg-slate-100">
  <Box className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">{/* AUTH PAGE CONTENT */}</Box>
</Box>
```

### 7.2 Dashboard / Profile

- Use a main layout with:

  - Navbar on top
  - Sidebar on the left (desktop)
  - Content area on the right

Agents MUST NOT create random layout variations.

---

## 8. RESPONSIVENESS RULES

Agents MUST ensure:

- Auth pages: look good on mobile and desktop.
- Dashboard/Profile: sidebar collapses or becomes a drawer on mobile.

Tools:

- MUI `Grid`, `Box`, `useMediaQuery`
- Tailwind `md:`, `lg:` for simple layout changes.

Example:

- On mobile: form is full width.
- On desktop: form is centered with max width.

---

## 9. Forbidden Patterns

Agents MUST NOT:

- Import Bootstrap or any CSS framework except Tailwind.
- Use inline styles everywhere (`style={{ ... }}` spam).
- Create custom button components that imitate MUI Button.
- Use raw `<input>` for form fields (except very special cases).
- Create inconsistent spacing (e.g., random `mt-3`, `mt-7`, `mt-1` without logic).

---

## 10. Quick Checklist for Agents

Before finishing any UI change, the agent MUST check:

- [ ] Did I use MUI components where possible?
- [ ] Did I only use Tailwind for layout/spacing?
- [ ] Are buttons all MUI `<Button>` components?
- [ ] Are inputs all MUI `<TextField>` components?
- [ ] Are error messages shown using `error` + `helperText`?
- [ ] Is the layout responsive (mobile + desktop)?
- [ ] Did I avoid introducing any new UI library?

If any of these are violated → the implementation is WRONG and must be fixed.

---

## 11. Final Rule

> **Agents do NOT design. Agents only implement.**
> All design decisions are defined here by the Senior Developer.
> Any deviation from these rules is considered a bug.
