# Claim Requests List — Design Spec

**Date:** 2026-06-09
**Feature:** Claim Requests List (Danh sách yêu cầu bồi thường)
**Source design:** `docs/ui/claim-requests-list-01.png`, `docs/ui/claim-requests-list-02.png`
**Scope:** UI + mock data only. No API, no claim submit form, no claim detail page.

---

## 1. Context & Placement

"Yêu cầu bồi thường" is the **second tab of the existing `GeneralInfoPage`**, not a standalone page.
Both screenshots share the same header (`Bảo hiểm tích luỹ Green SM Care Plus`) and the same
`InfoTabs` bar. This work **replaces `ClaimsPlaceholder`** with a real claims list.

Reuses existing primitives from the `general-info` feature:

- `formatVnd`, `formatDate`, `formatDateTime`, `paginate` from `general-info-helpers.ts`
- AntD `Table` / `Pagination` / `Input.Search` patterns established in `AccumulationSection.tsx`
- Theme tokens: `pvi-navy`, `pvi-red`, `form-band`

Follow `docs/rules/ui-ux-strict.md`: match screenshot copy, order, and behavior exactly.

---

## 2. Data Model — `claims-helpers.ts` (new)

```ts
export type ClaimStatus = 'processing' | 'rejected' | 'paid' | 'closed'
export type ClaimStatusFilter = 'all' | ClaimStatus

export interface ClaimRequest {
  id: string
  requestNo: string        // "26TT000015"
  status: ClaimStatus
  createdAt: string        // ISO → displayed "09/06/2026 15:22"
  accidentDate: string     // ISO → displayed "01/06/2026"
  requestedAmount: number  // 1000 → "1.000 VND"
  paidAmount: number       // 0    → "0 VND"
}

export const CLAIMS_PAGE_SIZE = 10
```

### Pure functions

- `filterClaimsByStatus(claims, filter)` — `'all'` returns a copy; otherwise filters by `status`.
- `searchClaims(claims, query)` — case-insensitive substring match on `requestNo`; empty/whitespace
  query returns a copy of all.
- Reuse `paginate`, `formatVnd`, `formatDate`, `formatDateTime` from `general-info-helpers.ts`.

### Status metadata

`CLAIM_STATUS_META: Record<ClaimStatus, { label: string; colorClass: string; Icon: ... }>`

Labels are exact from screenshot 02. The `processing` color (orange + spinner) is from the
screenshot; the other three colors are **semantic defaults** (flagged per ui-ux-strict rule #8 —
not visible in either screenshot):

| status       | label (exact) | color  | icon                      |
| ------------ | ------------- | ------ | ------------------------- |
| `processing` | Đang xử lý    | orange | spinner (LoadingOutlined) |
| `rejected`   | Từ chối       | red    | close-circle              |
| `paid`       | Đã chi trả    | green  | check-circle              |
| `closed`     | Đóng          | gray   | minus-circle              |

### Status filter dropdown order (exact, screenshot 02)

`Tất cả` → `Từ chối` → `Đã chi trả` → `Đang xử lý` → `Đóng`
(maps to `all` → `rejected` → `paid` → `processing` → `closed`).
Selected item shows a checkmark; default selected = `Tất cả`.

---

## 3. Mock Data — `mock-claims.ts` (new)

~12 `ClaimRequest` rows.

- **Row 1 is `26TT000015` exactly as pictured**: `processing`, createdAt `09/06/2026 15:22`,
  accidentDate `01/06/2026`, requestedAmount `1000`, paidAmount `0`.
- Remaining rows spread across all four statuses (including some `paid` rows with a non-zero
  `paidAmount`) so filter, search, and pagination are demonstrable (≥ 2 pages at page size 10).

---

## 4. Components (in `src/pages/general-info/components/`)

### `ClaimsSection.tsx` — container

- State: `statusFilter: ClaimStatusFilter`, `search: string`, `page: number`.
- Derived via `useMemo`: `filterClaimsByStatus(MOCK) → searchClaims → paginate`.
- Changing filter or search resets `page` to 1.
- Renders the white card on the gray band:
  - **Header row** — title `Danh sách yêu cầu bồi thường` (left); on the right: `Input.Search`
    (placeholder `Tìm kiếm`), the filter button, and the navy CTA. Stacks on mobile.
  - **Table** (`ClaimsTable`).
  - **Centered `Pagination`** (`pageSize = CLAIMS_PAGE_SIZE`, `showSizeChanger={false}`).
- CTA `Gửi yêu cầu bồi thường →`: navy `Button`, **no-op** (no route exists yet).

### `ClaimsTable.tsx`

AntD `Table`, `rowKey="id"`, `pagination={false}`, `scroll={{ x: 'max-content' }}`.
Columns in screenshot order:

1. **Số yêu cầu** — `requestNo` rendered as a blue link (**no-op**).
2. **Trạng thái** — `<ClaimStatusBadge status={...} />`.
3. **Ngày tạo** — `formatDateTime(createdAt)`.
4. **Ngày tai nạn** — `formatDate(accidentDate)`.
5. **Tổng số tiền yêu cầu chi trả** — `formatVnd(requestedAmount)`.
6. **Số tiền đã chi trả** — `formatVnd(paidAmount)`.

`locale.emptyText`: `Không tìm thấy yêu cầu phù hợp`.

### `ClaimStatusBadge.tsx`

Inline colored text + icon driven by `CLAIM_STATUS_META[status]`. Not a filled pill — matches the
screenshot's icon-plus-colored-text treatment.

### `ClaimStatusFilter.tsx`

Funnel icon button (`FilterOutlined`, square neutral button matching screenshot 01) opening an AntD
`Dropdown`. Menu lists the 5 options in exact order; the active option shows a checkmark. `onChange`
lifts the selected `ClaimStatusFilter` to `ClaimsSection`.

---

## 5. Layout Change — `GeneralInfoPage.tsx`

The claims card is wider than the general tab. Move the width wrapper to be per-tab:

- General tab content: `max-w-3xl` (unchanged).
- Claims tab content: `max-w-5xl`.

Header and `InfoTabs` remain full-width and shared.

---

## 6. Testing — `claims-helpers.test.ts` (Vitest, AAA)

- `filterClaimsByStatus`: returns all for `'all'`; returns only matching rows for each of the four
  statuses; returns a new array (no mutation of source).
- `searchClaims`: substring match on `requestNo` (case-insensitive); empty/whitespace query returns
  all; no-match returns empty array.
- `CLAIM_STATUS_META`: has an entry with a non-empty `label` for every `ClaimStatus`.

---

## 7. Out of Scope

- Claim submit form (`Gửi yêu cầu bồi thường` destination).
- Claim detail page (`Số yêu cầu` link destination).
- Any API / network calls.
