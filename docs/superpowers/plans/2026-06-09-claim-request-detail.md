# Claim Request Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a read-only `/claim-request-detail` page that displays a submitted claim using mock data, reusing the existing Claim Request Form section components inside a disabled AntD `<Form>`.

**Architecture:** A new route renders `ClaimRequestDetailPage`, which wraps the already-built `InsuredPersonSection`, `AccidentMedicalSection`, and `PaymentInfoSection` in a `<Form disabled>` fed by a static mock object. New pieces: a read-only attachments list, a floating back-to-top button, and a generalized header (title + back-handler props). No commitment section, no submit, no API.

**Tech Stack:** React 19, TypeScript, AntD 6, TanStack Router, Tailwind v4, dayjs. Build/lint via `yarn build` / `yarn lint`. No component-test harness exists (jsdom/RTL not installed); the codebase unit-tests pure helpers only. This page adds no pure logic, so verification is type-check + lint + build + a Playwright visual pass — matching the existing pattern rather than adding a test stack (YAGNI).

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/pages/claim-request/components/ClaimRequestHeader.tsx` | modify | Add `title` + `onBack` props (defaults preserve current Form behavior) |
| `src/pages/claim-request/mock-claim-request-detail.ts` | create | `MOCK_CLAIM_DETAIL` + `MOCK_ATTACHMENTS` + `AttachmentFile` type |
| `src/components/ui/BackToTopButton.tsx` | create | Floating scroll-to-top button (generic, reusable) |
| `src/pages/claim-request/components/AttachmentsListSection.tsx` | create | Read-only attachments list inside `SectionCard` |
| `src/pages/claim-request/ClaimRequestDetailPage.tsx` | create | Page shell + disabled Form composition |
| `src/router/routes/claim-request-detail-route.ts` | create | `/claim-request-detail` route definition |
| `src/router/router.ts` | modify | Register the new route in the tree |

Reused unchanged: `SectionCard`, `InsuredPersonSection`, `AccidentMedicalSection`, `PaymentInfoSection`, and helpers/constants in `claim-request-form-helpers.ts`.

---

## Task 1: Generalize `ClaimRequestHeader`

**Files:**
- Modify: `src/pages/claim-request/components/ClaimRequestHeader.tsx`

- [ ] **Step 1: Replace the component with a props-driven version**

Full new file content:

```tsx
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from '@tanstack/react-router'

interface ClaimRequestHeaderProps {
  title?: string
  onBack?: () => void
}

export function ClaimRequestHeader({
  title = 'Nhập yêu cầu bồi thường',
  onBack,
}: ClaimRequestHeaderProps) {
  const navigate = useNavigate()
  const handleBack = onBack ?? (() => navigate({ to: '/general-info' }))

  return (
    <div className="relative px-10 py-6 text-center">
      <button
        type="button"
        aria-label="Quay lại"
        onClick={handleBack}
        className="absolute left-2 top-7 text-pvi-navy transition-colors hover:text-pvi-red md:left-4"
      >
        <ArrowLeftOutlined />
      </button>
      <h1 className="text-2xl font-bold text-pvi-navy md:text-3xl">{title}</h1>
    </div>
  )
}
```

Note: `ClaimRequestPage.tsx` renders `<ClaimRequestHeader />` with no props, so the defaults reproduce its current behavior exactly — no change needed there.

- [ ] **Step 2: Type-check and lint**

Run: `yarn build && yarn lint`
Expected: build succeeds, lint passes (0 errors).

- [ ] **Step 3: Commit**

```bash
git add src/pages/claim-request/components/ClaimRequestHeader.tsx
git commit -m "refactor: make ClaimRequestHeader title and back handler configurable"
```

---

## Task 2: Mock detail data

**Files:**
- Create: `src/pages/claim-request/mock-claim-request-detail.ts`

- [ ] **Step 1: Create the mock data module**

Full file content:

```ts
import dayjs from 'dayjs'
import type { ClaimRequestFormValues } from './claim-request-form-helpers'

export interface AttachmentFile {
  id: string
  name: string
  url: string
}

// Mock prefilled detail of a submitted claim. In the real webview the host injects
// an existing claim record; here the values come from the design screenshots.
export const MOCK_CLAIM_DETAIL: ClaimRequestFormValues = {
  // Insured person
  driverCode: '6062006',
  fullName: 'Trần Việt Dũng',
  gender: 'Nam',
  idNumber: '',
  birthDate: '',
  email: '',
  zaloPhone: '',
  // Accident & medical
  accidentDate: dayjs('2026-06-01'),
  accidentPlace: '1 Le Duan',
  examDate: dayjs('2026-06-02'),
  admissionDate: dayjs('2026-06-03'),
  treatmentPlace: '',
  diagnosis: 'Testing',
  consequence: 'Testing',
  treatmentType: 'outpatient',
  treatmentFrom: undefined,
  treatmentTo: undefined,
  // Payment
  requestedAmount: 1000,
  paymentCases: ['medicalExpense', 'hospitalAllowance'],
  beneficiaryName: 'Tran Viet Dung',
  accountNumber: '0000000000',
  bankName: 'Testing',
  bankAddress: '',
  // Commitment fields are not rendered on the detail page; set true for type completeness.
  commitTruthful: true,
  commitThirdParty: true,
  commitSignature: true,
}

