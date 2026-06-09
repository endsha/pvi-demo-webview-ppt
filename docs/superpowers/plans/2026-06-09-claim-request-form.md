# Claim Request Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the single-page "Nhập yêu cầu bồi thường" (Claim Request Form) — five collapsible sections ending in a `Nộp hồ sơ` button — UI + mock data only, no API.

**Architecture:** One AntD `Form` (`layout="vertical"`) on a new `/claim-request` route. Each of the five sections is its own component wrapped in a shared `SectionCard` (a single-item AntD `Collapse`, chevron on the right). Pure logic (commitment gating, VND formatting) and all option/type/mock data live in `claim-request-form-helpers.ts` + `mock-claim-request.ts`, mirroring the existing `general-info` / `lookup` pages. `Form.useWatch` drives two conditional behaviors: the inpatient-only treatment date range and the agree-all submit gate.

**Tech Stack:** React 19, TypeScript, AntD 6, TanStack Router, Tailwind v4 (CSS `@theme` tokens), dayjs, Vitest.

**Spec:** `docs/superpowers/specs/2026-06-09-claim-request-form-design.md`

---

## File Structure

| File | Responsibility |
|---|---|
| `src/pages/claim-request/claim-request-form-helpers.ts` (create) | Types, option lists, constants, pure helpers (`areAllCommitmentsAccepted`, `formatVndInput`, `parseVndInput`) |
| `src/pages/claim-request/claim-request-form-helpers.test.ts` (create) | Unit tests for the pure helpers |
| `src/pages/claim-request/mock-claim-request.ts` (create) | Prefilled insured-person mock |
| `src/pages/claim-request/components/SectionCard.tsx` (create) | Shared collapsible white card wrapper |
| `src/pages/claim-request/components/ClaimRequestHeader.tsx` (create) | Back arrow + centered title |
| `src/pages/claim-request/components/InsuredPersonSection.tsx` (create) | Section 1 |
| `src/pages/claim-request/components/AccidentMedicalSection.tsx` (create) | Section 2 (conditional date range) |
| `src/pages/claim-request/components/PaymentInfoSection.tsx` (create) | Section 3 |
| `src/pages/claim-request/components/AttachmentsSection.tsx` (create) | Section 4 |
| `src/pages/claim-request/components/CommitmentSection.tsx` (create) | Section 5 (toggle + checkboxes + submit) |
| `src/pages/claim-request/ClaimRequestPage.tsx` (create) | Page shell: Form + sections + onFinish |
| `src/router/routes/claim-request-route.ts` (create) | Route definition |
| `src/router/router.ts` (modify) | Register route in `routeTree` |
| `src/pages/general-info/components/ClaimsSection.tsx` (modify) | Wire entry button → `/claim-request` |

**Commands** (this repo uses yarn): test `yarn test`, build `yarn build`, lint `yarn lint`, dev `yarn dev`.

---

## Task 1: Helpers, mock data, and unit tests

**Files:**
- Create: `src/pages/claim-request/claim-request-form-helpers.ts`
- Create: `src/pages/claim-request/mock-claim-request.ts`
- Test: `src/pages/claim-request/claim-request-form-helpers.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/pages/claim-request/claim-request-form-helpers.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import {
  areAllCommitmentsAccepted,
  formatVndInput,
  parseVndInput,
  COMMITMENT_FIELDS,
  COMMITMENT_STATEMENTS,
  PAYMENT_CASE_OPTIONS,
  TREATMENT_TYPE_OPTIONS,
} from './claim-request-form-helpers'

describe('areAllCommitmentsAccepted', () => {
  test('false when values is undefined', () => {
    expect(areAllCommitmentsAccepted(undefined)).toBe(false)
  })
  test('false when only some are accepted', () => {
    expect(
      areAllCommitmentsAccepted({
        commitTruthful: true,
        commitThirdParty: true,
        commitSignature: false,
      }),
    ).toBe(false)
  })
  test('false when a field is missing', () => {
    expect(areAllCommitmentsAccepted({ commitTruthful: true })).toBe(false)
  })
  test('true only when all three are accepted', () => {
    expect(
      areAllCommitmentsAccepted({
        commitTruthful: true,
        commitThirdParty: true,
        commitSignature: true,
      }),
    ).toBe(true)
  })
})

describe('formatVndInput', () => {
  test('returns empty string for empty input', () => {
    expect(formatVndInput(undefined)).toBe('')
    expect(formatVndInput('')).toBe('')
  })
  test('inserts thousands separators', () => {
    expect(formatVndInput(1000)).toBe('1,000')
    expect(formatVndInput(1234567)).toBe('1,234,567')
  })
})

describe('parseVndInput', () => {
  test('strips non-digits', () => {
    expect(parseVndInput('1,234,567')).toBe('1234567')
    expect(parseVndInput('')).toBe('')
    expect(parseVndInput(undefined)).toBe('')
  })
})

describe('option/constant lists', () => {
  test('COMMITMENT_FIELDS matches COMMITMENT_STATEMENTS names', () => {
    expect(COMMITMENT_FIELDS).toEqual(COMMITMENT_STATEMENTS.map((s) => s.name))
  })
  test('payment cases are in screenshot order', () => {
    expect(PAYMENT_CASE_OPTIONS.map((o) => o.label)).toEqual([
      'Tử vong do tai nạn',
      'Thương tật toàn bộ vĩnh viễn do tai nạn',
      'Chi phí y tế do tai nạn',
      'Trợ cấp nằm viện do tai nạn',
    ])
  })
  test('treatment types are Ngoại trú then Nội trú', () => {
    expect(TREATMENT_TYPE_OPTIONS.map((o) => o.label)).toEqual(['Ngoại trú', 'Nội trú'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test src/pages/claim-request/claim-request-form-helpers.test.ts`
