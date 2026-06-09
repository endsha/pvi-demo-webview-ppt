# Data Fetching (TanStack Query)

<!-- last-reviewed: 2026-05-10 -->

## Scope
TanStack Query conventions: query keys, hook organisation, mutations, invalidation,
optimistic updates, error handling, defaults. All server data flows through this rule.

## Stack assumptions
React 18+, `@tanstack/react-query` 5+, TypeScript strict. Single `QueryClient` instance
mounted once at app root.

## Rules

### 1. One `QueryClient` at the root
```tsx
// src/main.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
});

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### 2. Query-key factory per domain — never inline keys
- One `<domain>-keys.ts` per resource. Hooks and mutations both import from it.

```ts
// src/api/users/user-keys.ts
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};
```

- ❌ Do not write `useQuery({ queryKey: ['users', id], ... })` in a component or hook.

### 3. One `useXxxQuery` hook per resource — components never call `useQuery`
- Hooks live in `src/api/<domain>/use-<resource>-query.ts`.
- Components consume hooks; they do not see `useQuery` directly.

```ts
// src/api/users/use-user-query.ts
export function useUserQuery(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => api.getUser(id),
    staleTime: 5 * 60_000, // detail default
  });
}
```

### 4. Mutations invalidate via the factory
- Mutation hooks live in `use-<verb>-<resource>-mutation.ts`.
- Always invalidate using the same factory the queries use.

```ts
export function useUpdateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateUserInput) => api.updateUser(input),
    onSuccess: (_, input) => {
      qc.invalidateQueries({ queryKey: userKeys.detail(input.id) });
      qc.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
```

### 5. `staleTime` defaults
- Lists: `30_000` (30s).
- Details: `5 * 60_000` (5m).
- Reference / lookup data (countries, roles): `Infinity` with manual invalidation.
- Override per resource only when the product requires it; document why in a comment.

### 6. Optimistic updates only when rollback is safe
- Use `onMutate` + `onError` rollback pattern. If you cannot describe the rollback in one line, do a pessimistic mutation instead.

```ts
onMutate: async (next) => {
  await qc.cancelQueries({ queryKey: userKeys.detail(next.id) });
  const previous = qc.getQueryData(userKeys.detail(next.id));
  qc.setQueryData(userKeys.detail(next.id), next);
  return { previous };
},
onError: (_e, next, ctx) => {
  qc.setQueryData(userKeys.detail(next.id), ctx?.previous);
},
onSettled: (_d, _e, next) => {
  qc.invalidateQueries({ queryKey: userKeys.detail(next.id) });
},
```

### 7. Error UX: route-level boundary + inline status
- Fatal errors (auth failure, 5xx, network down) → caught by the route's `errorComponent` (see `routing.md`).
- Recoverable errors (validation, 404 on a single record) → render inline using `query.error` / `query.isError`.
- Configure queries with `throwOnError: (error) => error.status >= 500` to route fatals upward.

### 8. Pagination & infinite lists
- Paginated lists: `placeholderData: keepPreviousData` so the UI doesn't flicker between pages.
- Infinite lists: `useInfiniteQuery` with a `getNextPageParam` derived from the response cursor — never compute pages on the client.

### 9. Derive shapes with `select`, not in components
- `select` runs only when the underlying data changes — fewer re-renders than mapping in render.

```ts
const userNames = useUsersQuery({
  select: (data) => data.map((u) => u.name),
});
```

### 10. Mutations are owned by the screen-level container
- Form submit, button click → call `mutation.mutate(...)` from the container component (see `react-component-patterns.md`).
- Presentational components receive `onSubmit` as a prop; they don't import mutation hooks.

## Anti-patterns
- Inline `queryKey: ['users', id]` in a component.
- `useQuery` called directly from a presentational component.
- Manual `qc.setQueryData` outside a mutation's `onMutate` / `onSuccess` / `onError`.
- Storing query results in Zustand or `useState` "for caching."
- Fetching inside `useEffect` instead of `useQuery`.
- `refetchOnWindowFocus: true` re-enabled per-query without a documented reason.
- Mutation success handlers that invalidate `userKeys.all` "to be safe" — be specific.

## Cross-refs
- Where state lives: `state-management.md`.
- Containers vs presentational: `react-component-patterns.md`.
- Route loaders preloading queries: `routing.md`.
- Form submit → mutation wiring: `forms-validation.md`.
