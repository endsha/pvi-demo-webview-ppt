# Claim Requests List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `ClaimsPlaceholder` in the "Yêu cầu bồi thường" tab of `GeneralInfoPage` with a real claim-requests list (table, status filter, search, pagination) driven by mock data.

**Architecture:** Pure logic + status metadata live in `claims-helpers.ts` (unit-tested); mock rows in `mock-claims.ts`; four presentational/container components in `general-info/components/` reuse the existing AntD `Table`/`Pagination`/`Input.Search`/`Dropdown` patterns and the shared formatters from `general-info-helpers.ts`. `GeneralInfoPage` swaps the placeholder for the new `ClaimsSection` and gives the claims tab a wider container.

**Tech Stack:** React 19, TypeScript, AntD 6, `@ant-design/icons`, Tailwind v4, dayjs, Vitest.

**Spec:** `docs/superpowers/specs/2026-06-09-claim-requests-list-design.md`

**Conventions (match these existing files):**
- Helpers pattern: `src/pages/general-info/general-info-helpers.ts`
- Helper tests: `src/pages/general-info/general-info-helpers.test.ts`
- Table component: `src/pages/general-info/components/AccumulationTable.tsx`
- Container with search/filter/pagination: `src/pages/general-info/components/AccumulationSection.tsx`
- `cn` util: `src/utils/cn.ts`; theme colors `pvi-navy`, `pvi-red`, `form-band`

**Note on TDD scope:** This codebase unit-tests only pure logic + mock data (no component render tests). Tasks 1–2 are full TDD. Presentational components (Tasks 3–6) are verified by `yarn build` + `yarn lint`; the whole feature is verified visually in Task 8.

**Commands:**
- Run one test file: `npx vitest run <path>`
- Lint: `yarn lint`
- Build (type-check + bundle): `yarn build`

---

## Task 1: Claims helpers (types, constants, pure functions, status metadata)

**Files:**
- Create: `src/pages/general-info/claims-helpers.ts`
- Test: `src/pages/general-info/claims-helpers.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/pages/general-info/claims-helpers.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import {
  filterClaimsByStatus,
  searchClaims,
  CLAIM_STATUS_META,
  CLAIM_STATUS_FILTER_OPTIONS,
  type ClaimRequest,
  type ClaimStatus,
} from './claims-helpers'

const claim = (id: string, requestNo: string, status: ClaimStatus): ClaimRequest => ({
  id,
  requestNo,
  status,
  createdAt: '2026-06-09T15:22:00',
  accidentDate: '2026-06-01',
  requestedAmount: 1000,
  paidAmount: 0,
})

const CLAIMS: ClaimRequest[] = [
  claim('a', '26TT000001', 'processing'),
  claim('b', '26TT000002', 'paid'),
  claim('c', '26TT000003', 'processing'),
  claim('d', '26TT000004', 'rejected'),
  claim('e', '26TT000005', 'closed'),
]

describe('filterClaimsByStatus', () => {
  test('all returns every claim', () => {
    expect(filterClaimsByStatus(CLAIMS, 'all')).toHaveLength(5)
  })
  test('processing returns only processing claims', () => {
    expect(filterClaimsByStatus(CLAIMS, 'processing').map((c) => c.id)).toEqual(['a', 'c'])
  })
  test('paid returns only paid claims', () => {
    expect(filterClaimsByStatus(CLAIMS, 'paid').map((c) => c.id)).toEqual(['b'])
  })
  test('rejected returns only rejected claims', () => {
    expect(filterClaimsByStatus(CLAIMS, 'rejected').map((c) => c.id)).toEqual(['d'])
  })
  test('closed returns only closed claims', () => {
    expect(filterClaimsByStatus(CLAIMS, 'closed').map((c) => c.id)).toEqual(['e'])
  })
  test('does not mutate input', () => {
    const copy = [...CLAIMS]
    filterClaimsByStatus(CLAIMS, 'paid')
    expect(CLAIMS).toEqual(copy)
  })
})

describe('searchClaims', () => {
  test('empty query returns all', () => {
    expect(searchClaims(CLAIMS, '')).toHaveLength(5)
  })
  test('whitespace query returns all', () => {
    expect(searchClaims(CLAIMS, '   ')).toHaveLength(5)
  })
  test('matches request number case-insensitively', () => {
    expect(searchClaims(CLAIMS, '26tt000002').map((c) => c.id)).toEqual(['b'])
  })
  test('matches a partial substring', () => {
    expect(searchClaims(CLAIMS, '0000').map((c) => c.id)).toEqual(['a', 'b', 'c', 'd', 'e'])
  })
  test('no match returns empty', () => {
    expect(searchClaims(CLAIMS, 'ZZZ')).toEqual([])
  })
})

describe('CLAIM_STATUS_META', () => {
  test('has a non-empty label and color for every status', () => {
    const statuses: ClaimStatus[] = ['processing', 'rejected', 'paid', 'closed']
    for (const status of statuses) {
      expect(CLAIM_STATUS_META[status].label.length).toBeGreaterThan(0)
      expect(CLAIM_STATUS_META[status].colorClass.length).toBeGreaterThan(0)
    }
  })
  test('uses the exact Vietnamese labels', () => {
    expect(CLAIM_STATUS_META.processing.label).toBe('Đang xử lý')
    expect(CLAIM_STATUS_META.rejected.label).toBe('Từ chối')
    expect(CLAIM_STATUS_META.paid.label).toBe('Đã chi trả')
    expect(CLAIM_STATUS_META.closed.label).toBe('Đóng')
  })
})

describe('CLAIM_STATUS_FILTER_OPTIONS', () => {
  test('lists the five options in screenshot order', () => {
    expect(CLAIM_STATUS_FILTER_OPTIONS.map((o) => o.value)).toEqual([
      'all',
      'rejected',
      'paid',
      'processing',
      'closed',
    ])
    expect(CLAIM_STATUS_FILTER_OPTIONS.map((o) => o.label)).toEqual([
      'Tất cả',
      'Từ chối',
      'Đã chi trả',
      'Đang xử lý',
      'Đóng',
    ])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/general-info/claims-helpers.test.ts`