Expected: FAIL — cannot resolve `./claim-request-form-helpers`.

- [ ] **Step 3: Write the helpers**

Create `src/pages/claim-request/claim-request-form-helpers.ts`:

```ts
import type { Dayjs } from 'dayjs'

export type TreatmentType = 'outpatient' | 'inpatient'

export type PaymentCase =
  | 'death'
  | 'permanentDisability'
  | 'medicalExpense'
  | 'hospitalAllowance'

export interface ClaimRequestFormValues {
  // Insured person
  driverCode: string
  fullName: string
  gender: string
  idNumber?: string
  birthDate?: string
  email: string
  zaloPhone: string
  // Accident & medical
  accidentDate?: Dayjs
  accidentPlace: string
  examDate?: Dayjs
  admissionDate?: Dayjs
  treatmentPlace?: string
  diagnosis: string
  consequence: string
  treatmentType: TreatmentType
  treatmentFrom?: Dayjs
  treatmentTo?: Dayjs
  // Payment
  requestedAmount?: number
  paymentCases: PaymentCase[]
  beneficiaryName: string
  accountNumber: string
  bankName: string
  bankAddress?: string
  // Commitment
  commitTruthful: boolean
  commitThirdParty: boolean
  commitSignature: boolean
}

export const DEFAULT_TREATMENT_TYPE: TreatmentType = 'outpatient'

export const TREATMENT_TYPE_OPTIONS: { value: TreatmentType; label: string }[] = [
  { value: 'outpatient', label: 'Ngoại trú' },
  { value: 'inpatient', label: 'Nội trú' },
]

export const PAYMENT_CASE_OPTIONS: { value: PaymentCase; label: string }[] = [
  { value: 'death', label: 'Tử vong do tai nạn' },
  { value: 'permanentDisability', label: 'Thương tật toàn bộ vĩnh viễn do tai nạn' },
  { value: 'medicalExpense', label: 'Chi phí y tế do tai nạn' },
  { value: 'hospitalAllowance', label: 'Trợ cấp nằm viện do tai nạn' },
]

export const COMMITMENT_STATEMENTS = [
  {
    name: 'commitTruthful',
    text: 'Tôi cam đoan những thông tin kê khai trên đây là chính xác và đầy đủ. Tôi xin hoàn toàn chịu trách nhiệm trước pháp luật nếu có bất cứ sự sai lệch nào về thông tin đã cung cấp và bất cứ tranh chấp nào về quyền thụ hưởng số tiền được chi trả bảo hiểm.',
  },
  {
    name: 'commitThirdParty',
    text: 'Bằng Giấy yêu cầu chi trả tiền bảo hiểm này, tôi cho phép đại diện của Bảo hiểm PVI được quyền tiếp xúc với các bên thứ ba để thu thập thông tin cần thiết cho việc xét bồi thường này, bao gồm nhưng không giới hạn ở mức tiếp xúc với (các) bác sĩ đã và đang điều trị của tôi.',
  },
  {
    name: 'commitSignature',
    text: 'Việc nhấn "Gửi yêu cầu bồi thường" trên Cổng bồi thường trực tuyến sẽ thay cho chữ ký sống của tôi trên Giấy yêu cầu chi trả tiền bảo hiểm này.',
  },
] as const

export type CommitmentField = (typeof COMMITMENT_STATEMENTS)[number]['name']

export const COMMITMENT_FIELDS: CommitmentField[] = COMMITMENT_STATEMENTS.map((s) => s.name)

export function areAllCommitmentsAccepted(
  values: Partial<Record<CommitmentField, boolean>> | undefined,
): boolean {
  if (!values) return false
  return COMMITMENT_FIELDS.every((field) => values[field] === true)
}

export function formatVndInput(value: string | number | undefined): string {
  if (value === undefined || value === null || value === '') return ''
  return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function parseVndInput(displayValue: string | undefined): string {
  return (displayValue ?? '').replace(/[^\d]/g, '')
}
```