export const MOCK_ATTACHMENTS: AttachmentFile[] = [
  { id: '1', name: 'bien-ban-tai-nan.pdf', url: '#' },
  { id: '2', name: 'chung-tu-y-te.jpg', url: '#' },
  { id: '3', name: 'hoa-don-thanh-toan.pdf', url: '#' },
]
```

- [ ] **Step 2: Type-check**

Run: `yarn build`
Expected: build succeeds (confirms the object satisfies `ClaimRequestFormValues`).

- [ ] **Step 3: Commit**

```bash
git add src/pages/claim-request/mock-claim-request-detail.ts
git commit -m "feat: add mock data for claim request detail"
```

---

## Task 3: `BackToTopButton`

**Files:**
- Create: `src/components/ui/BackToTopButton.tsx`

- [ ] **Step 1: Create the component**

Full file content:

```tsx
import { useEffect, useState } from 'react'
import { VerticalAlignTopOutlined } from '@ant-design/icons'

const SCROLL_THRESHOLD = 200

export function BackToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SCROLL_THRESHOLD)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <button
      type="button"
      aria-label="Lên đầu trang"
      onClick={scrollToTop}
      className={`fixed bottom-8 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-lg bg-pvi-navy text-white shadow-lg transition-opacity duration-300 hover:bg-pvi-red md:right-8 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <VerticalAlignTopOutlined />
    </button>
  )
}
```

Notes: visibility toggles via `opacity` (compositor-friendly) with `pointer-events-none` when hidden; the scroll listener is `passive` and cleaned up on unmount.

- [ ] **Step 2: Type-check and lint**

Run: `yarn build && yarn lint`
Expected: build succeeds, lint passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/BackToTopButton.tsx
git commit -m "feat: add reusable back-to-top button"
```

---

## Task 4: `AttachmentsListSection`

**Files:**
- Create: `src/pages/claim-request/components/AttachmentsListSection.tsx`

- [ ] **Step 1: Create the component**

Full file content:

```tsx
import { FileTextOutlined } from '@ant-design/icons'
import { SectionCard } from './SectionCard'
import { MOCK_ATTACHMENTS } from '../mock-claim-request-detail'

export function AttachmentsListSection() {
  return (
    <SectionCard title="Tài liệu đính kèm">
      {MOCK_ATTACHMENTS.length === 0 ? (
        <p className="text-sm text-gray-500">Không có tài liệu đính kèm</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {MOCK_ATTACHMENTS.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3"
            >
              <FileTextOutlined className="text-pvi-navy" />
              <span className="flex-1 truncate text-sm text-gray-700">{file.name}</span>
              <a
                className="text-sm font-medium text-pvi-red"
                href={file.url}
                onClick={(e) => e.preventDefault()}
              >
                Xem
              </a>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
```

- [ ] **Step 2: Type-check and lint**

Run: `yarn build && yarn lint`
Expected: build succeeds, lint passes.

- [ ] **Step 3: Commit**

```bash
git add src/pages/claim-request/components/AttachmentsListSection.tsx
git commit -m "feat: add read-only attachments list section"
```

---

## Task 5: `ClaimRequestDetailPage`

**Files:**
- Create: `src/pages/claim-request/ClaimRequestDetailPage.tsx`

- [ ] **Step 1: Create the page**

Full file content:

```tsx
import { Form } from 'antd'
import { ClaimRequestHeader } from './components/ClaimRequestHeader'
import { InsuredPersonSection } from './components/InsuredPersonSection'
import { AccidentMedicalSection } from './components/AccidentMedicalSection'
import { PaymentInfoSection } from './components/PaymentInfoSection'
import { AttachmentsListSection } from './components/AttachmentsListSection'
import { BackToTopButton } from '@/components/ui/BackToTopButton'
import { MOCK_CLAIM_DETAIL } from './mock-claim-request-detail'
import type { ClaimRequestFormValues } from './claim-request-form-helpers'

export function ClaimRequestDetailPage() {
  const [form] = Form.useForm<ClaimRequestFormValues>()

  return (
    <main className="flex-1 bg-form-band">
      <ClaimRequestHeader
        title="Chi tiết yêu cầu bồi thường"
        onBack={() => window.history.back()}
      />
      <div className="mx-auto w-full max-w-3xl px-4 pb-12">
        <Form
          form={form}
          layout="vertical"
          disabled
          initialValues={MOCK_CLAIM_DETAIL}
          requiredMark={(label, { required }) => (
            <>
              {label}
              {required && <span className="text-pvi-red"> *</span>}
            </>
          )}
        >
          <div className="flex flex-col gap-5">
            <InsuredPersonSection />
            <AccidentMedicalSection />
            <PaymentInfoSection />
            <AttachmentsListSection />
          </div>
        </Form>
      </div>
      <BackToTopButton />
    </main>
  )
}
```

Notes: `disabled` on `<Form>` cascades to every field (gray read-only look). `onBack` uses `window.history.back()` to return to the claim requests list the user came from — avoids importing the router (no circular dependency) and references no not-yet-built route. The Commitment section and submit button are intentionally omitted.

- [ ] **Step 2: Type-check and lint**

Run: `yarn build && yarn lint`
Expected: build succeeds, lint passes.

- [ ] **Step 3: Commit**

```bash
git add src/pages/claim-request/ClaimRequestDetailPage.tsx
git commit -m "feat: add claim request detail page"
```

---

## Task 6: Route + registration

**Files:**
- Create: `src/router/routes/claim-request-detail-route.ts`
- Modify: `src/router/router.ts`

- [ ] **Step 1: Create the route**

Full file content:

```ts
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root-layout'
import { ClaimRequestDetailPage } from '@/pages/claim-request/ClaimRequestDetailPage'

export const claimRequestDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/claim-request-detail',
  component: ClaimRequestDetailPage,
})
```

- [ ] **Step 2: Register the route in `router.ts`**

In `src/router/router.ts`, add the import after the existing `claimRequestRoute` import:

```ts
import { claimRequestDetailRoute } from './routes/claim-request-detail-route'
```

Then update the `routeTree` line to include it:

```ts
const routeTree = rootRoute.addChildren([
  lookupRoute,
  generalInfoRoute,
  claimRequestRoute,
  claimRequestDetailRoute,
])
```

- [ ] **Step 3: Type-check and lint**

Run: `yarn build && yarn lint`
Expected: build succeeds, lint passes.

- [ ] **Step 4: Commit**

```bash
git add src/router/routes/claim-request-detail-route.ts src/router/router.ts
git commit -m "feat: wire claim request detail route"
```

---

## Task 7: Visual verification

**Files:** none (verification only)

- [ ] **Step 1: Full build + lint**

Run: `yarn build && yarn lint`
Expected: both succeed with 0 errors.

- [ ] **Step 2: Start the dev server (background)**

Run: `yarn dev`
Expected: Vite serves at `http://localhost:5173`.

- [ ] **Step 3: Visual check at three breakpoints**

Using the Playwright MCP browser, for each width 375, 768, 1440:
- Navigate to `http://localhost:5173/claim-request-detail`
- Resize to the width, screenshot full page.

Verify against `docs/ui/claim-request-detail-01..04.png`:
- Title reads "Chi tiết yêu cầu bồi thường".
- All fields are disabled/gray; filled values match the mock (e.g. `6062006`, `Trần Việt Dũng`, `1 Le Duan`, `Testing`, `1,000 VND`, `Tran Viet Dung`, `0000000000`).
- `Chi phí y tế do tai nạn` and `Trợ cấp nằm viện do tai nạn` checkboxes are checked; `Ngoại trú` radio selected.
- Required `*` markers present on Email / Zalo / required accident & payment fields.
- "Tài liệu đính kèm" shows the read-only file list; no upload button, no commitment section, no submit button.
- Back-to-top button appears after scrolling and returns to top on click.

- [ ] **Step 4: Stop the dev server**

Stop the background `yarn dev` process.

---

## Self-Review (completed during planning)

- **Spec coverage:** title (Task 5), all-disabled fields (Task 5 `<Form disabled>` + Task 2 data), omitted commitment/submit (Task 5), read-only attachments list (Task 4), back-to-top button (Task 3), back→list via history (Task 5), generalized header (Task 1), route wiring (Task 6), visual verification (Task 7). All spec sections mapped.
- **Placeholder scan:** none — every code step contains full content.
- **Type consistency:** `MOCK_CLAIM_DETAIL` is typed `ClaimRequestFormValues`; `AttachmentFile` fields (`id`/`name`/`url`) match `MOCK_ATTACHMENTS` usage in `AttachmentsListSection`; `claimRequestDetailRoute` name consistent between Task 6 files.
- **Deviations:** `accidentDate` shows `01/06/2026` (no `00:00`) and VND shows `1,000` (comma), both consistent with the merged form per the approved spec.
