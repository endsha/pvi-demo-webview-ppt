# General Info Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the "Bảo hiểm tích luỹ Green SM Care Plus" General Info page (Thông tin chung tab) from the seven reference screenshots, UI + in-memory mock data only, reachable at `/general-info` from the lookup page's "Tra cứu" button.

**Architecture:** A feature folder `src/pages/general-info/` mirroring the existing `src/pages/lookup/` pattern. A thin `GeneralInfoPage` composes a header, a custom 2-tab bar, and three collapsible sections. All data lives in typed mock modules; all controls (vehicle filter, search, sort, pagination, accordion, section collapse) operate locally via pure helper functions and React state. No network, no TanStack Query.

**Tech Stack:** React 19, TanStack Router, Ant Design 6, Tailwind v4 (CSS-first tokens), dayjs (dates), Vitest (unit tests for pure helpers). Package manager: **yarn**. Path alias `@/` → `src/`.

---

## File Structure

**Create:**
- `src/pages/general-info/general-info-helpers.ts` — types + pure helpers (filter/search/sort/paginate/format)
- `src/pages/general-info/general-info-helpers.test.ts` — Vitest unit tests
- `src/pages/general-info/mock-data.ts` — typed mock constants
- `src/pages/general-info/mock-data.test.ts` — Vitest sanity checks on mock data
- `src/pages/general-info/GeneralInfoPage.tsx` — composition + active-tab state
- `src/pages/general-info/components/GeneralInfoHeader.tsx`
- `src/pages/general-info/components/InfoTabs.tsx`
- `src/pages/general-info/components/ClaimsPlaceholder.tsx`
- `src/pages/general-info/components/PolicyInfoSection.tsx`
- `src/pages/general-info/components/VehicleFilter.tsx`
- `src/pages/general-info/components/BenefitsSection.tsx`
- `src/pages/general-info/components/BenefitAccordion.tsx`
- `src/pages/general-info/components/AccumulationSection.tsx`
- `src/pages/general-info/components/AccumulationTable.tsx`
- `src/router/routes/general-info-route.ts`

**Modify:**
- `package.json` — add `dayjs` dep, `vitest` dev dep, `test` script
- `src/router/router.ts` — register `generalInfoRoute`
- `src/pages/lookup/components/LookupForm.tsx` — navigate to `/general-info` on submit

**Testing note:** Pure logic (helpers, mock-data invariants) is unit-tested with Vitest (TDD). Presentational components have no automated tests — per the project's web/testing rule, highly visual components are verified by Playwright MCP visual checks (Task 11) rather than brittle markup assertions. This also matches the existing testless component approach in `src/pages/lookup/`.

---

## Task 1: Tooling — add dayjs, Vitest, test script

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add runtime + dev dependencies**

Run:
```bash
yarn add dayjs && yarn add -D vitest
```
Expected: `dayjs` appears under `dependencies`, `vitest` under `devDependencies`, install succeeds.

- [ ] **Step 2: Add the test script**

Edit `package.json` `scripts` to add a `test` entry (keep existing scripts):

```json
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run"
  },
```

- [ ] **Step 3: Verify Vitest runs (no tests yet)**

Run: `yarn test`
Expected: Vitest starts and reports "No test files found" (exit non-zero is acceptable here) — confirms the runner is wired.

- [ ] **Step 4: Commit**

```bash
git add package.json yarn.lock
git commit -m "chore: add dayjs and vitest for general-info page"
```

---

## Task 2: Types + formatting helpers (TDD)

**Files:**
- Create: `src/pages/general-info/general-info-helpers.ts`
- Test: `src/pages/general-info/general-info-helpers.test.ts`

- [ ] **Step 1: Write failing tests for formatters**

Create `src/pages/general-info/general-info-helpers.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import { formatVnd, formatDate, formatDateTime } from './general-info-helpers'

describe('formatVnd', () => {
  test('formats millions with dot separators and VND suffix', () => {
    expect(formatVnd(2000000)).toBe('2.000.000 VND')
  })

  test('formats zero', () => {
    expect(formatVnd(0)).toBe('0 VND')
  })

  test('formats hundred-thousands', () => {
    expect(formatVnd(120000)).toBe('120.000 VND')
  })
})

describe('formatDate', () => {
  test('formats ISO date as DD/MM/YYYY', () => {
    expect(formatDate('2025-03-06')).toBe('06/03/2025')
  })
})

describe('formatDateTime', () => {
  test('formats ISO datetime as DD/MM/YYYY HH:mm', () => {
    expect(formatDateTime('2025-02-18T19:15:00')).toBe('18/02/2025 19:15')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn test`
Expected: FAIL — "Failed to resolve import './general-info-helpers'" / functions not defined.

- [ ] **Step 3: Implement types + formatters**

Create `src/pages/general-info/general-info-helpers.ts`:

```ts
import dayjs from 'dayjs'

export type VehicleType = 'motorbike' | 'car'
export type VehicleFilterValue = 'all' | VehicleType
export type SortOrder = 'newest' | 'oldest'

export interface PolicyInfo {
  fullName: string
  driverCode: string
  partnerId: string
  phone: string
  accumulatedAmount: number
  contractNo: string
}

export interface BenefitDetail {
  accumulatedLimit: number
  paidAmount: number
  estimatedClaim: number
}

export interface Benefit {
  id: string
  order: number
  title: string
  maxLimit: number
  vehicle: VehicleFilterValue
  description?: string
  detail: BenefitDetail
}

export interface AccumulationOrder {
  id: string
  vehicle: VehicleType
  tripCode: string
  amount: number
  completedAt: string
}

export const ACCUMULATION_PAGE_SIZE = 10

export function formatVnd(amount: number): string {
  return `${amount.toLocaleString('de-DE')} VND`
}

export function formatDate(value: string | Date): string {
  return dayjs(value).format('DD/MM/YYYY')
}

export function formatDateTime(value: string | Date): string {
  return dayjs(value).format('DD/MM/YYYY HH:mm')
}
```

