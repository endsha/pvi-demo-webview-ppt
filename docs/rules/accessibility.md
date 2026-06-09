# Accessibility (WCAG 2.1 AA)

<!-- last-reviewed: 2026-05-10 -->

## Scope
Baseline a11y requirements for an AntD-heavy SPA: semantics, AntD-specific caveats,
focus management, contrast, and CI gating. Excludes general styling — see
`styling-tailwind-antd.md`.

## Stack assumptions
React 18+, AntD 5+, TypeScript strict. Target: WCAG 2.1 Level AA.
Automated checks via `axe-core` and `pa11y-ci` in CI.

## Rules

### 1. Semantic HTML first
- Use the right tag. Reach for ARIA only when no semantic element fits.

```tsx
// ✅ Good
<button onClick={onSave}>Save</button>
<nav><ul>...</ul></nav>

// ❌ Avoid
<div role="button" tabIndex={0} onClick={onSave}>Save</div>
```

- `<a>` for navigation (changes URL). `<button>` for actions (no URL change).

### 2. Every interactive element has an accessible name
- Visible text counts. Otherwise: `aria-label`, `aria-labelledby`, or a visually-hidden
  label. AntD `Tooltip` content does **not** count as an accessible name.
- Icon-only buttons must have `aria-label`:

```tsx
<Button icon={<DeleteOutlined />} aria-label="Delete user" onClick={onDelete} />
```

### 3. AntD caveats — must handle

#### `Modal` / `Drawer`
- Pass a string `title` (becomes the dialog's accessible name) **or** set
  `aria={{ labelledby: 'my-id' }}` and put the heading element with `id="my-id"` inside.
- Verify focus moves to the dialog on open and returns to the opener on close
  (default behaviour — confirm with keyboard test).

#### `Select` / `AutoComplete` / `TreeSelect`
- When there is no visible label, set `aria-label` on the component.
- Keyboard test: Tab to focus, ↓ opens, ↑/↓ navigate, Enter selects, Esc closes.

#### `Tooltip`
- Never the only affordance for an action. The tooltip target must also have visible
  text or `aria-label`. Tooltips are inaccessible to keyboard-only users on touch
  devices.

#### `Table`
- `rowKey` is required (already a hard rule for React keys; doubly important here).
- Sortable columns: ensure each sortable header element has `aria-sort` (`ascending`,
  `descending`, or `none`). AntD sets this when `sorter` is configured — verify.
- Provide a `caption` or use the `title` prop so screen readers can announce the table.

#### `Tabs`
- AntD applies `role="tablist"` / `role="tab"` correctly. Do not override `role` on
  custom tab content.

#### `Notification` / `message`
- These are transient. For state changes that must be announced (form submit success,
  validation errors), also update a visible region near the action — do not rely on
  toast announcements alone.

### 4. Forms — every field has a label
- Every `Form.Item` has a `label`. If the design hides the label, use AntD's
  `colon={false}` and a visually-hidden label, **not** placeholder-as-label.
- Required fields: `required` on `Form.Item` (renders the asterisk and sets ARIA).
- Error messages from `zodFormRules` are wired automatically via AntD; do not duplicate
  with `aria-invalid` by hand.

### 5. Focus management on route change
- On navigation, focus moves to the page's `<h1>`. Implement once in the layout's
  `useEffect(() => h1Ref.current?.focus(), [location.pathname])` with `tabIndex={-1}` on
  the heading.
- After deleting the focused element, move focus to a stable anchor (the parent list,
  the toolbar) — never let focus fall to `<body>`.

### 6. Heading hierarchy
- One `<h1>` per page. Do not skip levels (`h2 → h4`). AntD `Typography.Title level={n}`
  renders the corresponding tag — pick `level` deliberately.

### 7. Colour contrast — 4.5:1 body, 3:1 large/UI
- Theme tokens in `<ConfigProvider>` (see `styling-tailwind-antd.md`) must hit:
  - Body text: 4.5:1 against background.
  - Large text (≥18pt or ≥14pt bold) and UI components: 3:1.
- Verify with the Stark / WAVE / axe DevTools extension on every new colour.
- Never rely on colour alone to convey state — pair with icon, text, or pattern.

### 8. Keyboard reachability — PR gate
- Every interactive element is reachable via Tab in visual order.
- `Esc` closes any open modal, drawer, popover, or dropdown.
- Custom keyboard shortcuts: register on the document, unregister on unmount,
  document them visibly (a help drawer or `?` overlay).

### 9. Don't break focus indicators
- Keep AntD's default focus ring. If you must restyle, replace it — do not remove it.

```css
/* ✅ acceptable replacement */
:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

/* ❌ never */
:focus { outline: none; }
```

### 10. CI checks — required
- `axe-core` (via `@axe-core/playwright` if Storybook is in use, otherwise via
  `vitest` + `jest-axe` on component tests) runs on every PR.
- `pa11y-ci` runs against built routes (smoke level: home, login, one detail, one form).
- Failures block merge. Manual keyboard test required for any PR touching UI.
- Tools above are the recommended baseline; swap-equivalents allowed if equivalent
  coverage is documented in the PR.

## Anti-patterns
- `tabIndex` greater than 0 (it disrupts natural Tab order).
- `onClick` on `<div>` / `<span>` without role + keyboard handlers — use `<button>`.
- `aria-hidden="true"` on a focusable element.
- Removing the focus ring without a replacement.
- Placeholder used as a substitute for a label.
- `Tooltip` as the only label or affordance.
- Colour alone signalling success / error (red / green only, no icon or text).
- `role="presentation"` on interactive elements.

## Cross-refs
- Theme tokens that drive contrast: `styling-tailwind-antd.md`.
- Form labels and required-field semantics: `forms-validation.md`.
- Route change focus management: `routing.md`.