Expected: FAIL — cannot resolve `./claims-helpers` (module does not exist yet).

- [ ] **Step 3: Write minimal implementation**

Create `src/pages/general-info/claims-helpers.ts`:

```ts
export type ClaimStatus = 'processing' | 'rejected' | 'paid' | 'closed'
export type ClaimStatusFilter = 'all' | ClaimStatus

export interface ClaimRequest {
  id: string
  requestNo: string
  status: ClaimStatus
  createdAt: string
  accidentDate: string
  requestedAmount: number
  paidAmount: number
}

export const CLAIMS_PAGE_SIZE = 10

export interface ClaimStatusMeta {
  label: string
  colorClass: string
}

export const CLAIM_STATUS_META: Record<ClaimStatus, ClaimStatusMeta> = {
  processing: { label: 'Đang xử lý', colorClass: 'text-orange-500' },
  rejected: { label: 'Từ chối', colorClass: 'text-pvi-red' },
  paid: { label: 'Đã chi trả', colorClass: 'text-green-600' },
  closed: { label: 'Đóng', colorClass: 'text-gray-500' },
}

export const CLAIM_STATUS_FILTER_OPTIONS: { value: ClaimStatusFilter; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'rejected', label: 'Từ chối' },
  { value: 'paid', label: 'Đã chi trả' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'closed', label: 'Đóng' },
]

export function filterClaimsByStatus(
  claims: readonly ClaimRequest[],
  filter: ClaimStatusFilter,
): ClaimRequest[] {
  if (filter === 'all') return [...claims]
  return claims.filter((c) => c.status === filter)
}

export function searchClaims(claims: readonly ClaimRequest[], query: string): ClaimRequest[] {
  const q = query.trim().toLowerCase()
  if (q === '') return [...claims]
  return claims.filter((c) => c.requestNo.toLowerCase().includes(q))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/general-info/claims-helpers.test.ts`
Expected: PASS (all describe blocks green).

- [ ] **Step 5: Commit**

```bash
git add src/pages/general-info/claims-helpers.ts src/pages/general-info/claims-helpers.test.ts
git commit -m "feat: add claims helpers (types, status meta, filter/search)"
```

---

## Task 2: Mock claims data