Note: `toLocaleString('de-DE')` yields dot thousands separators (`2.000.000`), matching the screenshots.

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn test`
Expected: PASS — all formatter tests green.

- [ ] **Step 5: Commit**

```bash
git add src/pages/general-info/general-info-helpers.ts src/pages/general-info/general-info-helpers.test.ts
git commit -m "feat: add general-info types and formatting helpers"
```

---

## Task 3: Filter / search / sort / paginate helpers (TDD)

**Files:**
- Modify: `src/pages/general-info/general-info-helpers.ts`
- Modify: `src/pages/general-info/general-info-helpers.test.ts`

- [ ] **Step 1: Append failing tests for data helpers**

Add to `src/pages/general-info/general-info-helpers.test.ts`:

```ts
import {
  filterOrdersByVehicle,
  filterBenefitsByVehicle,
  searchOrders,
  sortOrders,
  paginate,
  sumOrderAmount,
} from './general-info-helpers'
import type { AccumulationOrder, Benefit } from './general-info-helpers'

const order = (id: string, vehicle: 'motorbike' | 'car', code: string, at: string): AccumulationOrder => ({
  id,
  vehicle,
  tripCode: code,
  amount: 250000,
  completedAt: at,
})

const ORDERS: AccumulationOrder[] = [
  order('a', 'motorbike', 'AAA111', '2025-02-18T08:20:00'),
  order('b', 'car', 'BBB222', '2025-02-18T19:15:00'),
  order('c', 'motorbike', 'CCC333', '2025-02-18T15:36:00'),
]

describe('filterOrdersByVehicle', () => {
  test('all returns every order', () => {
    expect(filterOrdersByVehicle(ORDERS, 'all')).toHaveLength(3)
  })
  test('motorbike returns only motorbikes', () => {
    expect(filterOrdersByVehicle(ORDERS, 'motorbike').map((o) => o.id)).toEqual(['a', 'c'])
  })
  test('does not mutate input', () => {
    const copy = [...ORDERS]
    filterOrdersByVehicle(ORDERS, 'car')
    expect(ORDERS).toEqual(copy)
  })
})

describe('filterBenefitsByVehicle', () => {
  const benefit = (id: string, vehicle: 'all' | 'motorbike' | 'car'): Benefit => ({
    id,
    order: 1,
    title: id,
    maxLimit: 1000,
    vehicle,
    detail: { accumulatedLimit: 1000, paidAmount: 0, estimatedClaim: 0 },
  })
  const BENEFITS = [benefit('x', 'all'), benefit('y', 'car')]
  test('motorbike filter keeps all-applicable benefits', () => {
    expect(filterBenefitsByVehicle(BENEFITS, 'motorbike').map((b) => b.id)).toEqual(['x'])
  })
  test('all filter keeps everything', () => {
    expect(filterBenefitsByVehicle(BENEFITS, 'all')).toHaveLength(2)
  })
})

describe('searchOrders', () => {
  test('empty query returns all', () => {
    expect(searchOrders(ORDERS, '')).toHaveLength(3)
  })
  test('matches trip code case-insensitively', () => {
    expect(searchOrders(ORDERS, 'bbb').map((o) => o.id)).toEqual(['b'])
  })
  test('trims whitespace', () => {
    expect(searchOrders(ORDERS, '  ccc ').map((o) => o.id)).toEqual(['c'])
  })
  test('no match returns empty', () => {
    expect(searchOrders(ORDERS, 'zzz')).toEqual([])
  })
})

describe('sortOrders', () => {
  test('newest first by completedAt desc', () => {
    expect(sortOrders(ORDERS, 'newest').map((o) => o.id)).toEqual(['b', 'c', 'a'])
  })
  test('oldest first by completedAt asc', () => {
    expect(sortOrders(ORDERS, 'oldest').map((o) => o.id)).toEqual(['a', 'c', 'b'])
  })
  test('does not mutate input', () => {
    const copy = [...ORDERS]
    sortOrders(ORDERS, 'newest')
    expect(ORDERS).toEqual(copy)
  })
})

describe('paginate', () => {
  const items = [1, 2, 3, 4, 5]
  test('returns the requested page slice (1-based)', () => {
    expect(paginate(items, 2, 2)).toEqual([3, 4])
  })
  test('clamps page below 1 to first page', () => {
    expect(paginate(items, 0, 2)).toEqual([1, 2])
  })
  test('out-of-range page returns empty', () => {
    expect(paginate(items, 9, 2)).toEqual([])
  })
})

