# Lookup Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the PVI "Tra cứu" (lookup) homepage matching `docs/ui/lookup-homepage.png` — UI + static data only, no API.

**Architecture:** Greenfield. Scaffold the documented foundation (Tailwind v4 CSS-first + Ant Design + TanStack Router with a QueryClient in context), then compose the page from small components: shared chrome (`SiteHeader`, `SiteFooter`) lives in the TanStack Router root-layout; the route renders `LookupPage` = `LookupHero` + `LookupForm`. The `Tra cứu` button is a no-op that logs the selected values.

**Tech Stack:** Vite 8, React 19 (React Compiler via Babel — preserve), TypeScript (`verbatimModuleSyntax`, `erasableSyntaxOnly`), Tailwind CSS v4 (`@tailwindcss/vite`, CSS-first, no `tailwind.config.ts`), Ant Design (themed via one `ConfigProvider`), TanStack Router (code-based), TanStack Query (provider only), `clsx` + `tailwind-merge`.

**Spec:** `docs/superpowers/specs/2026-06-09-lookup-homepage-design.md`

**Testing note:** Per the approved spec this static UI page has **no automated tests**. Each task is verified by `yarn build` (type-check) and, at the end, a visual diff against the screenshot at 1440px and 375px. This replaces the unit-test rhythm intentionally.

**Conventions (from `docs/rules/`):**
- Tailwind owns layout/spacing/responsive; AntD owns interactive components (`Form`, `Input`, `Select`, `Button`). Never override `.ant-*` or use `!important`; theme via `ConfigProvider`; per-instance via the AntD `classNames`/`styles` props.
- `verbatimModuleSyntax` is on → type-only imports MUST use `import type` (or inline `type`).
- `noUnusedLocals`/`noUnusedParameters` are on → no unused imports/vars.
- Constants/types live in `*-helpers.ts`, not in component files (`react-refresh/only-export-components`).
- `@/` is the alias for `src/`.

---

### Task 1: Branch + install dependencies

**Files:**
- Modify: `package.json` (via package manager)

- [ ] **Step 1: Create a feature branch**

Run:
```bash
git checkout -b feat/lookup-homepage
```

- [ ] **Step 2: Install runtime + build dependencies**

Run:
```bash
yarn add antd @ant-design/icons @tanstack/react-router @tanstack/react-query clsx tailwind-merge
yarn add -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 3: Determine the installed Ant Design major version (React 19 compatibility)**

Run:
```bash
node -p "require('./node_modules/antd/package.json').version"
```
- If the version starts with **`5.`**, AntD's static APIs need the React 19 compat shim. Install it:
  ```bash
  yarn add @ant-design/v5-patch-for-react-19
  ```
  Record that Task 9 must import it (a one-line import in `src/main.tsx`).
- If the version starts with **`6.`** (or higher), it supports React 19 natively — **skip** the patch and skip that import in Task 9.

- [ ] **Step 4: Verify install resolves and the dev tooling still boots**

Run:
```bash
yarn install && yarn build
```
Expected: `tsc -b` + `vite build` complete with no dependency-resolution errors. (The build still compiles the default starter at this point — that's fine; it's replaced later.)

- [ ] **Step 5: Commit**

```bash
git add package.json yarn.lock
git commit -m "chore: add tailwind, antd, tanstack router/query deps"
```

---

### Task 2: Wire Tailwind v4 plugin + `@/` path alias

**Files:**
- Modify: `vite.config.ts`
- Modify: `tsconfig.app.json`

- [ ] **Step 1: Add the Tailwind Vite plugin and the `@` alias (preserve React Compiler)**

Replace `vite.config.ts` with:
```ts
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

- [ ] **Step 2: Teach TypeScript the `@/*` path**

In `tsconfig.app.json`, inside `compilerOptions`, add `baseUrl` and `paths` (place them right after the opening `"compilerOptions": {` line):
```jsonc
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
```

- [ ] **Step 3: Verify the config still type-checks/builds**

Run:
```bash
yarn build
```
Expected: completes with no errors (still building the starter).

- [ ] **Step 4: Commit**

```bash
git add vite.config.ts tsconfig.app.json
git commit -m "build: enable tailwind v4 plugin and @ alias"
```

---

### Task 3: Global styles, theme tokens, `cn()`, fonts

**Files:**
- Create: `src/app/globals.css`
- Create: `src/app/theme.ts`
- Create: `src/utils/cn.ts`
- Modify: `index.html`

- [ ] **Step 1: Create `src/utils/cn.ts`**

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 2: Create `src/app/theme.ts` (single source of theme truth)**