- [ ] **Step 4: Create the mock data file**

Create `src/pages/claim-request/mock-claim-request.ts`:

```ts
import type { ClaimRequestFormValues } from './claim-request-form-helpers'

// Mock prefilled values; in the real webview the host injects these read-only fields.
export const INSURED_PERSON_DEFAULTS: Pick<
  ClaimRequestFormValues,
  'driverCode' | 'fullName' | 'gender'
> = {
  driverCode: '6062006',
  fullName: 'Trần Việt Dũng',
  gender: 'Nam',
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `yarn test src/pages/claim-request/claim-request-form-helpers.test.ts`
Expected: PASS (all tests green).

- [ ] **Step 6: Commit**

```bash
git add src/pages/claim-request/claim-request-form-helpers.ts src/pages/claim-request/claim-request-form-helpers.test.ts src/pages/claim-request/mock-claim-request.ts
git commit -m "feat: add claim request form helpers, mock data, and tests"
```

---

## Task 2: Shared SectionCard + page header + route wiring

**Files:**
- Create: `src/pages/claim-request/components/SectionCard.tsx`
- Create: `src/pages/claim-request/components/ClaimRequestHeader.tsx`
- Create: `src/pages/claim-request/ClaimRequestPage.tsx`
- Create: `src/router/routes/claim-request-route.ts`
- Modify: `src/router/router.ts`
- Modify: `src/pages/general-info/components/ClaimsSection.tsx`

- [ ] **Step 1: Create the SectionCard wrapper**

Create `src/pages/claim-request/components/SectionCard.tsx`:

```tsx
import { Collapse } from 'antd'
import type { ReactNode } from 'react'

interface SectionCardProps {
  title: ReactNode
  children: ReactNode
}

export function SectionCard({ title, children }: SectionCardProps) {
  return (
    <Collapse
      defaultActiveKey={['1']}
      expandIconPosition="end"
      className="border-0 bg-white shadow-sm [&_.ant-collapse-content-box]:px-6 [&_.ant-collapse-header]:px-6"
      items={[
        {
          key: '1',
          label: <span className="text-lg font-bold text-pvi-navy">{title}</span>,
          children,
        },
      ]}
    />
  )
}
```

- [ ] **Step 2: Create the page header**

Create `src/pages/claim-request/components/ClaimRequestHeader.tsx`:

```tsx
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from '@tanstack/react-router'

export function ClaimRequestHeader() {
  const navigate = useNavigate()

  return (
    <div className="relative px-10 py-6 text-center">
      <button
        type="button"
        aria-label="Quay lại"
        onClick={() => navigate({ to: '/general-info' })}
        className="absolute left-2 top-7 text-pvi-navy transition-colors hover:text-pvi-red md:left-4"
      >
        <ArrowLeftOutlined />
      </button>
      <h1 className="text-2xl font-bold text-pvi-navy md:text-3xl">Nhập yêu cầu bồi thường</h1>
    </div>
  )
}
```

- [ ] **Step 3: Create a minimal page shell**

Create `src/pages/claim-request/ClaimRequestPage.tsx` (sections are added in later tasks; start with header + empty Form so the route compiles):

```tsx
import { Form, message } from 'antd'
import { ClaimRequestHeader } from './components/ClaimRequestHeader'
import { INSURED_PERSON_DEFAULTS } from './mock-claim-request'
import { DEFAULT_TREATMENT_TYPE, type ClaimRequestFormValues } from './claim-request-form-helpers'

export function ClaimRequestPage() {
  const [form] = Form.useForm<ClaimRequestFormValues>()
  const [messageApi, contextHolder] = message.useMessage()

  const handleFinish = (values: ClaimRequestFormValues) => {
    // UI-only: no API.
    console.info('Yêu cầu bồi thường:', values)
    messageApi.success('Đã nộp hồ sơ yêu cầu bồi thường (demo).')
  }

  return (
    <main className="flex-1 bg-form-band">
      {contextHolder}
      <ClaimRequestHeader />
      <div className="mx-auto w-full max-w-3xl px-4 pb-12">
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            ...INSURED_PERSON_DEFAULTS,
            treatmentType: DEFAULT_TREATMENT_TYPE,
            paymentCases: [],
            commitTruthful: false,
            commitThirdParty: false,
            commitSignature: false,
          }}
          requiredMark={(label, { required }) => (
            <>
              {label}
              {required && <span className="text-pvi-red"> *</span>}
            </>
          )}
          onFinish={handleFinish}
        >
          <div className="flex flex-col gap-5">{/* sections added in Tasks 3-7 */}</div>
        </Form>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Create the route**