**Files:**
- Create: `src/pages/general-info/mock-claims.ts`
- Test: `src/pages/general-info/mock-claims.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/pages/general-info/mock-claims.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import { MOCK_CLAIM_REQUESTS } from './mock-claims'
import { CLAIM_STATUS_META } from './claims-helpers'

describe('MOCK_CLAIM_REQUESTS', () => {
  test('first row matches the screenshot claim exactly', () => {
    expect(MOCK_CLAIM_REQUESTS[0]).toMatchObject({
      requestNo: '26TT000015',
      status: 'processing',
      createdAt: '2026-06-09T15:22:00',
      accidentDate: '2026-06-01',
      requestedAmount: 1000,
      paidAmount: 0,
    })
  })
  test('has more rows than one page so pagination is demonstrable', () => {
    expect(MOCK_CLAIM_REQUESTS.length).toBeGreaterThan(10)
  })
  test('every row has a known status', () => {
    for (const claim of MOCK_CLAIM_REQUESTS) {
      expect(CLAIM_STATUS_META[claim.status]).toBeDefined()
    }
  })
  test('covers all four statuses', () => {
    const statuses = new Set(MOCK_CLAIM_REQUESTS.map((c) => c.status))
    expect(statuses).toEqual(new Set(['processing', 'rejected', 'paid', 'closed']))
  })
  test('request numbers are unique', () => {
    const nos = MOCK_CLAIM_REQUESTS.map((c) => c.requestNo)
    expect(new Set(nos).size).toBe(nos.length)
  })
  test('paid rows carry a non-zero paid amount', () => {
    const paid = MOCK_CLAIM_REQUESTS.filter((c) => c.status === 'paid')
    expect(paid.length).toBeGreaterThan(0)
    expect(paid.every((c) => c.paidAmount > 0)).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/general-info/mock-claims.test.ts`
Expected: FAIL — cannot resolve `./mock-claims`.

- [ ] **Step 3: Write minimal implementation**

Create `src/pages/general-info/mock-claims.ts`:

```ts
import type { ClaimRequest } from './claims-helpers'

export const MOCK_CLAIM_REQUESTS: ClaimRequest[] = [
  {
    id: 'c1',
    requestNo: '26TT000015',
    status: 'processing',
    createdAt: '2026-06-09T15:22:00',
    accidentDate: '2026-06-01',
    requestedAmount: 1000,
    paidAmount: 0,
  },
  {
    id: 'c2',
    requestNo: '26TT000014',
    status: 'paid',
    createdAt: '2026-06-05T10:10:00',
    accidentDate: '2026-05-28',
    requestedAmount: 5000000,
    paidAmount: 5000000,
  },
  {
    id: 'c3',
    requestNo: '26TT000013',
    status: 'rejected',
    createdAt: '2026-05-30T09:00:00',
    accidentDate: '2026-05-20',
    requestedAmount: 3000000,
    paidAmount: 0,
  },
  {
    id: 'c4',
    requestNo: '26TT000012',
    status: 'closed',
    createdAt: '2026-05-22T14:45:00',
    accidentDate: '2026-05-15',
    requestedAmount: 2000000,
    paidAmount: 2000000,
  },
  {
    id: 'c5',
    requestNo: '26TT000011',
    status: 'processing',
    createdAt: '2026-05-18T11:30:00',
    accidentDate: '2026-05-10',
    requestedAmount: 1500000,
    paidAmount: 0,
  },
  {
    id: 'c6',
    requestNo: '26TT000010',
    status: 'paid',
    createdAt: '2026-05-12T16:20:00',
    accidentDate: '2026-05-03',
    requestedAmount: 800000,
    paidAmount: 800000,
  },
  {
    id: 'c7',
    requestNo: '26TT000009',
    status: 'rejected',
    createdAt: '2026-05-08T08:15:00',
    accidentDate: '2026-04-29',
    requestedAmount: 1200000,
    paidAmount: 0,
  },
  {
    id: 'c8',
    requestNo: '26TT000008',
    status: 'processing',
    createdAt: '2026-05-02T13:05:00',
    accidentDate: '2026-04-24',
    requestedAmount: 2500000,
    paidAmount: 0,
  },
  {
    id: 'c9',
    requestNo: '26TT000007',
    status: 'paid',
    createdAt: '2026-04-26T10:40:00',
    accidentDate: '2026-04-18',
    requestedAmount: 600000,
    paidAmount: 600000,
  },
  {
    id: 'c10',
    requestNo: '26TT000006',
    status: 'closed',
    createdAt: '2026-04-20T15:55:00',
    accidentDate: '2026-04-12',
    requestedAmount: 900000,
    paidAmount: 900000,
  },
  {
    id: 'c11',
    requestNo: '26TT000005',
    status: 'processing',
    createdAt: '2026-04-14T09:25:00',
    accidentDate: '2026-04-05',
    requestedAmount: 1800000,
    paidAmount: 0,
  },
  {
    id: 'c12',
    requestNo: '26TT000004',
    status: 'paid',
    createdAt: '2026-04-08T12:00:00',
    accidentDate: '2026-03-30',
    requestedAmount: 3500000,
    paidAmount: 3500000,
  },
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/general-info/mock-claims.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/general-info/mock-claims.ts src/pages/general-info/mock-claims.test.ts
git commit -m "feat: add mock claim requests data"
```

