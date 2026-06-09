# Claim Request Creation Success — Design

**Date:** 2026-06-10
**Status:** Approved
**Scope:** UI only. Mock/UI, no API, no new route.

## Goal

Implement the "Claim Request Creation Success" screen from
`docs/ui/claim-request-creation-success.png`: after a claim request is submitted,
show a centered success view (green check badge, success title, "Quay về" button)
plus a success toast.

## Decisions

| Topic | Decision |
|---|---|
| Wiring | Success view is a **state inside `ClaimRequestPage`** (no new route). After submit, swap the form for the success view. |
| "Quay về" destination | Navigate to `/general-info` (claim list). |
| Top toast | Include — `Cập nhật thông tin thành công` (green check, auto-dismiss). |

## Architecture

`RootLayout` already frames every page with `SiteHeader` + `SiteFooter`. The page
keeps its `<main className="flex-1 bg-form-band">` wrapper in both states, so the
header/footer in the screenshot come for free.

### `ClaimRequestPage.tsx` (modified)

- Add `const [submitted, setSubmitted] = useState(false)`.
- `handleFinish(values)`:
  - `messageApi.success('Cập nhật thông tin thành công')`
  - `setSubmitted(true)`
- Render:
  - `submitted === false` → existing `ClaimRequestHeader` + `Form` (unchanged).
  - `submitted === true` → `<ClaimRequestSuccess />` only (no page header).
- `<main>` wrapper + `{contextHolder}` stay outside the conditional.

### `components/ClaimRequestSuccess.tsx` (new, presentational)

- Centered column within the band (flex, `items-center`, vertical padding to center
  in the light area).
- **Check badge:** layered divs — outer pale-green halo circle (~180px) → inner
  solid emerald circle (~130px) → white `CheckOutlined`. No layout-animating props.
- **Title:** `Tạo yêu cầu bồi thường thành công` — `text-pvi-navy`, bold,
  `text-2xl md:text-3xl`.
- **Button:** AntD `Button`, outlined/light style, navy text, label `Quay về` →
  `useNavigate({ to: '/general-info' })`.

## Constraints (`ui-ux-strict.md`)

- Exact Vietnamese strings (title, button, toast) — no paraphrasing.
- No extra fields/sections/buttons/icons beyond the screenshot.
- Compositor-friendly styling only (`transform`/`opacity`); no animating layout props.
- No API call, no new route.

## Out of scope

- Real submission / persistence.
- New route or navigation guard.
- Changes to the form sections themselves.