describe('sumOrderAmount', () => {
  test('sums amounts', () => {
    expect(sumOrderAmount(ORDERS)).toBe(750000)
  })
  test('empty list sums to zero', () => {
    expect(sumOrderAmount([])).toBe(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn test`
Expected: FAIL — the new helper functions are not exported yet.

- [ ] **Step 3: Implement the data helpers**

Append to `src/pages/general-info/general-info-helpers.ts`:

```ts
export function filterOrdersByVehicle(
  orders: readonly AccumulationOrder[],
  filter: VehicleFilterValue,
): AccumulationOrder[] {
  if (filter === 'all') return [...orders]
  return orders.filter((o) => o.vehicle === filter)
}

export function filterBenefitsByVehicle(
  benefits: readonly Benefit[],
  filter: VehicleFilterValue,
): Benefit[] {
  if (filter === 'all') return [...benefits]
  return benefits.filter((b) => b.vehicle === 'all' || b.vehicle === filter)
}

export function searchOrders(
  orders: readonly AccumulationOrder[],
  query: string,
): AccumulationOrder[] {
  const q = query.trim().toLowerCase()
  if (q === '') return [...orders]
  return orders.filter((o) => o.tripCode.toLowerCase().includes(q))
}

export function sortOrders(
  orders: readonly AccumulationOrder[],
  order: SortOrder,
): AccumulationOrder[] {
  const sorted = [...orders].sort(
    (a, b) => a.completedAt.localeCompare(b.completedAt),
  )
  return order === 'newest' ? sorted.reverse() : sorted
}

export function paginate<T>(items: readonly T[], page: number, pageSize: number): T[] {
  const safePage = Math.max(1, page)
  const start = (safePage - 1) * pageSize
  return items.slice(start, start + pageSize)
}

export function sumOrderAmount(orders: readonly AccumulationOrder[]): number {
  return orders.reduce((total, o) => total + o.amount, 0)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn test`
Expected: PASS — all helper tests green.

- [ ] **Step 5: Commit**

```bash
git add src/pages/general-info/general-info-helpers.ts src/pages/general-info/general-info-helpers.test.ts
git commit -m "feat: add general-info filter/search/sort/paginate helpers"
```

---

## Task 4: Mock data (TDD on invariants)

**Files:**
- Create: `src/pages/general-info/mock-data.ts`
- Test: `src/pages/general-info/mock-data.test.ts`

- [ ] **Step 1: Write failing invariant tests**

Create `src/pages/general-info/mock-data.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import { MOCK_POLICY_INFO, MOCK_BENEFITS, MOCK_ACCUMULATION_ORDERS } from './mock-data'
import { sumOrderAmount } from './general-info-helpers'

describe('mock policy info', () => {
  test('matches the reference screenshot values', () => {
    expect(MOCK_POLICY_INFO.fullName).toBe('Trần Việt Dũng')
    expect(MOCK_POLICY_INFO.phone).toBe('+84 389858021')
    expect(MOCK_POLICY_INFO.contractNo).toBe('25/PC-GSM/014635')
    expect(MOCK_POLICY_INFO.accumulatedAmount).toBe(2000000)
  })
})

describe('mock benefits', () => {
  test('has four benefits', () => {
    expect(MOCK_BENEFITS).toHaveLength(4)
  })
  test('benefit ids are unique', () => {
    expect(new Set(MOCK_BENEFITS.map((b) => b.id)).size).toBe(4)
  })
})

describe('mock accumulation orders', () => {
  test('has eight orders', () => {
    expect(MOCK_ACCUMULATION_ORDERS).toHaveLength(8)
  })
  test('order ids are unique', () => {
    expect(new Set(MOCK_ACCUMULATION_ORDERS.map((o) => o.id)).size).toBe(8)
  })
  test('total accumulated equals the policy accumulated amount', () => {
    expect(sumOrderAmount(MOCK_ACCUMULATION_ORDERS)).toBe(MOCK_POLICY_INFO.accumulatedAmount)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn test`
Expected: FAIL — "Failed to resolve import './mock-data'".

- [ ] **Step 3: Implement the mock data**

Create `src/pages/general-info/mock-data.ts`:

```ts
import type { AccumulationOrder, Benefit, PolicyInfo } from './general-info-helpers'

export const MOCK_POLICY_INFO: PolicyInfo = {
  fullName: 'Trần Việt Dũng',
  driverCode: '6062006',
  partnerId: '6062006',
  phone: '+84 389858021',
  accumulatedAmount: 2000000,
  contractNo: '25/PC-GSM/014635',
}

export const DEFAULT_LOOKUP_DATE = '2025-03-06'
export const DEFAULT_RANGE_FROM = '2025-02-18'
export const DEFAULT_RANGE_TO = '2025-03-06'

export const MOCK_BENEFITS: Benefit[] = [
  {
    id: 'death',
    order: 1,
    title: 'Tử vong do tai nạn',
    maxLimit: 2000000,
    vehicle: 'all',
    detail: { accumulatedLimit: 2000000, paidAmount: 0, estimatedClaim: 0 },
  },
  {
    id: 'permanent-disability',
    order: 2,
    title: 'Thương tật toàn bộ vĩnh viễn do tai nạn',
    maxLimit: 2000000,
    vehicle: 'all',
    detail: { accumulatedLimit: 2000000, paidAmount: 0, estimatedClaim: 0 },
  },
  {
    id: 'hospital-allowance',
    order: 3,
    title: 'Trợ cấp nằm viện do tai nạn',
    maxLimit: 120000,
    vehicle: 'all',
    description:
      'Chỉ trả trợ cấp nằm viện do tai nạn từ trọn 2 ngày trở lên, tối đa mỗi đợt nằm viện 1.500.000 VND đối với tài xế xe máy & 3.000.000 VND đối với tài xế ô tô',
    detail: { accumulatedLimit: 120000, paidAmount: 0, estimatedClaim: 0 },
  },
  {
    id: 'medical-expense',
    order: 4,
    title: 'Chi phí y tế do tai nạn',
    maxLimit: 120000,
    vehicle: 'all',
    description: 'Chi chi trả các chi phí y tế phát sinh trong thời hạn bảo hiểm',
    detail: { accumulatedLimit: 120000, paidAmount: 0, estimatedClaim: 0 },
  },
]

export const MOCK_BENEFIT_NOTES: string[] = [
  'STBH tích lũy và hạn mức quyền lợi sẽ được cập nhật theo ngày',
  'Hệ thống chỉ hiển thị thông tin các chuyến xe tích lũy bảo hiểm',
]

const trip = (id: string, tripCode: string, completedAt: string): AccumulationOrder => ({
  id,
  vehicle: 'motorbike',
  tripCode,
  amount: 250000,
  completedAt,
})

export const MOCK_ACCUMULATION_ORDERS: AccumulationOrder[] = [
  trip('o1', '01JMCDK44W2MSDJC26JJCTZFQM', '2025-02-18T19:15:00'),
  trip('o2', '01JMC63NQJEECB1VK39Q3382TJ', '2025-02-18T16:55:00'),
  trip('o3', '01JMC4K0BE3TY4ADPJ7CWSQKCX', '2025-02-18T16:28:00'),
  trip('o4', '01JMC375NWNWSRPF1CET7RNDS5', '2025-02-18T15:56:00'),
  trip('o5', '01JMC178G5AWEYDN9T5DWBRAPF', '2025-02-18T15:36:00'),
  trip('o6', '01JMBA0GACW20YA8N7831GWA11', '2025-02-18T09:01:00'),
  trip('o7', '01JMB8GEJY4WJ0MBT006SWW45Q', '2025-02-18T08:20:00'),
  trip('o8', '01JMB644Z1V6WXKHT811A8H2CP', '2025-02-18T07:52:00'),
]
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn test`
Expected: PASS — all mock-data invariants green.

- [ ] **Step 5: Commit**

```bash
git add src/pages/general-info/mock-data.ts src/pages/general-info/mock-data.test.ts
git commit -m "feat: add general-info mock data"
```

---

## Task 5: Route, page shell, and navigation wiring

**Files:**
- Create: `src/pages/general-info/GeneralInfoPage.tsx`
- Create: `src/router/routes/general-info-route.ts`
- Modify: `src/router/router.ts`
- Modify: `src/pages/lookup/components/LookupForm.tsx`

- [ ] **Step 1: Create the page shell**

Create `src/pages/general-info/GeneralInfoPage.tsx`:

```tsx
export function GeneralInfoPage() {
  return (
    <main className="flex-1 bg-form-band">
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <h1 className="text-center text-2xl font-bold text-pvi-navy">
          Bảo hiểm tích luỹ Green SM Care Plus
        </h1>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Create the route**

Create `src/router/routes/general-info-route.ts`:

```ts
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root-layout'
import { GeneralInfoPage } from '@/pages/general-info/GeneralInfoPage'

export const generalInfoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/general-info',
  component: GeneralInfoPage,
})
```

- [ ] **Step 3: Register the route**

Edit `src/router/router.ts` — import and add to the route tree:

```ts
import { createRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { rootRoute } from './routes/root-layout'
import { lookupRoute } from './routes/lookup-route'
import { generalInfoRoute } from './routes/general-info-route'

export const queryClient = new QueryClient()

const routeTree = rootRoute.addChildren([lookupRoute, generalInfoRoute])

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

- [ ] **Step 4: Wire the lookup "Tra cứu" button to navigate**

Edit `src/pages/lookup/components/LookupForm.tsx`. Add the router hook import and replace `handleFinish`:

At the top imports, add:
```tsx
import { useNavigate } from '@tanstack/react-router'
```

Inside `LookupForm`, replace the existing `handleFinish`:
```tsx
  const navigate = useNavigate()

  const handleFinish = (values: LookupFormValues) => {
    // UI-only: no API. Persisted lookup happens on the General Info page.
    console.info('Tra cứu:', values)
    navigate({ to: '/general-info' })
  }
```

- [ ] **Step 5: Verify build + dev render**

Run: `yarn build`
Expected: PASS — TypeScript + Vite build succeed with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/pages/general-info/GeneralInfoPage.tsx src/router/routes/general-info-route.ts src/router/router.ts src/pages/lookup/components/LookupForm.tsx
git commit -m "feat: add general-info route and wire lookup navigation"
```

---

## Task 6: Header, tab bar, and claims placeholder

**Files:**
- Create: `src/pages/general-info/components/GeneralInfoHeader.tsx`
- Create: `src/pages/general-info/components/InfoTabs.tsx`
- Create: `src/pages/general-info/components/ClaimsPlaceholder.tsx`
- Modify: `src/pages/general-info/GeneralInfoPage.tsx`

- [ ] **Step 1: Create the header**

Create `src/pages/general-info/components/GeneralInfoHeader.tsx`:

```tsx
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from '@tanstack/react-router'

export function GeneralInfoHeader() {
  const navigate = useNavigate()

  return (
    <div className="relative px-10 py-6 text-center">
      <button
        type="button"
        aria-label="Quay lại"
        onClick={() => navigate({ to: '/' })}
        className="absolute left-2 top-7 text-pvi-navy transition-colors hover:text-pvi-red md:left-4"
      >
        <ArrowLeftOutlined />
      </button>
      <h1 className="text-2xl font-bold text-pvi-navy md:text-3xl">
        Bảo hiểm tích luỹ Green SM Care Plus
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Vui lòng điền thông tin bên dưới để tra cứu thông tin
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Create the custom tab bar**

Create `src/pages/general-info/components/InfoTabs.tsx`:

```tsx
import { cn } from '@/utils/cn'

export type InfoTabKey = 'general' | 'claims'

interface InfoTabsProps {
  active: InfoTabKey
  onChange: (key: InfoTabKey) => void
}

const TABS: { key: InfoTabKey; label: string }[] = [
  { key: 'general', label: 'Thông tin chung' },
  { key: 'claims', label: 'Yêu cầu bồi thường' },
]

export function InfoTabs({ active, onChange }: InfoTabsProps) {
  return (
    <div className="flex w-full border-b border-gray-200 bg-white">
      {TABS.map((tab) => {
        const isActive = tab.key === active
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              'flex-1 border-b-2 px-4 py-3 text-center text-sm font-semibold transition-colors',
              isActive
                ? 'border-pvi-red text-pvi-red'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Create the claims placeholder**

Create `src/pages/general-info/components/ClaimsPlaceholder.tsx`:

```tsx
import { Empty } from 'antd'

export function ClaimsPlaceholder() {
  return (
    <div className="flex min-h-60 items-center justify-center py-16">
      <Empty description="Tính năng đang được cập nhật" />
    </div>
  )
}
```

- [ ] **Step 4: Wire header + tabs into the page**

Replace `src/pages/general-info/GeneralInfoPage.tsx`:

```tsx
import { useState } from 'react'
import { GeneralInfoHeader } from './components/GeneralInfoHeader'
import { InfoTabs, type InfoTabKey } from './components/InfoTabs'
import { ClaimsPlaceholder } from './components/ClaimsPlaceholder'

export function GeneralInfoPage() {
  const [activeTab, setActiveTab] = useState<InfoTabKey>('general')

  return (
    <main className="flex-1 bg-form-band">
      <GeneralInfoHeader />
      <InfoTabs active={activeTab} onChange={setActiveTab} />
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        {activeTab === 'general' ? (
          <div className="text-center text-gray-400">Sections coming in next tasks</div>
        ) : (
          <ClaimsPlaceholder />
        )}
      </div>
    </main>
  )
}
```

- [ ] **Step 5: Verify build**

Run: `yarn build`
Expected: PASS — no type errors.

- [ ] **Step 6: Commit**

```bash
git add src/pages/general-info/components/GeneralInfoHeader.tsx src/pages/general-info/components/InfoTabs.tsx src/pages/general-info/components/ClaimsPlaceholder.tsx src/pages/general-info/GeneralInfoPage.tsx
git commit -m "feat: add general-info header, tabs, and claims placeholder"
```

---

## Task 7: Section I — Thông tin chung (PolicyInfoSection)

**Files:**
- Create: `src/pages/general-info/components/PolicyInfoSection.tsx`
- Modify: `src/pages/general-info/GeneralInfoPage.tsx`

- [ ] **Step 1: Create the section**

Create `src/pages/general-info/components/PolicyInfoSection.tsx`:

```tsx
import { useState } from 'react'
import { Button, Collapse, DatePicker, Select } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { MOCK_POLICY_INFO, DEFAULT_LOOKUP_DATE } from '../mock-data'
import { formatDate, formatVnd } from '../general-info-helpers'

interface InfoRowProps {
  label: string
  children: React.ReactNode
}

function InfoRow({ label, children }: InfoRowProps) {
  return (
    <div className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:gap-4">
      <span className="text-sm text-gray-500 sm:w-64 sm:shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900">{children}</span>
    </div>
  )
}

export function PolicyInfoSection() {
  const info = MOCK_POLICY_INFO
  const [lookupDate, setLookupDate] = useState<Dayjs>(dayjs(DEFAULT_LOOKUP_DATE))
  const [committedDate, setCommittedDate] = useState<Dayjs>(dayjs(DEFAULT_LOOKUP_DATE))

  const handleLookup = () => {
    // UI-only: re-applies the chosen date to the displayed accumulated label. No API.
    setCommittedDate(lookupDate)
  }

  return (
    <Collapse
      defaultActiveKey={['info']}
      expandIconPosition="end"
      items={[
        {
          key: 'info',
          label: <span className="text-base font-bold">I. Thông tin chung</span>,
          children: (
            <div className="rounded-lg bg-white p-4">
              <InfoRow label="Họ và tên">{info.fullName}</InfoRow>
              <InfoRow label="Mã Tài xế GSM">{info.driverCode}</InfoRow>
              <InfoRow label="Chọn Customer Partner ID">
                <Select
                  className="w-full sm:w-80"
                  value={info.partnerId}
                  options={[{ value: info.partnerId, label: info.partnerId }]}
                />
              </InfoRow>
              <InfoRow label="Số điện thoại">{info.phone}</InfoRow>
              <InfoRow label={`Số tiền bảo hiểm tích lũy đến ${formatDate(committedDate.toDate())}`}>
                {formatVnd(info.accumulatedAmount)}
              </InfoRow>
              <InfoRow label="Hợp đồng nguyên tắc">
                <span className="cursor-pointer text-pvi-navy underline">{info.contractNo}</span>
              </InfoRow>

              <div className="mt-4 flex flex-col gap-3 rounded-lg bg-form-band p-4 sm:flex-row sm:items-center">
                <span className="text-sm text-gray-500 sm:w-64 sm:shrink-0">Ngày tra cứu</span>
                <DatePicker
                  className="w-full sm:w-60"
                  format="DD/MM/YYYY"
                  allowClear={false}
                  value={lookupDate}
                  onChange={(d) => d && setLookupDate(d)}
                />
                <Button type="primary" onClick={handleLookup}>
                  Tra cứu
                </Button>
              </div>
            </div>
          ),
        },
      ]}
    />
  )
}
```

- [ ] **Step 2: Render it in the General tab**

Edit `src/pages/general-info/GeneralInfoPage.tsx` — import and replace the "Sections coming in next tasks" placeholder div:

```tsx
import { PolicyInfoSection } from './components/PolicyInfoSection'
```

Replace the general-tab branch content:
```tsx
        {activeTab === 'general' ? (
          <div className="flex flex-col gap-6">
            <PolicyInfoSection />
          </div>
        ) : (
          <ClaimsPlaceholder />
        )}
```

- [ ] **Step 3: Verify build**

Run: `yarn build`
Expected: PASS — no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/general-info/components/PolicyInfoSection.tsx src/pages/general-info/GeneralInfoPage.tsx
git commit -m "feat: add general-info Section I (policy info)"
```

---

## Task 8: Section II — Quyền lợi bảo hiểm (VehicleFilter + BenefitsSection + BenefitAccordion)

**Files:**
- Create: `src/pages/general-info/components/VehicleFilter.tsx`
- Create: `src/pages/general-info/components/BenefitAccordion.tsx`
- Create: `src/pages/general-info/components/BenefitsSection.tsx`
- Modify: `src/pages/general-info/GeneralInfoPage.tsx`

- [ ] **Step 1: Create the shared vehicle filter**

Create `src/pages/general-info/components/VehicleFilter.tsx`:

```tsx
import { Segmented } from 'antd'
import type { VehicleFilterValue } from '../general-info-helpers'

interface VehicleFilterProps {
  value: VehicleFilterValue
  onChange: (value: VehicleFilterValue) => void
}

const OPTIONS: { value: VehicleFilterValue; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'motorbike', label: 'Xe máy' },
  { value: 'car', label: 'Ô tô' },
]

export function VehicleFilter({ value, onChange }: VehicleFilterProps) {
  return (
    <Segmented
      value={value}
      onChange={(v) => onChange(v as VehicleFilterValue)}
      options={OPTIONS}
    />
  )
}
```

- [ ] **Step 2: Create the benefit accordion**

Create `src/pages/general-info/components/BenefitAccordion.tsx`:

```tsx
import { Collapse, Empty } from 'antd'
import type { Benefit } from '../general-info-helpers'
import { formatVnd } from '../general-info-helpers'

interface BenefitAccordionProps {
  benefits: Benefit[]
}

function DetailRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-500">• {label}</span>
      <span className="text-sm font-medium text-gray-900">{formatVnd(value)}</span>
    </div>
  )
}

export function BenefitAccordion({ benefits }: BenefitAccordionProps) {
  if (benefits.length === 0) {
    return <Empty description="Không có quyền lợi phù hợp" className="py-8" />
  }

  return (
    <Collapse
      expandIconPosition="end"
      items={benefits.map((b) => ({
        key: b.id,
        label: (
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col">
              <span className="font-semibold text-pvi-navy">
                {b.order}. {b.title}
              </span>
              {b.description && (
                <span className="mt-1 text-xs text-gray-400">{b.description}</span>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Hạn mức bảo hiểm tối đa</div>
              <div className="font-bold text-pvi-red">{formatVnd(b.maxLimit)}</div>
            </div>
          </div>
        ),
        children: (
          <div className="px-1">
            <DetailRow label="Hạn mức tích lũy" value={b.detail.accumulatedLimit} />
            <DetailRow label="Số tiền đã chi trả" value={b.detail.paidAmount} />
            <DetailRow label="Ước bồi thường phát sinh" value={b.detail.estimatedClaim} />
          </div>
        ),
      }))}
    />
  )
}
```

- [ ] **Step 3: Create the benefits section**

Create `src/pages/general-info/components/BenefitsSection.tsx`:

```tsx
import { useMemo, useState } from 'react'
import { Collapse } from 'antd'
import { VehicleFilter } from './VehicleFilter'
import { BenefitAccordion } from './BenefitAccordion'
import { MOCK_BENEFITS, MOCK_BENEFIT_NOTES } from '../mock-data'
import { filterBenefitsByVehicle, type VehicleFilterValue } from '../general-info-helpers'

export function BenefitsSection() {
  const [vehicle, setVehicle] = useState<VehicleFilterValue>('all')
  const benefits = useMemo(() => filterBenefitsByVehicle(MOCK_BENEFITS, vehicle), [vehicle])

  return (
    <Collapse
      defaultActiveKey={['benefits']}
      expandIconPosition="end"
      items={[
        {
          key: 'benefits',
          label: <span className="text-base font-bold">II. Quyền lợi bảo hiểm</span>,
          extra: (
            <div onClick={(e) => e.stopPropagation()}>
              <VehicleFilter value={vehicle} onChange={setVehicle} />
            </div>
          ),
          children: (
            <div className="flex flex-col gap-4">
              <BenefitAccordion benefits={benefits} />
              <div className="rounded-lg border border-dashed border-gray-300 p-4">
                <div className="mb-2 text-sm font-semibold text-gray-700">Lưu ý</div>
                <ul className="list-disc space-y-1 pl-5">
                  {MOCK_BENEFIT_NOTES.map((note) => (
                    <li key={note} className="text-xs text-gray-500">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ),
        },
      ]}
    />
  )
}
```

Note: the `extra` slot holds the vehicle filter on the section header (matching the screenshots). `stopPropagation` keeps filter clicks from toggling the collapse.

- [ ] **Step 4: Render it in the General tab**

Edit `src/pages/general-info/GeneralInfoPage.tsx` — import and add below `PolicyInfoSection`:

```tsx
import { BenefitsSection } from './components/BenefitsSection'
```

Inside the general-tab `flex flex-col gap-6` container:
```tsx
            <PolicyInfoSection />
            <BenefitsSection />
```

- [ ] **Step 5: Verify build**

Run: `yarn build`
Expected: PASS — no type errors.

- [ ] **Step 6: Commit**

```bash
git add src/pages/general-info/components/VehicleFilter.tsx src/pages/general-info/components/BenefitAccordion.tsx src/pages/general-info/components/BenefitsSection.tsx src/pages/general-info/GeneralInfoPage.tsx
git commit -m "feat: add general-info Section II (benefits)"
```

---

## Task 9: Section III — Chi tiết các đơn bảo hiểm tích lũy (AccumulationSection + AccumulationTable)

**Files:**
- Create: `src/pages/general-info/components/AccumulationTable.tsx`
- Create: `src/pages/general-info/components/AccumulationSection.tsx`
- Modify: `src/pages/general-info/GeneralInfoPage.tsx`

- [ ] **Step 1: Create the table**

Create `src/pages/general-info/components/AccumulationTable.tsx`:

```tsx
import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { AccumulationOrder } from '../general-info-helpers'
import { formatVnd, formatDateTime } from '../general-info-helpers'

interface AccumulationTableProps {
  orders: AccumulationOrder[]
}

const VEHICLE_ICON: Record<AccumulationOrder['vehicle'], string> = {
  motorbike: '🛵',
  car: '🚗',
}

const columns: ColumnsType<AccumulationOrder> = [
  {
    title: 'Loại xe',
    dataIndex: 'vehicle',
    width: 80,
    render: (vehicle: AccumulationOrder['vehicle']) => (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-form-band text-lg">
        {VEHICLE_ICON[vehicle]}
      </span>
    ),
  },
  { title: 'Mã chuyến', dataIndex: 'tripCode' },
  {
    title: 'Số tiền tích lũy / chuyến',
    dataIndex: 'amount',
    render: (amount: number) => <span className="text-pvi-navy">{formatVnd(amount)}</span>,
  },
  {
    title: 'Thời gian hoàn thành chuyến',
    dataIndex: 'completedAt',
    render: (at: string) => formatDateTime(at),
  },
]

export function AccumulationTable({ orders }: AccumulationTableProps) {
  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={orders}
      pagination={false}
      scroll={{ x: 'max-content' }}
      locale={{ emptyText: 'Không tìm thấy chuyến phù hợp' }}
    />
  )
}
```

- [ ] **Step 2: Create the accumulation section**

Create `src/pages/general-info/components/AccumulationSection.tsx`:

```tsx
import { useMemo, useState } from 'react'
import { Collapse, DatePicker, Input, Pagination, Select } from 'antd'
import dayjs from 'dayjs'
import { VehicleFilter } from './VehicleFilter'
import { AccumulationTable } from './AccumulationTable'
import { MOCK_ACCUMULATION_ORDERS, DEFAULT_RANGE_FROM, DEFAULT_RANGE_TO } from '../mock-data'
import {
  filterOrdersByVehicle,
  searchOrders,
  sortOrders,
  paginate,
  sumOrderAmount,
  formatVnd,
  ACCUMULATION_PAGE_SIZE,
  type SortOrder,
  type VehicleFilterValue,
} from '../general-info-helpers'

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
]

export function AccumulationSection() {
  const [vehicle, setVehicle] = useState<VehicleFilterValue>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOrder>('newest')
  const [page, setPage] = useState(1)

  const filtered = useMemo(
    () => filterOrdersByVehicle(MOCK_ACCUMULATION_ORDERS, vehicle),
    [vehicle],
  )
  const visible = useMemo(
    () => sortOrders(searchOrders(filtered, search), sort),
    [filtered, search, sort],
  )
  const paged = useMemo(
    () => paginate(visible, page, ACCUMULATION_PAGE_SIZE),
    [visible, page],
  )

  const handleVehicle = (v: VehicleFilterValue) => {
    setVehicle(v)
    setPage(1)
  }

  return (
    <Collapse
      defaultActiveKey={['accumulation']}
      expandIconPosition="end"
      items={[
        {
          key: 'accumulation',
          label: (
            <span className="text-base font-bold">III. Chi tiết các đơn bảo hiểm tích lũy</span>
          ),
          extra: (
            <div onClick={(e) => e.stopPropagation()}>
              <VehicleFilter value={vehicle} onChange={handleVehicle} />
            </div>
          ),
          children: (
            <div className="flex flex-col gap-5">
              <div>
                <div className="mb-2 text-sm font-semibold text-gray-700">Thời hạn tích lũy</div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <DatePicker
                    className="w-full sm:w-48"
                    format="DD/MM/YYYY"
                    defaultValue={dayjs(DEFAULT_RANGE_FROM)}
                  />
                  <DatePicker
                    className="w-full sm:w-48"
                    format="DD/MM/YYYY"
                    defaultValue={dayjs(DEFAULT_RANGE_TO)}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-form-band p-4">
                <div className="mb-2 text-sm font-semibold text-gray-700">Tổng số tích lũy</div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-500">Số đơn bảo hiểm đã tích lũy</span>
                  <span className="font-semibold text-pvi-red">{filtered.length}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-500">Số tiền bảo hiểm đã tích lũy</span>
                  <span className="font-semibold text-pvi-navy">
                    {formatVnd(sumOrderAmount(filtered))}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="text-sm font-semibold text-gray-700">
                  Danh sách các đơn BH tích lũy
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Input.Search
                    className="w-full sm:max-w-xs"
                    placeholder="Tìm kiếm"
                    allowClear
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                  />
                  <Select
                    className="w-full sm:w-40"
                    value={sort}
                    options={SORT_OPTIONS}
                    onChange={(v) => setSort(v)}
                  />
                </div>
              </div>

              <AccumulationTable orders={paged} />

              <div className="flex justify-center">
                <Pagination
                  current={page}
                  pageSize={ACCUMULATION_PAGE_SIZE}
                  total={visible.length}
                  onChange={setPage}
                  showSizeChanger={false}
                />
              </div>
            </div>
          ),
        },
      ]}
    />
  )
}
```

- [ ] **Step 3: Render it in the General tab**

Edit `src/pages/general-info/GeneralInfoPage.tsx` — import and add below `BenefitsSection`:

```tsx
import { AccumulationSection } from './components/AccumulationSection'
```

Inside the general-tab container:
```tsx
            <PolicyInfoSection />
            <BenefitsSection />
            <AccumulationSection />
```

- [ ] **Step 4: Verify build**

Run: `yarn build`
Expected: PASS — no type errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/general-info/components/AccumulationTable.tsx src/pages/general-info/components/AccumulationSection.tsx src/pages/general-info/GeneralInfoPage.tsx
git commit -m "feat: add general-info Section III (accumulation orders)"
```

---

## Task 10: Full unit-test + lint pass

**Files:** none (verification)

- [ ] **Step 1: Run the full unit suite**

Run: `yarn test`
Expected: PASS — all helper + mock-data tests green.

- [ ] **Step 2: Run lint**

Run: `yarn lint`
Expected: PASS — no ESLint errors. Fix any reported issues (e.g. unused imports) and re-run.

- [ ] **Step 3: Run the build**

Run: `yarn build`
Expected: PASS.

- [ ] **Step 4: Commit any lint fixes**

```bash
git add -A
git commit -m "chore: lint pass for general-info page" || echo "nothing to commit"
```

---

## Task 11: Visual verification (Playwright MCP)

**Files:** none (manual verification using the Playwright MCP browser tools)

- [ ] **Step 1: Start the dev server**

Run (background): `yarn dev`
Note the local URL (typically `http://localhost:5173`).

- [ ] **Step 2: Verify navigation flow**

Using the Playwright MCP browser:
1. Navigate to the dev URL (`/`).
2. Click "Tra cứu" → confirm the URL becomes `/general-info` and the header title renders.
3. Click the back arrow → confirm return to `/`.

- [ ] **Step 3: Verify the General tab at each breakpoint**

Resize the browser to widths **320, 768, 1024, 1440** and screenshot each. Confirm against the reference screenshots (`docs/ui/general-info-01.png` … `-07.png`):
- Section I rows, Customer Partner ID select, contract link, date + Tra cứu button.
- Section II benefits accordion expands to 3 detail rows; Lưu ý box renders.
- Section III date range, totals (8 / 2.000.000 VND), search, sort, table rows with 🛵 icon, single-page pagination.
- No horizontal overflow on mobile (table scrolls within its container).

- [ ] **Step 4: Verify interactivity**

- Section III vehicle filter → "Ô tô" shows the empty state ("Không tìm thấy chuyến phù hợp"); "Tất cả"/"Xe máy" show all 8.
- Search "01JMB6" narrows to one row.
- Sort toggle reorders by completion time.
- "Yêu cầu bồi thường" tab shows the placeholder Empty state.
- Each section collapses/expands via its header chevron.

- [ ] **Step 5: Stop the dev server**

Stop the background `yarn dev` process.

- [ ] **Step 6: Final commit (if any tweaks were needed)**

```bash
git add -A
git commit -m "fix: visual polish for general-info page" || echo "nothing to commit"
```

---

## Self-Review Notes (for the planner)

**Spec coverage:** Routing (Task 5) · Section I (Task 7) · Section II + filter + note box (Task 8) · Section III + table + search/sort/pagination (Task 9) · claims placeholder (Task 6) · mock data verbatim (Task 4) · helpers + formats (Tasks 2–3) · responsive + visual checks (Task 11). All spec sections mapped.

**Type consistency:** `VehicleFilterValue`, `SortOrder`, `AccumulationOrder`, `Benefit`, `PolicyInfo`, `ACCUMULATION_PAGE_SIZE` are defined in Task 2/3 and consumed identically in Tasks 8–9. Helper names (`filterOrdersByVehicle`, `filterBenefitsByVehicle`, `searchOrders`, `sortOrders`, `paginate`, `sumOrderAmount`, `formatVnd`, `formatDate`, `formatDateTime`) are used consistently across components.

**Pagination note:** With 8 mock orders and `ACCUMULATION_PAGE_SIZE = 10`, the list is a single page — matching the screenshots' lone "1" indicator. Pagination is still wired (component reflects `total`/`current`); the multi-page `paginate` logic is covered by unit tests.