---

## Task 3: ClaimStatusBadge component

**Files:**
- Create: `src/pages/general-info/components/ClaimStatusBadge.tsx`

- [ ] **Step 1: Write the component**

Create `src/pages/general-info/components/ClaimStatusBadge.tsx`:

```tsx
import type { ComponentType } from 'react'
import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  MinusCircleFilled,
} from '@ant-design/icons'
import { CLAIM_STATUS_META, type ClaimStatus } from '../claims-helpers'
import { cn } from '@/utils/cn'

const STATUS_ICON: Record<ClaimStatus, ComponentType> = {
  processing: LoadingOutlined,
  rejected: CloseCircleFilled,
  paid: CheckCircleFilled,
  closed: MinusCircleFilled,
}

interface ClaimStatusBadgeProps {
  status: ClaimStatus
}

export function ClaimStatusBadge({ status }: ClaimStatusBadgeProps) {
  const { label, colorClass } = CLAIM_STATUS_META[status]
  const Icon = STATUS_ICON[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap font-medium', colorClass)}>
      <Icon />
      {label}
    </span>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `yarn build`
Expected: PASS (no TypeScript errors). If a `ComponentType` mismatch appears on an icon, the icon import name is wrong — verify against `@ant-design/icons`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/general-info/components/ClaimStatusBadge.tsx
git commit -m "feat: add claim status badge component"
```

---

## Task 4: ClaimStatusFilter component (funnel dropdown)

**Files:**
- Create: `src/pages/general-info/components/ClaimStatusFilter.tsx`

- [ ] **Step 1: Write the component**

Create `src/pages/general-info/components/ClaimStatusFilter.tsx`:

```tsx
import { Button, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { CheckOutlined, FilterOutlined } from '@ant-design/icons'
import {
  CLAIM_STATUS_FILTER_OPTIONS,
  type ClaimStatusFilter as ClaimStatusFilterValue,
} from '../claims-helpers'

interface ClaimStatusFilterProps {
  value: ClaimStatusFilterValue
  onChange: (value: ClaimStatusFilterValue) => void
}

export function ClaimStatusFilter({ value, onChange }: ClaimStatusFilterProps) {
  const items: MenuProps['items'] = CLAIM_STATUS_FILTER_OPTIONS.map((opt) => ({
    key: opt.value,
    label: (
      <span className="flex min-w-32 items-center justify-between gap-6">
        {opt.label}
        {opt.value === value && <CheckOutlined className="text-pvi-navy" />}
      </span>
    ),
  }))

  return (
    <Dropdown
      trigger={['click']}
      menu={{ items, onClick: ({ key }) => onChange(key as ClaimStatusFilterValue) }}
    >
      <Button icon={<FilterOutlined />} aria-label="Lọc theo trạng thái" />
    </Dropdown>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `yarn build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/general-info/components/ClaimStatusFilter.tsx
git commit -m "feat: add claim status filter dropdown"
```

---

## Task 5: ClaimsTable component

**Files:**
- Create: `src/pages/general-info/components/ClaimsTable.tsx`

- [ ] **Step 1: Write the component**

Create `src/pages/general-info/components/ClaimsTable.tsx`:

```tsx
import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { ClaimRequest } from '../claims-helpers'
import { formatVnd, formatDate, formatDateTime } from '../general-info-helpers'
import { ClaimStatusBadge } from './ClaimStatusBadge'

interface ClaimsTableProps {
  claims: ClaimRequest[]
}

