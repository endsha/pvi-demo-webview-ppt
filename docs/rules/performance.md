# Performance

<!-- last-reviewed: 2026-05-10 -->

## Scope
Bundle, render, and network performance for the Vite + React SPA. Code-splitting, bundle
budgets, memoization, virtualization, image handling, AntD bundle hygiene, Vite chunking.

## Stack assumptions
Vite (latest), React 18+, TanStack Router 1+, TanStack Query 5+, AntD 5+, TypeScript strict.
Soft budgets are tunable per release — change the numbers in this file when adjusted.

## Rules

### 1. Route-level code-splitting is the default
- Every TanStack Router route component is lazy-imported. The router owns the chunk
  boundary. Do not introduce manual `React.lazy` boundaries inside a route unless a
  single route exceeds 100 KB gzip.

```ts
import { lazyRouteComponent } from '@tanstack/react-router';
component: lazyRouteComponent(() => import('@/pages/UsersPage')),
```

(See `routing.md` Rule 9 for why `lazyRouteComponent` over React's `lazy`.)

### 2. Bundle budgets (soft, tunable)
- **Initial JS** (entry + critical chunks): ≤ **250 KB gzip**.
- **Per-route chunk**: ≤ **100 KB gzip**.
- **CSS total**: ≤ **50 KB gzip**.
- Enforce in CI with `size-limit`. Visualise with `rollup-plugin-visualizer` —
  generated artifact reviewed on every release.
- Exceeding a budget requires explicit approval recorded in the PR description.

### 3. AntD bundle hygiene
- Import components from `'antd'` — AntD 5+ is tree-shaken; deep imports (`antd/lib/...`
  or `antd/es/...`) are forbidden and break tree-shaking.
- Icons: per-icon imports from `@ant-design/icons`. Never barrel-import.

```ts
// ✅ Good
import { Button, Table } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

// ❌ Avoid
import Button from 'antd/lib/button';
import * as Icons from '@ant-design/icons';
```

### 4. Vite `manualChunks` for stable vendor caching
- Split `react`, `antd`, `@tanstack/*` into separate vendor chunks so app updates don't
  invalidate vendor caches.

```ts
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom'],
        'vendor-antd': ['antd', '@ant-design/icons'],
        'vendor-tanstack': ['@tanstack/react-query', '@tanstack/react-router'],
      },
    },
  },
},
```

### 5. Memoize only when measured or required
- `React.memo`, `useMemo`, `useCallback` are allowed when **either**:
  - The React Profiler shows a real, repeated cost; or
  - The value is a dependency of another memoized hook (`useMemo` / `useCallback` /
    `useEffect` deps) and changes identity every render.
- No prophylactic memoization. A `useMemo` around a primitive is forbidden.

```tsx
// ✅ Good — stable reference for a dep
const filters = useMemo(() => ({ role, q }), [role, q]);
const query = useUsersQuery(filters);

// ❌ Avoid — wrapping a primitive
const total = useMemo(() => price + tax, [price, tax]); // just compute inline
```

### 6. Virtualize lists over ~200 rows
- Use `react-virtuoso` for arbitrary lists.
- Use AntD `Table` with the `virtual` prop for tables.
- Smaller lists do not need virtualization.

### 7. TanStack Query — use `select` and `keepPreviousData`
- Derive shapes via `select` (avoids re-renders when unrelated fields change).
- Paginated queries: `placeholderData: keepPreviousData` so the table doesn't flicker
  between pages.

```ts
useUsersQuery({
  select: (data) => data.items.map((u) => ({ id: u.id, label: u.name })),
  placeholderData: keepPreviousData,
});
```

### 8. Images — explicit dimensions and lazy loading
- Always set `width` and `height` (or aspect-ratio CSS) to prevent CLS.
- Below-the-fold images: `loading="lazy"`. Above-the-fold hero images: no `lazy`,
  consider preloading.
- Prefer modern formats (`.webp`, `.avif`) with a `<picture>` fallback when supporting
  legacy browsers.

```tsx
<img src="/avatar.webp" width={48} height={48} loading="lazy" alt="" />
```

### 9. Stable list keys
- `key` must be a stable identifier from the data (`user.id`). Never `key={index}` on
  lists that can reorder, filter, or have items inserted/removed.

### 10. Avoid heavy work in render
- Sort, group, and aggregate inside `useMemo` (when justified by rule 5) or in a
  `select` projection on the query — never inline in the JSX of a frequently-rendered
  component.

### 11. Suspense boundaries align with route boundaries
- Don't introduce nested `<Suspense>` inside a route. The route's `pendingComponent`
  (see `routing.md`) is the suspense boundary.

### 12. Measure before optimizing
- Performance work that doesn't cite a profiler trace, a Lighthouse score, or a
  `size-limit` regression is not allowed. "It feels slow" is not enough.

## Anti-patterns
- `useMemo` / `useCallback` around primitives or single-call factories.
- `React.memo` applied to every component "just in case".
- Whole-barrel icon imports: `import { ... } from '@ant-design/icons'` of more than
  ~10 icons in one file (split or import individually).
- `antd/lib/...` or `antd/es/...` deep imports.
- `key={index}` on volatile lists.
- Inline image dimensions left unset.
- Manual `React.lazy` inside a route that is already route-level lazy.
- Sorting / filtering large arrays inline in render.
- Re-enabling `refetchOnWindowFocus: true` globally without a measured reason.

## Cross-refs
- Route-level lazy + chunk strategy origin: `routing.md`.
- Query `select` and pagination: `data-fetching.md`.
- AntD component imports overlap: `styling-tailwind-antd.md`.