Create `src/router/routes/claim-request-route.ts`:

```ts
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root-layout'
import { ClaimRequestPage } from '@/pages/claim-request/ClaimRequestPage'

export const claimRequestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/claim-request',
  component: ClaimRequestPage,
})
```

- [ ] **Step 5: Register the route**

Modify `src/router/router.ts` — add the import and include the route in `routeTree`:

```ts
import { createRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { rootRoute } from './routes/root-layout'
import { lookupRoute } from './routes/lookup-route'
import { generalInfoRoute } from './routes/general-info-route'
import { claimRequestRoute } from './routes/claim-request-route'

export const queryClient = new QueryClient()

const routeTree = rootRoute.addChildren([lookupRoute, generalInfoRoute, claimRequestRoute])

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

- [ ] **Step 6: Wire the claims-list entry button**

Modify `src/pages/general-info/components/ClaimsSection.tsx`. Add `useNavigate` to the imports from `@tanstack/react-router`, create the navigate handle inside the component, and add `onClick` to the existing `Gửi yêu cầu bồi thường` button.

Add import near the top:

```tsx
import { useNavigate } from '@tanstack/react-router'
```

Inside `ClaimsSection`, add after the existing `useState` hooks:

```tsx
  const navigate = useNavigate()
```

Replace the existing button:

```tsx
          <Button type="primary" iconPosition="end" icon={<ArrowRightOutlined />}>
            Gửi yêu cầu bồi thường
          </Button>
```

with:

```tsx
          <Button
            type="primary"
            iconPosition="end"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate({ to: '/claim-request' })}
          >
            Gửi yêu cầu bồi thường
          </Button>
```

- [ ] **Step 7: Verify build passes**

Run: `yarn build`
Expected: PASS (tsc + vite build succeed, no type errors).

- [ ] **Step 8: Verify navigation in the browser**

Run: `yarn dev`, open the app, go to General Info → claims tab, click `Gửi yêu cầu bồi thường`. Expected: URL becomes `/claim-request`, the header "Nhập yêu cầu bồi thường" shows, the back arrow returns to `/general-info`.

- [ ] **Step 9: Commit**

```bash
git add src/pages/claim-request/components/SectionCard.tsx src/pages/claim-request/components/ClaimRequestHeader.tsx src/pages/claim-request/ClaimRequestPage.tsx src/router/routes/claim-request-route.ts src/router/router.ts src/pages/general-info/components/ClaimsSection.tsx
git commit -m "feat: add claim request route, page shell, header, and entry wiring"
```

---

## Task 3: Insured person section

**Files:**
- Create: `src/pages/claim-request/components/InsuredPersonSection.tsx`
- Modify: `src/pages/claim-request/ClaimRequestPage.tsx`

- [ ] **Step 1: Create the section**

Create `src/pages/claim-request/components/InsuredPersonSection.tsx`:

```tsx
import { Col, Form, Input, Row } from 'antd'
import { SectionCard } from './SectionCard'

const READONLY_INPUT = 'bg-gray-100 text-gray-500'

export function InsuredPersonSection() {
  return (
    <SectionCard title="Thông tin về người được bảo hiểm">
      <Row gutter={[24, 0]}>
        <Col xs={24} md={12}>
          <Form.Item label="Mã Tài xế GSM" name="driverCode">
            <Input readOnly className={READONLY_INPUT} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Họ và tên" name="fullName">
            <Input readOnly className={READONLY_INPUT} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Giới tính" name="gender">
            <Input readOnly className={READONLY_INPUT} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Số CMND/ CCCD/ Hộ chiếu" name="idNumber">
            <Input placeholder="Nhập số CMND/CCCD/Hộ chiếu" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Ngày sinh" name="birthDate">
            <Input placeholder="Nhập ngày sinh" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Vui lòng nhập email' }]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Số điện thoại sử dụng Zalo"
            name="zaloPhone"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại sử dụng zalo' }]}
          >
            <Input placeholder="Nhập số điện thoại sử dụng zalo" />
          </Form.Item>
        </Col>
      </Row>
    </SectionCard>
  )
}
```

- [ ] **Step 2: Render it in the page**

Modify `src/pages/claim-request/ClaimRequestPage.tsx`. Add the import:

```tsx
import { InsuredPersonSection } from './components/InsuredPersonSection'
```

Replace `<div className="flex flex-col gap-5">{/* sections added in Tasks 3-7 */}</div>` with:

```tsx
          <div className="flex flex-col gap-5">
            <InsuredPersonSection />
          </div>