const columns: ColumnsType<ClaimRequest> = [
  {
    title: 'Số yêu cầu',
    dataIndex: 'requestNo',
    render: (requestNo: string) => (
      <button type="button" className="font-semibold text-blue-600 hover:underline">
        {requestNo}
      </button>
    ),
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    render: (status: ClaimRequest['status']) => <ClaimStatusBadge status={status} />,
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'createdAt',
    render: (at: string) => formatDateTime(at),
  },
  {
    title: 'Ngày tai nạn',
    dataIndex: 'accidentDate',
    render: (at: string) => formatDate(at),
  },
  {
    title: 'Tổng số tiền yêu cầu chi trả',
    dataIndex: 'requestedAmount',
    render: (amount: number) => formatVnd(amount),
  },
  {
    title: 'Số tiền đã chi trả',
    dataIndex: 'paidAmount',
    render: (amount: number) => formatVnd(amount),
  },
]

export function ClaimsTable({ claims }: ClaimsTableProps) {
  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={claims}
      pagination={false}
      scroll={{ x: 'max-content' }}
      locale={{ emptyText: 'Không tìm thấy yêu cầu phù hợp' }}
    />
  )
}
```

- [ ] **Step 2: Type-check**

Run: `yarn build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/general-info/components/ClaimsTable.tsx
git commit -m "feat: add claims table component"
```

---

## Task 6: ClaimsSection container

**Files:**
- Create: `src/pages/general-info/components/ClaimsSection.tsx`

- [ ] **Step 1: Write the component**

Create `src/pages/general-info/components/ClaimsSection.tsx`:

```tsx
import { useMemo, useState } from 'react'
import { Button, Input, Pagination } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'
import { ClaimsTable } from './ClaimsTable'
import { ClaimStatusFilter } from './ClaimStatusFilter'
import { MOCK_CLAIM_REQUESTS } from '../mock-claims'
import {
  filterClaimsByStatus,
  searchClaims,
  CLAIMS_PAGE_SIZE,
  type ClaimStatusFilter as ClaimStatusFilterValue,
} from '../claims-helpers'
import { paginate } from '../general-info-helpers'

