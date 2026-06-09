# React Component Patterns

<!-- last-reviewed: 2026-05-10 -->

## Scope
Component shape, props, hooks usage, and file colocation for the Vite + React SPA.
Excludes styling (see `styling-tailwind-antd.md`) and data fetching (see `data-fetching.md`).

## Stack assumptions
Vite + React 18+, TypeScript strict, path alias `@/* → src/*`.
Error boundaries via `react-error-boundary` (no class components).

## Glossary
- **Screen-level container**: the top component a route renders (e.g., `UserEditPage`).
  It owns query/mutation hooks, the AntD `Form` instance, and submit handlers, and
  passes data + callbacks down to presentational children.
- **Presentational component**: receives props in, fires events out. No query hooks,
  no mutation hooks, no `Form.useForm()`.

## Rules

### 1. Function components only
- Class components are forbidden — including for error boundaries (use `react-error-boundary`).

```tsx
// ✅ Good
export default function UserCard({ user }: Props) {
  return <div>{user.name}</div>;
}

// ❌ Avoid
class UserCard extends React.Component { ... }
```

### 2. Type props with an `interface Props` — never `React.FC`
- One `Props` interface per component, declared above the component.
- Do not use `React.FC` / `React.FunctionComponent` (implicit `children`, awkward generics).

```tsx
// ✅ Good
interface Props {
  userId: string;
  onSelect?: (id: string) => void;
  children?: React.ReactNode;
}
export default function UserCard({ userId, onSelect, children }: Props) { ... }

// ❌ Avoid
const UserCard: React.FC<{ userId: string }> = ({ userId }) => { ... };
```

### 3. Default-export the component, named-export everything else
- Per `import-rules.md`, components default-export. Hooks, helpers, types: named exports.

```tsx
// UserCard/UserCard.tsx
export interface UserCardProps { ... }   // named
export default function UserCard(...) { ... }   // default
```

### 4. Container / presentational split when component grows
- If a component both fetches data and renders UI **and** exceeds ~30 lines, split:
  - `UserCard.tsx` — presentational, props in / events out, no hooks beyond local UI state.
  - `UserCardContainer.tsx` — calls `useUserQuery`, owns mutations, renders `<UserCard {...} />`.
- Below the threshold, one file is fine. Don't split prophylactically.

### 5. Hooks rules
- Custom hooks live in their own file, prefixed `use`, kebab-cased: `use-user-card.ts`.
- One custom hook per file.
- Never call hooks conditionally or inside loops. ESLint `react-hooks/rules-of-hooks` must stay on.
- A hook returns either a single value, a tuple `[state, setState]`, or an object — pick one and stay consistent within a hook family.

```ts
// ✅ Good — src/components/UserCard/use-user-card.ts
export function useUserCard(userId: string) {
  const query = useUserQuery(userId);
  return { user: query.data, isLoading: query.isLoading };
}
```

### 6. File colocation
- One folder per component. Tests, styles, and component-local hooks live next to the component.

```
src/components/UserCard/
  UserCard.tsx
  UserCard.spec.tsx
  use-user-card.ts
  index.ts          # re-exports default + types only
```

- `index.ts` re-exports the default and any public types — nothing else. No deep barrels above the component folder.

### 7. No prop-drilling beyond two levels
- If a prop must be threaded through more than two intermediate components, escalate:
  - Cross-screen UI state → Zustand store (see `state-management.md`).
  - Server data → call the query hook at the consumer (see `data-fetching.md`).
  - Tightly-scoped tree (e.g., a wizard) → React `Context` provider colocated with the tree.

### 8. Event handler props use `onX` naming
- Props that fire events: `onSelect`, `onSubmit`, `onClose`. Never `handleSelect` (that's the local handler name).
- Internal handlers: `handleSelect`. Pass `onSelect={handleSelect}`.

### 9. No side effects in render
- `useEffect` is for syncing with external systems (subscriptions, focus management). Never for fetching data — use TanStack Query.
- `setState` inside render is forbidden. Derive from props/state via `useMemo` or compute inline.

### 10. `children` over render props
- Prefer composition via `children` and slot props (`header`, `footer`).
- Render props (`render={(x) => ...}`) only when polymorphism over a non-trivial shape is needed.

## Anti-patterns
- `React.FC` / `React.FunctionComponent`.
- `any` in `Props` — use `unknown` or a proper type.
- Default-exporting hooks or utilities.
- Multiple components in one file (except trivial sub-components used only by the parent).
- Fetching data in `useEffect` instead of `useQuery`.
- `useState` for state shared across siblings — escalate to Zustand or lift to nearest common parent.
- `key={index}` on lists where items can be reordered or removed.

## Cross-refs
- Hooks-as-state-source decisions: `state-management.md`.
- Query hooks called by containers: `data-fetching.md`.
- Naming of files inside the component folder: `naming-convention.md`.
