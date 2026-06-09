# State Management

<!-- last-reviewed: 2026-05-10 -->

## Scope
Where each piece of state belongs: `useState` vs Zustand vs TanStack Query vs AntD `Form`.
Zustand store shape, selectors, and persistence. Excludes server-cache mechanics — see `data-fetching.md`.

## Stack assumptions
React 18+, Zustand 4+, TanStack Query 5+, AntD 5+ (`Form`). TypeScript strict.

## Rules

### 1. Decision tree — pick the right tool first

| State kind | Tool |
|---|---|
| Server data (anything fetched from the API) | TanStack Query |
| Form fields & validation | AntD `Form` (see `forms-validation.md`) |
| Ephemeral UI state owned by one component (open/closed, hover, input draft) | `useState` / `useReducer` |
| UI state shared across components or screens (theme, sidebar, current org, auth user) | Zustand |
| "What is the user looking at" (filters, page, selected id) | URL search params (see `routing.md`) |

If unsure, escalate one row at a time — never start with Zustand.

### 2. One Zustand store per domain
- File: `src/stores/<domain>-store.ts`. One store per file.
- Domains are bounded by purpose, not by feature: `auth-store`, `ui-store`, `notification-store`. Never `app-store` (mega-store).

```ts
// src/stores/auth-store.ts
import { create } from 'zustand';

interface AuthState {
  user: { id: string; email: string } | null;
  setUser: (user: AuthState['user']) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  signOut: () => set({ user: null }),
}));
```

### 3. Selector-only reads — never read the whole store
- Subscribing to the whole store re-renders on every change.

```ts
// ✅ Good
const user = useAuthStore((s) => s.user);

// ❌ Avoid
const { user } = useAuthStore();
```

- For multi-field reads, use `useShallow` to avoid unnecessary re-renders:

```ts
import { useShallow } from 'zustand/react/shallow';
const { user, signOut } = useAuthStore(useShallow((s) => ({ user: s.user, signOut: s.signOut })));
```

### 4. Actions live inside the store
- No external "action creators" or thunks. Actions are methods on the state object.
- Mutations to server data go through TanStack Query mutations, not store actions.

```ts
// ✅ Good — action inside the store
signOut: () => set({ user: null }),

// ❌ Avoid — Redux-style external action
export const signOut = () => useAuthStore.setState({ user: null });
```

### 5. No derived state inside stores
- Compute derived values in selectors at the call site.

```ts
// ✅ Good
const isSignedIn = useAuthStore((s) => s.user !== null);

// ❌ Avoid — derived field stored alongside source
{ user: null, isSignedIn: false, setUser: ... }
```

### 6. Persistence: explicit `partialize` whitelist
- When using `persist`, list exactly which keys to persist. Never persist by omission.

```ts
import { persist } from 'zustand/middleware';

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarOpen: true,
      lastRoute: '/',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-store',
      partialize: (s) => ({ theme: s.theme }), // only theme persists
    },
  ),
);
```

- Do not persist auth tokens, server data, or anything containing PII without an explicit security review.

### 7. Never store server data in Zustand
- The TanStack Query cache is the single source of truth for server data. Copying it into Zustand creates two sources that drift.
- If a component needs server data, call the query hook directly. If "the same data must be visible somewhere far away," that's still a query hook call, not a store mirror.

### 8. Never use `useState` for state shared across siblings
- If two sibling components need the same value, lift to the nearest common parent **or** put it in Zustand. Don't duplicate `useState` and sync via callbacks.

## Anti-patterns
- A single `useAppStore` holding everything.
- Reading the whole store: `useStore()` with no selector.
- Storing fetched API data in Zustand "for caching."
- `partialize` returning the whole state, or `persist` with no `partialize` at all.
- Action creators / thunks living outside the store.
- `useState` for cross-component or cross-screen state.
- Computing derived values inside the store and storing them as fields.

## Cross-refs
- Server state: `data-fetching.md`.
- Form state: `forms-validation.md`.
- URL-as-state: `routing.md`.
