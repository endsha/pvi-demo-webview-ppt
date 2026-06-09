# Lookup Homepage — Design Spec

**Date:** 2026-06-09
**Status:** Approved (design)
**Source design:** `docs/ui/lookup-homepage.png`

## Goal

Implement the UI of the PVI "Tra cứu" (lookup) homepage, matching the screenshot
`docs/ui/lookup-homepage.png` exactly. **UI + mock/static data only** — no API and no
mock-API/TanStack-Query hook layer. Submit is a no-op that logs the selected values.

## Context (important)

The repo is currently a **bare Vite + React 19 + TypeScript starter** with no git
history. `package.json` contains only `react`, `react-dom`, and Vite tooling. None of
the stack the `docs/rules/` prescribe (Tailwind, Ant Design, TanStack Router/Query,
Zod) is installed yet, and there is no `src/pages`, `src/components`, or routing.

Therefore this task is effectively **greenfield**: the lookup page is the first real
page and we scaffold the documented foundation it sits on. (Session memory claiming
"AntD v6 + Tailwind v4 + Recharts + react-router v7 installed; reuse `src/components/ui`
+ `AdminLayout`" is **stale and does not match the working tree** — ignore it.)

## Decisions

- **Stack:** install the documented foundation — Tailwind CSS (v4, CSS-first) + Ant
  Design + TanStack Router. A `QueryClient` is mounted in router context per the docs,
  but is **unused** on this page (no data fetching).
- **Submit action:** a primary `Tra cứu` button; `onClick` logs `{ phone, insuranceType }`.
  No navigation, no results screen.
- **No mock-API layer:** dropdown options are a plain local constant
  (`INSURANCE_TYPE_OPTIONS`). Page does not import a query hook.
- **Font:** `Be Vietnam Pro` (Google Fonts, `font-display: swap`) for clean Vietnamese
  diacritics — approved stand-in for PVI's licensed brand font.
- **Phone field:** read-only/disabled `Input` showing mock value `"Chưa cập nhật"`
  (in the real webview the host injects the phone). Approved.

## Architecture

Root-layout + decomposed page. Shared chrome (header logo, footer) lives in the TanStack
Router **root layout** component so future pages reuse it (`routing.md` rule 10). The
lookup page is split into small focused components.

```
src/
  app/
    theme.ts            # PVI themeTokens (navy primary)
    globals.css         # @import "tailwindcss"; @font-face/Google font; CSS vars; reset
    providers.tsx       # ConfigProvider + QueryClientProvider + RouterProvider
  router/
    router.ts           # createRouter + rootRoute (layout) + queryClient context
    routes/
      root-layout.tsx   # SiteHeader + <Outlet/> + SiteFooter
      lookup-route.ts   # path '/'  → LookupPage
  components/
    brand/PviLogo.tsx   # inline SVG, variant="color" | "white"
    layout/SiteHeader.tsx
    layout/SiteFooter.tsx
  pages/lookup/
    LookupPage.tsx
    components/LookupHero.tsx
    components/LookupForm.tsx
    lookup-form-helpers.ts  # INSURANCE_TYPE_OPTIONS const + types
  utils/cn.ts
  main.tsx              # mounts <Providers/>
```

The Vite starter (`App.tsx`/`App.css` demo content, demo asset usage) is removed.

## Components

### Theme tokens (`src/app/theme.ts`)
- `colorPrimary: '#002C5F'` (PVI navy — button + active states)
- `borderRadius: 8`
- `controlHeight: 44` (tall inputs as in the design)
- `fontFamily: 'Be Vietnam Pro, system-ui, sans-serif'`

`tailwind.config`/CSS mirrors these tokens; no duplicated values
(`styling-tailwind-antd.md` rule 3). One `<ConfigProvider>` at the app root is the single
source of theme truth.

### SiteHeader
White bar, centered **color** PVI logo only (no nav, matching the screenshot).

### LookupHero
- `<h1>Tra cứu</h1>` — large, bold, near-black (`#1a1a1a`), centered.
- Subtitle: `Vui lòng điền thông tin bên dưới để tra cứu thông tin` — grey, centered.

### Form band + LookupForm
Full-width very-light-grey band (`#f7f7f8`) behind a centered, max-width form column.
AntD `Form`, vertical layout:

- **`Số điện thoại`** → AntD `Input`, **read-only/disabled**, value `"Chưa cập nhật"`.
- **`Loại bảo hiểm`** → AntD `Select`, default `Tất cả`; options:
  `Tất cả` / `Xe máy` / `Ô tô` (active item shows a checkmark, matching the open-dropdown
  state in the screenshot).
- **`Tra cứu`** → primary navy `Button`, full-width; `onClick` logs
  `{ phone, insuranceType }`.

All labels/placeholders copied **verbatim** from the screenshot (`ui-ux-strict.md` rule 3).

### SiteFooter
Navy band:
- **Left:** white PVI logo; heading
  `TỔNG CÔNG TY BẢO HIỂM PVI - CHI NHÁNH BẢO HIỂM PVI DIGITAL` (light blue, bold); address
  row with a home icon:
  `Phòng G08 Tầng 1, Tòa nhà Petrovietnam, Số 1-5 Lê Duẩn, Phường Sài Gòn, Thành phố Hồ Chí Minh`.
- **Right:** `Nhận báo giá ngay` (light blue heading); two phone links with phone icons:
  `028 999 983 86`, `028 999 66 995`.
- **Top-right:** `Top ▲` scroll-to-top link.

All footer text copied verbatim from the screenshot.

## Styling split (`styling-tailwind-antd.md`)

- **Tailwind owns:** all layout/spacing/flex/grid/responsive (the grey band, footer grid,
  centering, max-widths), one-off color/typography on raw HTML.
- **AntD owns:** `Form`, `Input`, `Select`, `Button` — themed via `ConfigProvider`, never
  via `.ant-*` class overrides or `!important`.
- `cn()` (clsx + tailwind-merge) for conditional classes.

## Responsive

- Desktop (matches screenshot at ~1440): form centered, footer two-column.
- Mobile (~375, the likely webview width): single-column footer, form fills width with
  comfortable padding. No horizontal overflow.

## Out of scope / known gaps

- **PVI logo** is an inline-SVG recreation (red star + "PVI INSURANCE"); it resembles the
  brand and is meant to be replaced by the official asset via the `PviLogo` component.
  Flagged because `ui-ux-strict.md` requires pixel fidelity and a licensed logo can't be
  reproduced exactly.
- No automated tests for this static UI page; verification is visual against the
  screenshot at 1440 and 375 widths.
- No routing beyond `/`; `QueryClient` provider mounted but unused (future pages).
- No real API, no mock-API/query-hook layer, no Zod search-param schema (no filters yet).

## Verification

1. `yarn dev` runs; `/` renders the lookup page.
2. Visual diff against `docs/ui/lookup-homepage.png` at 1440 and 375 widths (header,
   hero, form, open Select dropdown, footer).
3. `Tra cứu` click logs the selected `{ phone, insuranceType }`.
4. `yarn build` (tsc + vite) passes with no type errors.