```ts
import type { ThemeConfig } from 'antd'

export const PVI_NAVY = '#002C5F'
export const PVI_RED = '#E4002B'
export const FOOTER_BLUE = '#5B9BD5'
export const FORM_BAND = '#F7F7F8'

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: PVI_NAVY,
    borderRadius: 8,
    controlHeight: 44,
    fontFamily: "'Be Vietnam Pro', system-ui, -apple-system, sans-serif",
  },
}
```

- [ ] **Step 3: Create `src/app/globals.css` (Tailwind v4 CSS-first; tokens mirror `theme.ts`)**

```css
@import 'tailwindcss';

@theme {
  --color-pvi-navy: #002c5f;
  --color-pvi-red: #e4002b;
  --color-footer-blue: #5b9bd5;
  --color-form-band: #f7f7f8;
}

html,
body,
#root {
  margin: 0;
  min-height: 100%;
}

body {
  font-family: 'Be Vietnam Pro', system-ui, -apple-system, sans-serif;
  color: #1a1a1a;
}
```

- [ ] **Step 4: Load the font + fix document metadata in `index.html`**

Replace `index.html` with:
```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <title>Tra cứu - PVI Insurance</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/app/theme.ts src/utils/cn.ts index.html
git commit -m "feat: add theme tokens, global styles, cn helper, font"
```

---

### Task 4: `PviLogo` brand component

**Files:**
- Create: `src/components/brand/PviLogo.tsx`

- [ ] **Step 1: Create `src/components/brand/PviLogo.tsx`**

```tsx
import { cn } from '@/utils/cn'

interface PviLogoProps {
  variant?: 'color' | 'white'
  className?: string
}

// NOTE: inline-SVG recreation of the PVI mark. Replace with the official
// asset when available — keep this component's API the same.
export function PviLogo({ variant = 'color', className }: PviLogoProps) {
  const textClass = variant === 'white' ? 'text-white' : 'text-pvi-navy'

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path
          d="M20 2 L24.5 15.5 L38 20 L24.5 24.5 L20 38 L15.5 24.5 L2 20 L15.5 15.5 Z"
          fill="#E4002B"
        />
        <path
          d="M20 9 L22.7 17.3 L31 20 L22.7 22.7 L20 31 L17.3 22.7 L9 20 L17.3 17.3 Z"
          fill="#FFFFFF"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span className={cn('text-2xl font-extrabold tracking-tight', textClass)}>PVI</span>
        <span className={cn('text-[10px] font-semibold tracking-[0.2em]', textClass)}>
          INSURANCE
        </span>
      </span>
    </span>
  )
}
```

- [ ] **Step 2: Verify type-check**

Run:
```bash
yarn tsc -b --noEmit
```
Expected: no errors. (If the alias isn't resolved, re-check Task 2 Step 2.)

- [ ] **Step 3: Commit**

```bash
git add src/components/brand/PviLogo.tsx
git commit -m "feat: add PviLogo brand component"
```

---

### Task 5: Site chrome — `SiteHeader` and `SiteFooter`

**Files:**
- Create: `src/components/layout/SiteHeader.tsx`
- Create: `src/components/layout/SiteFooter.tsx`

- [ ] **Step 1: Create `src/components/layout/SiteHeader.tsx`**

```tsx
import { PviLogo } from '@/components/brand/PviLogo'

export function SiteHeader() {
  return (
    <header className="flex w-full items-center justify-center border-b border-gray-100 bg-white py-4">
      <PviLogo variant="color" />
    </header>
  )
}
```

- [ ] **Step 2: Create `src/components/layout/SiteFooter.tsx`**

```tsx
import { HomeFilled, PhoneFilled, UpOutlined } from '@ant-design/icons'
import { PviLogo } from '@/components/brand/PviLogo'

const PHONE_NUMBERS = ['028 999 983 86', '028 999 66 995'] as const

export function SiteFooter() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="w-full bg-pvi-navy text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1 text-sm font-semibold text-white"
          >
            Top <UpOutlined />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <PviLogo variant="white" className="mb-4" />
            <h2 className="mb-3 text-base font-bold text-footer-blue">
              TỔNG CÔNG TY BẢO HIỂM PVI - CHI NHÁNH BẢO HIỂM PVI DIGITAL
            </h2>
            <p className="flex items-start gap-2 text-sm leading-relaxed">
              <HomeFilled className="mt-1 shrink-0 text-footer-blue" />
              <span>
                Phòng G08 Tầng 1, Tòa nhà Petrovietnam, Số 1-5 Lê Duẩn, Phường Sài Gòn,
                Thành phố Hồ Chí Minh
              </span>
            </p>
          </div>

          <div className="md:text-right">
            <h2 className="mb-3 text-base font-bold text-footer-blue">Nhận báo giá ngay</h2>
            <ul className="space-y-2">
              {PHONE_NUMBERS.map((phone) => (
                <li key={phone} className="flex items-center gap-2 md:justify-end">
                  <PhoneFilled className="text-footer-blue" />
                  <a href={`tel:${phone.replace(/\s/g, '')}`} className="font-bold underline">
                    {phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: Verify type-check**

Run:
```bash
yarn tsc -b --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/SiteHeader.tsx src/components/layout/SiteFooter.tsx
git commit -m "feat: add SiteHeader and SiteFooter chrome"
```

---

### Task 6: Form data + `LookupHero` + `LookupForm`

**Files:**
- Create: `src/pages/lookup/lookup-form-helpers.ts`
- Create: `src/pages/lookup/components/LookupHero.tsx`
- Create: `src/pages/lookup/components/LookupForm.tsx`

- [ ] **Step 1: Create `src/pages/lookup/lookup-form-helpers.ts` (static data + types)**

```ts
export type InsuranceType = 'all' | 'motorbike' | 'car'

export interface InsuranceTypeOption {
  value: InsuranceType
  label: string
}

export const INSURANCE_TYPE_OPTIONS: InsuranceTypeOption[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'motorbike', label: 'Xe máy' },
  { value: 'car', label: 'Ô tô' },
]