```

- [ ] **Step 3: Verify build passes**

Run: `yarn build`
Expected: PASS.

- [ ] **Step 4: Visual check against screenshot 01**

Run `yarn dev`, open `/claim-request`. Expected: section matches `docs/ui/claim-request-form-01.png` — three gray readonly fields (6062006 / Trần Việt Dũng / Nam), two-column grid, Email and Zalo phone with red `*` after label.

- [ ] **Step 5: Commit**

```bash
git add src/pages/claim-request/components/InsuredPersonSection.tsx src/pages/claim-request/ClaimRequestPage.tsx
git commit -m "feat: add insured person section to claim request form"
```

---

## Task 4: Accident & medical section (conditional date range)

**Files:**
- Create: `src/pages/claim-request/components/AccidentMedicalSection.tsx`
- Modify: `src/pages/claim-request/ClaimRequestPage.tsx`

- [ ] **Step 1: Create the section**

Create `src/pages/claim-request/components/AccidentMedicalSection.tsx`:

```tsx
import { Col, DatePicker, Form, Input, Radio, Row } from 'antd'
import { SectionCard } from './SectionCard'
import { TREATMENT_TYPE_OPTIONS, type ClaimRequestFormValues } from '../claim-request-form-helpers'

const DATE_FORMAT = 'DD/MM/YYYY'

export function AccidentMedicalSection() {
  const form = Form.useFormInstance<ClaimRequestFormValues>()
  const treatmentType = Form.useWatch('treatmentType', form)
  const isInpatient = treatmentType === 'inpatient'

  return (
    <SectionCard title="Thông tin về tai nạn và khám chữa bệnh">
      <Row gutter={[24, 0]}>
        <Col xs={24} md={12}>
          <Form.Item
            label="Ngày tai nạn"
            name="accidentDate"
            rules={[{ required: true, message: 'Vui lòng chọn ngày tai nạn' }]}
          >
            <DatePicker className="w-full" format={DATE_FORMAT} placeholder="Chọn Ngày tai nạn" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Nơi xảy ra tai nạn"
            name="accidentPlace"
            rules={[{ required: true, message: 'Vui lòng nhập nơi xảy ra tai nạn' }]}
          >
            <Input placeholder="Nhập nơi xảy ra tai nạn" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Ngày khám bệnh"
            name="examDate"
            rules={[{ required: true, message: 'Vui lòng chọn ngày khám bệnh' }]}
          >
            <DatePicker className="w-full" format={DATE_FORMAT} placeholder="Chọn ngày khám bệnh" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Ngày nhập viện" name="admissionDate">
            <DatePicker className="w-full" format={DATE_FORMAT} placeholder="Chọn ngày nhập viện" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Nơi điều trị" name="treatmentPlace">
            <Input placeholder="Nhập nơi điều trị" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Nguyên nhân / Chẩn đoán về tai nạn"
            name="diagnosis"
            rules={[{ required: true, message: 'Vui lòng nhập nguyên nhân/chẩn đoán về tai nạn' }]}
          >
            <Input placeholder="Nhập nguyên nhân/chẩn đoán về tai nạn" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Hậu quả"
            name="consequence"
            rules={[{ required: true, message: 'Vui lòng nhập hậu quả' }]}
          >
            <Input placeholder="Nhập hậu quả" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Hình thức điều trị"
            name="treatmentType"
            rules={[{ required: true, message: 'Vui lòng chọn hình thức điều trị' }]}
          >
            <Radio.Group options={TREATMENT_TYPE_OPTIONS} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Từ ngày" name="treatmentFrom">
            <DatePicker
              className="w-full"
              format={DATE_FORMAT}
              placeholder="Chọn ngày"
              disabled={!isInpatient}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Đến ngày" name="treatmentTo">
            <DatePicker
              className="w-full"
              format={DATE_FORMAT}
              placeholder="Chọn ngày"
              disabled={!isInpatient}
            />
          </Form.Item>
        </Col>
      </Row>
    </SectionCard>
  )
}
```

- [ ] **Step 2: Render it in the page**

Modify `src/pages/claim-request/ClaimRequestPage.tsx`. Add the import:

```tsx
import { AccidentMedicalSection } from './components/AccidentMedicalSection'
```

Add `<AccidentMedicalSection />` directly after `<InsuredPersonSection />` inside the sections `div`:

```tsx
          <div className="flex flex-col gap-5">
            <InsuredPersonSection />
            <AccidentMedicalSection />
          </div>