export function ClaimsSection() {
  const [statusFilter, setStatusFilter] = useState<ClaimStatusFilterValue>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(
    () => searchClaims(filterClaimsByStatus(MOCK_CLAIM_REQUESTS, statusFilter), search),
    [statusFilter, search],
  )
  const paged = useMemo(() => paginate(filtered, page, CLAIMS_PAGE_SIZE), [filtered, page])

  const handleStatus = (v: ClaimStatusFilterValue) => {
    setStatusFilter(v)
    setPage(1)
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-xl font-bold text-pvi-navy">Danh sách yêu cầu bồi thường</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input.Search
            className="w-full sm:w-56"
            placeholder="Tìm kiếm"
            allowClear
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
          <ClaimStatusFilter value={statusFilter} onChange={handleStatus} />
          <Button type="primary" iconPosition="end" icon={<ArrowRightOutlined />}>
            Gửi yêu cầu bồi thường
          </Button>
        </div>
      </div>

      <ClaimsTable claims={paged} />

      <div className="mt-5 flex justify-center">
        <Pagination
          current={page}
          pageSize={CLAIMS_PAGE_SIZE}
          total={filtered.length}
          onChange={setPage}
          showSizeChanger={false}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `yarn build`
Expected: PASS. If `iconPosition` is rejected, AntD 6 still supports it on `Button`; confirm the prop name and keep `iconPosition="end"`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/general-info/components/ClaimsSection.tsx
git commit -m "feat: add claims section container"
```

---

## Task 7: Wire ClaimsSection into GeneralInfoPage and remove placeholder

**Files:**
- Modify: `src/pages/general-info/GeneralInfoPage.tsx`
- Delete: `src/pages/general-info/components/ClaimsPlaceholder.tsx`

- [ ] **Step 1: Replace the page body**

Replace the entire contents of `src/pages/general-info/GeneralInfoPage.tsx` with:

```tsx
import { useState } from 'react'
import { GeneralInfoHeader } from './components/GeneralInfoHeader'
import { InfoTabs, type InfoTabKey } from './components/InfoTabs'
import { ClaimsSection } from './components/ClaimsSection'
import { PolicyInfoSection } from './components/PolicyInfoSection'
import { BenefitsSection } from './components/BenefitsSection'
import { AccumulationSection } from './components/AccumulationSection'

export function GeneralInfoPage() {
  const [activeTab, setActiveTab] = useState<InfoTabKey>('general')

  return (
    <main className="flex-1 bg-form-band">
      <GeneralInfoHeader />
      <InfoTabs active={activeTab} onChange={setActiveTab} />
      {activeTab === 'general' ? (
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
          <div className="flex flex-col gap-6">
            <PolicyInfoSection />
            <BenefitsSection />
            <AccumulationSection />
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-5xl px-4 py-6">
          <ClaimsSection />
        </div>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Delete the now-unused placeholder**

```bash
git rm src/pages/general-info/components/ClaimsPlaceholder.tsx
```

- [ ] **Step 3: Verify build and lint are clean**

Run: `yarn build && yarn lint`
Expected: PASS, with no "unused import" or "module not found" errors referencing `ClaimsPlaceholder`.

- [ ] **Step 4: Run the full test suite**

Run: `yarn test`
Expected: PASS (claims-helpers, mock-claims, and all pre-existing tests green).

- [ ] **Step 5: Commit**

```bash
git add src/pages/general-info/GeneralInfoPage.tsx
git commit -m "feat: render claims list in general-info claims tab"
```

---

## Task 8: Visual verification against the screenshots

**Files:** none (manual verification)

- [ ] **Step 1: Start the dev server**

Run: `yarn dev`
Note the local URL (Vite prints e.g. `http://localhost:5173`).

- [ ] **Step 2: Navigate to the claims tab**

Open the lookup flow → general-info page, then click the **Yêu cầu bồi thường** tab. Resize the browser to 1440px wide to match the desktop screenshot.

- [ ] **Step 3: Compare against `docs/ui/claim-requests-list-01.png`**

Confirm:
- Card title `Danh sách yêu cầu bồi thường` on the left.
- Search box `Tìm kiếm`, funnel filter button, and navy `Gửi yêu cầu bồi thường →` button on the right.
- Table columns in order: Số yêu cầu · Trạng thái · Ngày tạo · Ngày tai nạn · Tổng số tiền yêu cầu chi trả · Số tiền đã chi trả.
- First row reads `26TT000015` (blue) · `Đang xử lý` (orange + spinner) · `09/06/2026 15:22` · `01/06/2026` · `1.000 VND` · `0 VND`.
- Pagination centered below.

- [ ] **Step 4: Compare the filter dropdown against `docs/ui/claim-requests-list-02.png`**

Click the funnel button. Confirm the dropdown lists, in order: `Tất cả` (checked) · `Từ chối` · `Đã chi trả` · `Đang xử lý` · `Đóng`. Pick `Đang xử lý` and confirm the table filters to processing rows and the checkmark moves.

- [ ] **Step 5: Exercise search + pagination**

- Type `26TT000004` in search → table narrows to that one row.
- Clear search, select `Tất cả` → page 2 appears in pagination; click it and confirm rows change.

- [ ] **Step 6: Fix any visual mismatches**

If anything deviates from the screenshots, adjust the relevant component, re-run `yarn build`, and commit with `fix: ...`. Otherwise this task is complete (no commit needed).

---

## Self-Review Notes

- **Spec coverage:** §2 data model → Task 1; §2 status meta + filter order → Task 1; §3 mock data → Task 2; §4 ClaimStatusBadge → Task 3; §4 ClaimStatusFilter → Task 4; §4 ClaimsTable → Task 5; §4 ClaimsSection → Task 6; §5 layout/width change → Task 7; §6 tests → Tasks 1–2; §7 out-of-scope (no-op CTA/link) honored in Tasks 5–6. All covered.
- **Type consistency:** `ClaimRequest`, `ClaimStatus`, `ClaimStatusFilter`, `CLAIMS_PAGE_SIZE`, `CLAIM_STATUS_META`, `CLAIM_STATUS_FILTER_OPTIONS`, `filterClaimsByStatus`, `searchClaims` defined in Task 1 are used with identical names/signatures in Tasks 3–6. `paginate`/`formatVnd`/`formatDate`/`formatDateTime` reused from `general-info-helpers.ts`.
- **No placeholders:** every code step contains full source; no TBD/TODO.