export const DEFAULT_INSURANCE_TYPE: InsuranceType = 'all'

// Mock value shown read-only; in the real webview the host injects the phone.
export const MOCK_PHONE = 'Chưa cập nhật'

export interface LookupFormValues {
  phone: string
  insuranceType: InsuranceType
}
```

- [ ] **Step 2: Create `src/pages/lookup/components/LookupHero.tsx`**

```tsx
export function LookupHero() {
  return (
    <div className="px-6 pt-10 pb-8 text-center">
      <h1 className="text-4xl font-bold md:text-5xl">Tra cứu</h1>
      <p className="mt-3 text-base text-gray-500">
        Vui lòng điền thông tin bên dưới để tra cứu thông tin
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/pages/lookup/components/LookupForm.tsx`**

```tsx
import { Button, Form, Input, Select } from 'antd'
import {
  DEFAULT_INSURANCE_TYPE,
  INSURANCE_TYPE_OPTIONS,
  MOCK_PHONE,
  type LookupFormValues,
} from '../lookup-form-helpers'

export function LookupForm() {
  const [form] = Form.useForm<LookupFormValues>()

  const handleFinish = (values: LookupFormValues) => {
    // UI-only: no API. Log the selected values (the approved "no-op" behavior).
    console.info('Tra cứu:', values)
  }

  return (
    <div className="w-full bg-form-band">
      <div className="mx-auto w-full max-w-xl px-6 py-10">
        <Form
          form={form}
          layout="vertical"
          initialValues={{ phone: MOCK_PHONE, insuranceType: DEFAULT_INSURANCE_TYPE }}
          onFinish={handleFinish}
        >
          <Form.Item label="Số điện thoại" name="phone">
            <Input readOnly classNames={{ input: 'text-gray-400' }} />
          </Form.Item>

          <Form.Item label="Loại bảo hiểm" name="insuranceType">
            <Select options={INSURANCE_TYPE_OPTIONS} />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" block>
              Tra cứu
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify type-check**

Run:
```bash
yarn tsc -b --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/lookup/lookup-form-helpers.ts src/pages/lookup/components/LookupHero.tsx src/pages/lookup/components/LookupForm.tsx
git commit -m "feat: add lookup hero, form, and static options"
```

---

### Task 7: `LookupPage`

**Files:**
- Create: `src/pages/lookup/LookupPage.tsx`

- [ ] **Step 1: Create `src/pages/lookup/LookupPage.tsx`**

```tsx
import { LookupHero } from './components/LookupHero'
import { LookupForm } from './components/LookupForm'

export function LookupPage() {
  return (
    <main className="flex-1">
      <LookupHero />
      <LookupForm />
    </main>
  )
}
```

- [ ] **Step 2: Verify type-check**

Run:
```bash
yarn tsc -b --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/lookup/LookupPage.tsx
git commit -m "feat: add LookupPage composition"
```

---

### Task 8: TanStack Router + providers

**Files:**
- Create: `src/router/routes/root-layout.tsx`
- Create: `src/router/routes/lookup-route.ts`
- Create: `src/router/router.ts`
- Create: `src/app/providers.tsx`

- [ ] **Step 1: Create `src/router/routes/root-layout.tsx` (shared chrome + context type)**

```tsx
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'

export interface RouterContext {
  queryClient: QueryClient
}

function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <Outlet />
      <SiteFooter />
    </div>
  )
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})
```

- [ ] **Step 2: Create `src/router/routes/lookup-route.ts`**

```ts
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root-layout'
import { LookupPage } from '@/pages/lookup/LookupPage'

// Single initial route — imported directly (code-splitting the only route adds nothing).
export const lookupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LookupPage,
})
```

- [ ] **Step 3: Create `src/router/router.ts`**

```ts
import { createRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { rootRoute } from './routes/root-layout'
import { lookupRoute } from './routes/lookup-route'

export const queryClient = new QueryClient()

const routeTree = rootRoute.addChildren([lookupRoute])

export const router = createRouter({
  routeTree,
  context: { queryClient },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

- [ ] **Step 4: Create `src/app/providers.tsx`**

```tsx
import { ConfigProvider } from 'antd'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { antdTheme } from './theme'
import { router, queryClient } from '@/router/router'

export function Providers() {
  return (
    <ConfigProvider theme={antdTheme}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ConfigProvider>
  )
}
```

- [ ] **Step 5: Verify type-check**

Run:
```bash
yarn tsc -b --noEmit
```
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/router/routes/root-layout.tsx src/router/routes/lookup-route.ts src/router/router.ts src/app/providers.tsx
git commit -m "feat: add tanstack router, root layout, and providers"
```

---

### Task 9: Mount the app + remove the Vite starter

**Files:**
- Modify: `src/main.tsx`
- Delete: `src/App.tsx`, `src/App.css`, `src/index.css`

- [ ] **Step 1: Replace `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app/globals.css'
import { Providers } from './app/providers'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers />
  </StrictMode>,
)
```

> **If Task 1 Step 3 found Ant Design `5.x`**, add this as the FIRST import line in `src/main.tsx` (before `react`):
> ```tsx
> import '@ant-design/v5-patch-for-react-19'
> ```
> If AntD is `6.x`+, do not add it.

- [ ] **Step 2: Delete the starter files**

Run:
```bash
git rm src/App.tsx src/App.css src/index.css
```
(If `git rm` reports a file is untracked, use `rm` for that file instead.)

- [ ] **Step 3: Verify the production build is clean**

Run:
```bash
yarn build
```
Expected: `tsc -b` + `vite build` succeed with no type errors and no unused-import errors. If `noUnusedLocals` flags a leftover starter import, remove it.

- [ ] **Step 4: Commit**

```bash
git add src/main.tsx
git commit -m "feat: mount lookup app and remove vite starter"
```

---

### Task 10: Visual verification against the design

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Run:
```bash
yarn dev
```
Expected: serves on a local URL (e.g. `http://localhost:5173`).

- [ ] **Step 2: Verify desktop (1440px) against `docs/ui/lookup-homepage.png`**

Open the URL at 1440px width and confirm against the screenshot:
- Centered color PVI logo in the white header.
- `Tra cứu` heading (bold) + subtitle `Vui lòng điền thông tin bên dưới để tra cứu thông tin`.
- Light-grey band behind the centered form.
- `Số điện thoại` read-only input showing grey `Chưa cập nhật`.
- `Loại bảo hiểm` Select defaulting to `Tất cả`; opening it shows `Tất cả` (checked) / `Xe máy` / `Ô tô`.
- Navy `Tra cứu` primary button (full width). **If the button renders without its navy background, Tailwind preflight is overriding AntD** — confirm AntD's injected styles load; as a fallback, ensure `@import 'tailwindcss'` is the only Tailwind entry and no global rule resets `button`.
- Navy footer: white PVI logo, `TỔNG CÔNG TY BẢO HIỂM PVI - CHI NHÁNH BẢO HIỂM PVI DIGITAL`, address with home icon, `Nhận báo giá ngay`, two phone links with phone icons, and a `Top ▲` link top-right that scrolls up.

- [ ] **Step 3: Verify mobile (375px)**

Resize to 375px and confirm: no horizontal overflow, footer collapses to one column, the form fills width with comfortable padding.

- [ ] **Step 4: Verify the submit no-op**

Open the browser console, change the Select, click `Tra cứu`. Expected: a single `Tra cứu: { phone: 'Chưa cập nhật', insuranceType: '<selected>' }` log; no navigation, no error.

- [ ] **Step 5: Final build gate**

Run:
```bash
yarn build
```
Expected: passes. The lookup homepage is complete.