```

- [ ] **Step 3: Verify build passes**

Run: `yarn build`
Expected: PASS.

- [ ] **Step 4: Visual + behavior check against screenshot 02**

Run `yarn dev`, open `/claim-request`. Expected: matches `docs/ui/claim-request-form-02.png`. With `Ngoại trú` selected (default), `Từ ngày` / `Đến ngày` are disabled/grayed. Selecting `Nội trú` enables both date pickers; switching back to `Ngoại trú` disables them again.

- [ ] **Step 5: Commit**

```bash
git add src/pages/claim-request/components/AccidentMedicalSection.tsx src/pages/claim-request/ClaimRequestPage.tsx
git commit -m "feat: add accident & medical section with inpatient-only date range"
```

---

## Task 5: Payment info section

**Files:**
- Create: `src/pages/claim-request/components/PaymentInfoSection.tsx`
- Modify: `src/pages/claim-request/ClaimRequestPage.tsx`

- [ ] **Step 1: Create the section**

Create `src/pages/claim-request/components/PaymentInfoSection.tsx`:

```tsx
import { Checkbox, Col, Form, Input, InputNumber, Row } from 'antd'
import { SectionCard } from './SectionCard'
import { PAYMENT_CASE_OPTIONS, formatVndInput, parseVndInput } from '../claim-request-form-helpers'

export function PaymentInfoSection() {
  return (
    <SectionCard title="Thông tin thanh toán">
      <h3 className="mb-4 font-semibold text-pvi-navy">1. Nội dung yêu cầu chi trả bảo hiểm</h3>

      <Form.Item
        label="Tổng số tiền yêu cầu chi trả"
        name="requestedAmount"
        rules={[{ required: true, message: 'Vui lòng nhập số tiền yêu cầu chi trả' }]}
      >
        <InputNumber
          className="w-full"
          controls={false}
          formatter={formatVndInput}
          parser={parseVndInput}
          suffix={<span className="text-gray-400">VND</span>}
          placeholder="Nhập số tiền yêu cầu chi trả"
        />
      </Form.Item>

      <Form.Item
        label="Chi trả cho những trường hợp"
        name="paymentCases"
        rules={[{ required: true, message: 'Vui lòng chọn ít nhất một trường hợp' }]}
      >
        <Checkbox.Group className="w-full">
          <div className="flex w-full flex-col gap-3 rounded-xl border border-gray-200 p-4">
            {PAYMENT_CASE_OPTIONS.map((option) => (
              <Checkbox key={option.value} value={option.value}>
                {option.label}
              </Checkbox>
            ))}
          </div>
        </Checkbox.Group>
      </Form.Item>

      <h3 className="mb-4 mt-6 font-semibold text-pvi-navy">2. Thông tin người thụ hưởng</h3>
      <Row gutter={[24, 0]}>
        <Col xs={24} md={12}>
          <Form.Item
            label="Người thụ hưởng"
            name="beneficiaryName"
            rules={[{ required: true, message: 'Vui lòng nhập tên người thụ hưởng' }]}
          >
            <Input placeholder="Nhập tên người thụ hưởng" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Số tài khoản"
            name="accountNumber"
            rules={[{ required: true, message: 'Vui lòng nhập số tài khoản' }]}
          >
            <Input placeholder="Nhập số tài khoản" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Ngân hàng"
            name="bankName"
            rules={[{ required: true, message: 'Vui lòng nhập Ngân hàng' }]}
          >
            <Input placeholder="Nhập Ngân hàng" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Địa chỉ Ngân hàng" name="bankAddress">
            <Input placeholder="Nhập địa chỉ Ngân hàng" />
          </Form.Item>
        </Col>
      </Row>
    </SectionCard>
  )
}
```

- [ ] **Step 2: Render it in the page**

Modify `src/pages/claim-request/ClaimRequestPage.tsx`. Add the import:

```tsx
import { PaymentInfoSection } from './components/PaymentInfoSection'
```

Add `<PaymentInfoSection />` after `<AccidentMedicalSection />`:

```tsx
          <div className="flex flex-col gap-5">
            <InsuredPersonSection />
            <AccidentMedicalSection />
            <PaymentInfoSection />
          </div>
