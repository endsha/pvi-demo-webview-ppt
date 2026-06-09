# Mock-First API Pattern

## Rule
Page components NEVER import mock data directly. All data goes through a
TanStack Query hook. The hook calls a mock function today; swap to real API
by changing one line in the hook — no callsite changes required.

## File structure per domain
```
src/api/<domain>/
  <domain>-types.ts       — shared TypeScript interfaces (request + response)
  <domain>-mock.ts        — async mock function, same shape as real endpoint
  <domain>-keys.ts        — TanStack Query key factory
  use-<domain>-query.ts   — hook (calls mock now, calls real API later)
```

## How to swap to real API
1. In `use-<domain>-query.ts`, replace the `fetchDashboardMock` call with a
   real `fetch`/`axios` call that returns the same `DomainData` type.
2. Delete or keep `<domain>-mock.ts` for tests — your choice.
3. No page or component file needs to change.

## Example: dashboard
- Types:  `src/api/dashboard/dashboard-types.ts`
- Mock:   `src/api/dashboard/dashboard-mock.ts`
- Keys:   `src/api/dashboard/dashboard-keys.ts`
- Hook:   `src/api/dashboard/use-dashboard-query.ts`
- Page:   `src/pages/DashboardPage.tsx` — only imports the hook

## What stays in the component
UI-only metadata (colors, icon variants, display order) that has no meaning
in the API response. Keep these as local constants in the component file.
