# General Info Page — Design Spec

**Date:** 2026-06-09
**Status:** Approved
**Scope:** UI + mock data only. No API, no network calls.

## Overview

Implement the "Bảo hiểm tích luỹ Green SM Care Plus" General Info page from the
seven reference screenshots (`docs/ui/general-info-01.png` … `general-info-07.png`).
The page presents a driver's accumulated-insurance information across three
collapsible sections under a "Thông tin chung" tab.

### Decisions (locked)

- **Tab scope:** Build the **Thông tin chung** tab fully. The **Yêu cầu bồi thường**
  (claims) tab renders as a visible-but-empty placeholder (no design exists yet).
- **Interactivity:** Controls are **functional against in-memory mock data** —
  filters, search, sort, pagination, accordion expand/collapse, and section
  collapse all work locally. No network.
- **Routing:** New route `/general-info`. The existing lookup page's "Tra cứu"
  button navigates here; the header back-arrow returns to `/`.

## Routing & Navigation

- New route file `src/router/routes/general-info-route.ts` → path `/general-info`,
  component `GeneralInfoPage`. Imported directly (consistent with `lookup-route.ts`).
- Register in `src/router/router.ts`: `rootRoute.addChildren([lookupRoute, generalInfoRoute])`.
- `src/pages/lookup/components/LookupForm.tsx`: the `handleFinish` handler calls
  `navigate({ to: '/general-info' })` instead of only `console.info`.
- `GeneralInfoHeader` back-arrow calls `navigate({ to: '/' })`.
- Reuses the existing `RootLayout` (`SiteHeader` with PVI logo + `SiteFooter`).
  No changes to the root layout.

## Component Architecture

Feature-folder mirroring `src/pages/lookup/`. Each file is focused (<200 lines),
container/presentational split, immutable data flow.

```
src/pages/general-info/
  GeneralInfoPage.tsx          // composition + active-tab state
  components/
    GeneralInfoHeader.tsx      // back arrow, centered title + subtitle
    InfoTabs.tsx               // custom 2-tab bar w/ red active underline
    ClaimsPlaceholder.tsx      // "Yêu cầu bồi thường" empty state
    PolicyInfoSection.tsx      // Section I (collapsible)
    BenefitsSection.tsx        // Section II (collapsible)
    BenefitAccordion.tsx       // list of expandable benefit rows
    AccumulationSection.tsx    // Section III (collapsible)
    AccumulationTable.tsx      // vehicle icon, mã chuyến, số tiền, time
    VehicleFilter.tsx          // shared Segmented: Tất cả / Xe máy / Ô tô
  mock-data.ts                 // typed mock constants
  general-info-helpers.ts      // types + pure filter/sort/paginate/format fns
```

## Sections (Thông tin chung tab)

### I. Thông tin chung — `PolicyInfoSection`
Collapsible. Contains:
- Label/value grid: Họ và tên, Mã Tài xế GSM, Số điện thoại,
  "Số tiền bảo hiểm tích lũy đến `<lookupDate>`".
- **Chọn Customer Partner ID** — AntD `Select` (single mock option, tag style).
- **Hợp đồng nguyên tắc** — blue link text (no navigation target; visual only).
- **Ngày tra cứu** — `DatePicker` (default 06/03/2025) + navy **Tra cứu** button.
  Pressing "Tra cứu" re-applies the chosen date to the displayed
  "tích lũy đến `<date>`" label. No network.

### II. Quyền lợi bảo hiểm — `BenefitsSection`
Collapsible. Contains:
- `VehicleFilter` (Segmented: Tất cả / Xe máy / Ô tô) — filters the benefit list.
- `BenefitAccordion` of 4 benefits. Each row shows title + "Hạn mức bảo hiểm
  tối đa `<amount>`" and expands to three sub-rows:
  Hạn mức tích lũy / Số tiền đã chi trả / Ước bồi thường phát sinh.
  Some benefits carry a grey description line (e.g. benefits 3 and 4).
- Dashed **Lưu ý** note box with bullet points at the bottom.

Benefits (from screenshots):
1. Tử vong do tai nạn — 2.000.000 VND
2. Thương tật toàn bộ vĩnh viễn do tai nạn — 2.000.000 VND
3. Trợ cấp nằm viện do tai nạn — 120.000 VND (with description)
4. Chi phí y tế do tai nạn — 120.000 VND (with description)

### III. Chi tiết các đơn bảo hiểm tích lũy — `AccumulationSection`
Collapsible. Contains:
- `VehicleFilter` (Segmented).
- **Thời hạn tích lũy** — Từ ngày / Đến ngày `DatePicker` pair
  (default 18/02/2025 → 06/03/2025).
