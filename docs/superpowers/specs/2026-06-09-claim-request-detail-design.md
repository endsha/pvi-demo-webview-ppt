# Claim Request Detail Page — Design

**Date:** 2026-06-09
**Status:** Approved
**Scope:** UI only, mock data. No API.

## Overview

A new **read-only** route `/claim-request-detail` that displays a submitted claim
("Chi tiết yêu cầu bồi thường") using mock data. It maximizes reuse of the
already-merged Claim Request Form (PR #4): the same section components rendered
inside a **disabled** AntD `<Form>`, driven by mock `initialValues`.

Source design: `docs/ui/claim-request-detail-01..04.png`.

## How the Detail page differs from the Form

| Aspect | Form (`/claim-request`) | Detail (`/claim-request-detail`) |
|---|---|---|
| Title | "Nhập yêu cầu bồi thường" | "Chi tiết yêu cầu bồi thường" |
| Fields | Editable (3 read-only) | All disabled / read-only |
| Commitment section | Present | Omitted |
| Submit button | Present | Omitted |
| Attachments | Upload widget + instructions | Read-only file list |
| Back arrow → | `/general-info` | Claim requests list (via history back) |
| Scroll-to-top | — | Floating button (bottom-right) |

## Architecture & data flow

```
ClaimRequestDetailPage
 ├─ ClaimRequestHeader (generalized: title + onBack props)   ← back = router.history.back()
 ├─ <Form disabled initialValues={MOCK_CLAIM_DETAIL} requiredMark=…>
 │    ├─ InsuredPersonSection      (REUSED as-is)
 │    ├─ AccidentMedicalSection    (REUSED as-is)
 │    └─ PaymentInfoSection        (REUSED as-is)
 ├─ AttachmentsListSection         (NEW — read-only file list)
 └─ BackToTopButton                (NEW — floating scroll-to-top)
```

- `<Form disabled>` cascades the disabled/gray state to every field automatically,
  matching the screenshots. The same `requiredMark` render prop keeps the red `*`
  markers on required labels.
- Mock data flows in once via `initialValues`. Nothing is editable; nothing submits.

## Components & files

| File | Action | Purpose |
|---|---|---|
| `src/pages/claim-request/mock-claim-request-detail.ts` | new | `MOCK_CLAIM_DETAIL` (a `ClaimRequestFormValues`-shaped object; dates as Dayjs) + `MOCK_ATTACHMENTS` file list |
| `src/pages/claim-request/ClaimRequestDetailPage.tsx` | new | Page shell + disabled Form composition |
| `src/pages/claim-request/components/AttachmentsListSection.tsx` | new | Read-only attachments list in a `SectionCard` |
| `src/components/ui/BackToTopButton.tsx` | new | Reusable floating scroll-to-top button |
| `src/pages/claim-request/components/ClaimRequestHeader.tsx` | edit | Add `title` + `onBack` props; defaults preserve current form behavior |
| `src/router/routes/claim-request-detail-route.ts` | new | `/claim-request-detail` route |
| `src/router/router.ts` | edit | Register the new route in the tree |

**Reused unchanged:** `SectionCard`, `InsuredPersonSection`, `AccidentMedicalSection`,
`PaymentInfoSection`, and all helpers/constants (`TREATMENT_TYPE_OPTIONS`,
`PAYMENT_CASE_OPTIONS`, `formatVndInput`, `ClaimRequestFormValues`). The Commitment
section and submit button are simply not rendered.

### `ClaimRequestHeader` generalization

Add optional props, defaulting to the current Form behavior so the existing page is unaffected:

- `title?: string` — defaults to `"Nhập yêu cầu bồi thường"`.
- `onBack?: () => void` — defaults to `navigate({ to: '/general-info' })`.

Detail page passes `title="Chi tiết yêu cầu bồi thường"` and
`onBack={() => router.history.back()}`.

### `BackToTopButton`

- Fixed, bottom-right, navy circular button with an up-arrow icon.
- Appears after the user scrolls down (e.g. `> 200px`); smooth-scrolls to top on click.
- Uses an internal scroll listener with cleanup; compositor-friendly (opacity/transform).
- Placed in `src/components/ui/` as it is generic and reusable.

### `AttachmentsListSection`

- Wrapped in the shared `SectionCard` titled "Tài liệu đính kèm".
- Renders `MOCK_ATTACHMENTS` as a read-only list: file-type icon + name + a view link
  (`href="#"`, `preventDefault`). No upload control.

## Mock data (from screenshots)

- **Insured:** `driverCode 6062006`, `fullName "Trần Việt Dũng"`, `gender "Nam"`;
  `idNumber`/`birthDate`/`email`/`zaloPhone` empty.
- **Accident:** `accidentDate 2026-06-01`, `accidentPlace "1 Le Duan"`,
  `examDate 2026-06-02`, `admissionDate 2026-06-03`, `diagnosis "Testing"`,
  `consequence "Testing"`, `treatmentType "outpatient"`; `treatmentPlace`/`treatmentFrom`/`treatmentTo` empty.
- **Payment:** `requestedAmount 1000`, `paymentCases ["medicalExpense", "hospitalAllowance"]`,
  `beneficiaryName "Tran Viet Dung"`, `accountNumber "0000000000"`, `bankName "Testing"`;
  `bankAddress` empty.
- **Attachments:** 2–3 mock files (name + view link).

Date fields are `Dayjs` instances (e.g. `dayjs('2026-06-01')`) to satisfy the reused
DatePicker fields. `requestedAmount` follows the form's runtime convention.

## Known minor deviations (consistency-with-form over mockup-literal)

1. **`accidentDate`** renders `01/06/2026` (reused DatePicker `DD/MM/YYYY` format); the
   mockup shows a trailing `00:00`. Kept consistent with the approved form rather than
   forking the shared component.
2. **VND separator** renders `1,000` (the form's `formatVndInput` uses commas); the mockup
   shows `1.000`. Kept consistent with the already-merged form.

Both accepted by the user. Pixel-exact would require forking the shared sections.

## Testing

- Reuse is behavior-preserving; the only new logic is the scroll button and static mock data.
- Playwright visual check at 375 / 768 / 1440 of the rendered detail page.
- Small render test: asserts the title, a few read-only values are present, fields are disabled,
  and Commitment/submit are absent.
- No new helper logic to unit-test (mock data is static).

## Out of scope

- The claim requests list page (back target) — not built; history back is used.
- Any API, persistence, or real file handling.
- Editing / re-submitting a claim.