```

- [ ] **Step 3: Verify build passes**

Run: `yarn build`
Expected: PASS.

- [ ] **Step 4: Visual check against screenshot 03**

Run `yarn dev`. Expected: matches `docs/ui/claim-request-form-03.png` — amount input with `VND` on the right and live thousands separators while typing; four payment cases as checkboxes (multi-select) in a bordered box; beneficiary fields in a two-column grid.

- [ ] **Step 5: Commit**

```bash
git add src/pages/claim-request/components/PaymentInfoSection.tsx src/pages/claim-request/ClaimRequestPage.tsx
git commit -m "feat: add payment info section to claim request form"
```

---

## Task 6: Attachments section

**Files:**
- Create: `src/pages/claim-request/components/AttachmentsSection.tsx`
- Modify: `src/pages/claim-request/ClaimRequestPage.tsx`

- [ ] **Step 1: Create the section**

Create `src/pages/claim-request/components/AttachmentsSection.tsx`:

```tsx
import { Button, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { SectionCard } from './SectionCard'

export function AttachmentsSection() {
  return (
    <SectionCard title="Tài liệu đính kèm">
      <p className="mb-2 text-sm text-gray-700">Vui lòng tải lên tài liệu liên quan, gồm:</p>
      <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm text-gray-600">
        <li>
          Biên bản tai nạn:{' '}
          <a
            className="font-medium text-pvi-red"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            Tải mẫu biên bản
          </a>
        </li>
        <li>
          Chứng từ y tế phát sinh: Sổ khám, toa thuốc, các phiếu chỉ định &amp; kết quả cận lâm sàng
          (siêu âm, Xquang, xét nghiệm…)
        </li>
        <li>Chứng từ thanh toán: Hóa đơn tài chính, Phiếu thu, các bảng kê chi tiết kèm theo</li>
        <li>
          Hai mặt CMND/CCCD, Giấy phép lái xe, Giấy đăng ký xe (trường hợp điều khiển phương tiện
          giao thông)
        </li>
        <li>Các chứng từ liên quan khác (nếu có)</li>
      </ol>

      <Upload beforeUpload={() => false} multiple>
        <Button type="primary" icon={<UploadOutlined />}>
          Tải lên
        </Button>
      </Upload>

      <div className="mt-4 text-sm text-pvi-red">
        <p className="font-medium">Lưu ý:</p>
        <p>- Chỉ hỗ trợ các định dạng PNG, JPG, WORD, EXCEL, PDF, EMAIL, TXT, RAR và tối đa 5MB</p>
        <p>- Hình chụp cần rõ nét, không bị mất gốc/thông tin</p>
      </div>

      <p className="mt-4 text-sm text-gray-700">
        Trong một số trường hợp, Bảo hiểm PVI có thể yêu cầu Quý khách hàng hỗ trợ gửi bản gốc
        và/hoặc bổ sung các chứng từ yêu cầu bồi thường cho chúng tôi để xử lý bồi thường
      </p>
    </SectionCard>
  )
}
```

- [ ] **Step 2: Render it in the page**

Modify `src/pages/claim-request/ClaimRequestPage.tsx`. Add the import:

```tsx
import { AttachmentsSection } from './components/AttachmentsSection'
```

Add `<AttachmentsSection />` after `<PaymentInfoSection />`:

```tsx
          <div className="flex flex-col gap-5">
            <InsuredPersonSection />
            <AccidentMedicalSection />
            <PaymentInfoSection />
            <AttachmentsSection />
          </div>
```

- [ ] **Step 3: Verify build passes**

Run: `yarn build`
Expected: PASS.

- [ ] **Step 4: Visual + behavior check against screenshot 04**

Run `yarn dev`. Expected: matches `docs/ui/claim-request-form-04.png` — numbered instruction list with red "Tải mẫu biên bản" link, navy "Tải lên" button, red note lines, advisory paragraph. Selecting a file adds it to the list with **no network request** (check the Network tab — none fires).

- [ ] **Step 5: Commit**

```bash
git add src/pages/claim-request/components/AttachmentsSection.tsx src/pages/claim-request/ClaimRequestPage.tsx
git commit -m "feat: add attachments section to claim request form"
```

---

## Task 7: Commitment section (toggle + checkboxes + submit gating)

**Files:**
- Create: `src/pages/claim-request/components/CommitmentSection.tsx`
- Modify: `src/pages/claim-request/ClaimRequestPage.tsx`

- [ ] **Step 1: Create the section**

Create `src/pages/claim-request/components/CommitmentSection.tsx`:

```tsx
import { Button, Checkbox, Form, Switch } from 'antd'
import { SectionCard } from './SectionCard'
import {
  COMMITMENT_FIELDS,
  COMMITMENT_STATEMENTS,
  areAllCommitmentsAccepted,
  type ClaimRequestFormValues,
} from '../claim-request-form-helpers'

export function CommitmentSection() {
  const form = Form.useFormInstance<ClaimRequestFormValues>()
  const values = Form.useWatch([], form)
  const allAccepted = areAllCommitmentsAccepted(values)

  const handleToggleAll = (checked: boolean) => {
    form.setFieldsValue(Object.fromEntries(COMMITMENT_FIELDS.map((field) => [field, checked])))
  }

  const title = (
    <span className="inline-flex items-center gap-3">
      Cam kết
      <span onClick={(e) => e.stopPropagation()}>
        <Switch checked={allAccepted} onChange={handleToggleAll} />
      </span>
    </span>
  )

  return (
    <SectionCard title={title}>
      <div className="flex flex-col gap-4">
        {COMMITMENT_STATEMENTS.map((statement) => (
          <Form.Item key={statement.name} name={statement.name} valuePropName="checked" noStyle>
            <Checkbox>
              <span className="text-sm text-gray-700">{statement.text}</span>
            </Checkbox>
          </Form.Item>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          htmlType="submit"
          disabled={!allAccepted}
          className="min-w-48 border-pvi-navy text-pvi-navy"
        >
          Nộp hồ sơ
        </Button>
      </div>
    </SectionCard>
  )
}
```

- [ ] **Step 2: Render it in the page**

Modify `src/pages/claim-request/ClaimRequestPage.tsx`. Add the import:

```tsx
import { CommitmentSection } from './components/CommitmentSection'
```

Add `<CommitmentSection />` as the last section:

```tsx
          <div className="flex flex-col gap-5">
            <InsuredPersonSection />
            <AccidentMedicalSection />
            <PaymentInfoSection />
            <AttachmentsSection />
            <CommitmentSection />
          </div>
```

- [ ] **Step 3: Verify build passes**

Run: `yarn build`
Expected: PASS.

- [ ] **Step 4: Visual + behavior check against screenshot 05**

Run `yarn dev`. Expected: matches `docs/ui/claim-request-form-05.png`. Behavior:
- With 0–2 checkboxes ticked, the header `Switch` is OFF and `Nộp hồ sơ` is disabled.
- Ticking all three turns the `Switch` ON and enables `Nộp hồ sơ`.
- Toggling the `Switch` OFF clears all three; toggling ON checks all three. (Clicking the Switch does NOT collapse the panel.)
- With all three ticked and required fields filled, clicking `Nộp hồ sơ` logs the values and shows a success message (no network request).

- [ ] **Step 5: Commit**

```bash
git add src/pages/claim-request/components/CommitmentSection.tsx src/pages/claim-request/ClaimRequestPage.tsx
git commit -m "feat: add commitment section with agree-all toggle and submit gating"
```

---

## Task 8: Full verification pass

**Files:** none (verification only).

- [ ] **Step 1: Run the full test suite**

Run: `yarn test`
Expected: PASS (all suites including the new helpers tests).

- [ ] **Step 2: Run the linter**

Run: `yarn lint`
Expected: no errors. (If `react-refresh/only-export-components` flags any file, confirm component files export only components and helper/mock/route files contain no components.)

- [ ] **Step 3: Run the production build**

Run: `yarn build`
Expected: PASS.

- [ ] **Step 4: Full-page visual review**

Run `yarn dev`, walk through `/claim-request` top-to-bottom comparing against `docs/ui/claim-request-form-01.png` … `05.png`: section order, exact Vietnamese labels/placeholders, red `*` after required labels, two-column grids, conditional date range, VND amount formatting, multi-select payment cases, agree-all toggle + submit gating. Fix any pixel/label drift per `docs/rules/ui-ux-strict.md`.

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: align claim request form with screenshots after review"
```

(Skip this commit if Step 4 surfaced no changes.)

---

## Self-Review Notes

- **Spec coverage:** Routing/entry (Task 2) · Insured section (Task 3) · Accident section + inpatient-only date range (Task 4) · Payment amount/cases/beneficiary (Task 5) · Attachments + no-network upload (Task 6) · Commitment toggle/checkboxes/submit gating (Task 7) · UI-only `onFinish` (Task 2 shell, exercised Task 7) · helpers/tests (Task 1). All spec sections map to a task.
- **Type consistency:** `ClaimRequestFormValues`, `CommitmentField`, `COMMITMENT_FIELDS`, `COMMITMENT_STATEMENTS`, `PAYMENT_CASE_OPTIONS`, `TREATMENT_TYPE_OPTIONS`, `DEFAULT_TREATMENT_TYPE`, `formatVndInput`, `parseVndInput`, `areAllCommitmentsAccepted`, `INSURED_PERSON_DEFAULTS` are defined in Task 1 and consumed with identical names/signatures in Tasks 2–7.
- **No API:** Upload uses `beforeUpload={() => false}`; `onFinish` only logs + shows a message. No fetch/axios anywhere.
</content>