- **Tổng số tích lũy** summary: Số đơn bảo hiểm đã tích lũy (8) +
  Số tiền bảo hiểm đã tích lũy (2.000.000 VND), derived from the filtered list.
- Toolbar: search `Input` (placeholder "Tìm kiếm") + sort `Select`
  (default "Mới nhất" / "Cũ nhất").
- `AccumulationTable`: columns Loại xe (vehicle icon) | Mã chuyến |
  Số tiền tích lũy / chuyến | Thời gian hoàn thành chuyến.
- `Pagination` below the table.

## State & Data Flow

All local client state (no server state, no TanStack Query usage):
- `activeTab` in `GeneralInfoPage` ('general' | 'claims').
- Each section owns its collapse open/closed state via AntD `Collapse`.
- `PolicyInfoSection`: `lookupDate` state (dayjs); "Tra cứu" commits it to the
  displayed label.
- `BenefitsSection`: `vehicleFilter` state → `useMemo` filtered benefits.
- `AccumulationSection`: `vehicleFilter`, `searchQuery`, `sortOrder`, `page` →
  derived list via pure pipeline `filterByVehicle → searchOrders → sortOrders →
  paginate`, recomputed with `useMemo`. Summary totals derive from the
  vehicle-filtered (pre-pagination) list. Immutable throughout.

### Mock data (`mock-data.ts`)
- `MOCK_POLICY_INFO` — name "Trần Việt Dũng", Mã Tài xế GSM "6062006",
  Customer Partner ID "6062006", phone "+84 389858021",
  accumulated amount 2.000.000 VND, contract "25/PC-GSM/014635".
  Values copied verbatim from screenshots (demo data).
- `MOCK_BENEFITS` — 4 entries as listed above, each with the 3 sub-amounts and
  a `vehicle` applicability + optional description.
- `MOCK_ACCUMULATION_ORDERS` — 8 entries, all motorbike, 250.000 VND each
  (8 × 250.000 = 2.000.000, matching the screenshots), with mã chuyến strings and
  completion timestamps (18/02/2025 times from screenshots).

### Types & helpers (`general-info-helpers.ts`)
- `type VehicleType = 'motorbike' | 'car'`
- `type VehicleFilterValue = 'all' | VehicleType`
- `type SortOrder = 'newest' | 'oldest'`
- Interfaces: `PolicyInfo`, `Benefit`, `AccumulationOrder`.
- Pure functions: `filterByVehicle`, `searchOrders`, `sortOrders`, `paginate`,
  `formatVnd`, `formatDate`. No mutation; each returns new values.

## UI / Styling

- AntD components: `Collapse`, `Segmented`, `Select`, `DatePicker`, `Input`,
  `Table`, `Pagination`, `Button` — themed via existing tokens
  (`PVI_NAVY`, `PVI_RED`, `FORM_BAND` in `src/app/theme.ts`).
- Tailwind for layout/spacing.
- Custom tab bar (`InfoTabs`) reproduces the red active-text + red underline
  (AntD `Tabs` default styling does not match cleanly).
- VND amounts formatted with `.` thousands separators + " VND" suffix;
  dates `dd/MM/yyyy`. Formatters live in helpers.
- Responsive: info rows and toolbars stack on mobile; table scrolls horizontally.
  Verified at 320 / 768 / 1024 / 1440.

## Error Handling

Minimal (no I/O):
- Empty-state row in `AccumulationTable` when a filter/search yields nothing.
- Empty-state in `BenefitAccordion` when a vehicle filter excludes all benefits.
- Date pickers guard empty/invalid input (fall back to defaults).
- Mock modules are the single source of truth.

## Testing Plan

- **Unit (Vitest):** pure helpers — `filterByVehicle`, `searchOrders`,
  `sortOrders`, `paginate`, `formatVnd`, `formatDate`. AAA pattern; edge cases:
  empty result, sort stability, page bounds, malformed search input.
- **E2E (Playwright smoke):**
  1. Lookup page "Tra cứu" → navigates to `/general-info`.
  2. Switching to "Yêu cầu bồi thường" shows the placeholder.
  3. Section III vehicle filter narrows the table.
  4. Search + pagination behave.
  5. Header back-arrow returns to `/`.

## Out of Scope

- Yêu cầu bồi thường (claims) tab content.
- Any real API / network integration.
- Persisting state to URL or storage.
- The "Hợp đồng nguyên tắc" link target.
