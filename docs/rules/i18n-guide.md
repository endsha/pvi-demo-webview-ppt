# i18n Guide

<!-- last-reviewed: 2026-04-14 -->

> Rule: **every user-perceivable string must be wrapped in `t()`** — JSX text, `aria-label`, `title`, `alt`, `placeholder` attributes included.

---

## 1. Namespace Ownership

| Namespace | Owner scope |
|-----------|-------------|
| `common` | Shared across pages: status labels, dialog buttons, actions, placeholders |
| `navigation` | App shell: sidebar labels, theme toggle, brand name, collapse/expand |
| `settings` | Settings section nav labels + all settings page strings |
| `orders` | Order list + detail page strings |
| `customers` | Customer pages |
| `quotations` | Quotation wizard + list |
| `auth` | Login / change-password pages |
| `dashboard` | Dashboard widgets |
| `profile` | User profile page |
| `documents` | Document management page |
| `reports` | Reports page |
| `audit-log` | Audit log page |
| `notifications` | Notification popover |

Config: `apps/frontend/src/lib/i18n.ts`

---

## 2. Adding a New Key

1. Add the key to **both** `apps/frontend/src/locales/en/<namespace>.json` **and** `apps/frontend/src/locales/vi/<namespace>.json` in the same commit.
2. Use the key in the component:

```tsx
const { t } = useTranslation('orders');
<h1>{t('detail.heading')}</h1>
```

3. For strings that span multiple namespaces in one component:

```tsx
const { t }    = useTranslation('settings');
const { t: tNav } = useTranslation('navigation');

<button aria-label={tNav('sidebar.collapse')} />
```

4. Verify parity locally:

```bash
node scripts/i18n_parity_check.mjs
```

---

## 3. `aria-label` / `placeholder` Convention

These attributes are always user-perceivable (screen readers + visible input hints). They **must** route through `t()`:

```tsx
// ✅ correct
<button aria-label={t('theme.switch_dark')} />
<Input placeholder={tCommon('placeholder.phone_example')} />

// ❌ wrong — will trigger ESLint warning
<button aria-label="Switch to dark mode" />
<Input placeholder="0912345678" />
```

---

## 4. Guardrails

### ESLint rule

`i18next/no-literal-string` is configured in `apps/frontend/eslint.config.js` at `'warn'` severity.  
IDE tooltips will highlight violations immediately.

To run a strict zero-warning check locally (same as CI):

```bash
pnpm --filter frontend lint:i18n
```

Upgrade path: once all pre-existing violations in `OrderInfoPanel.tsx` are cleaned up, change the rule severity to `'error'` in `eslint.config.js`.

### Locale parity check (CI hard gate)

Every PR that modifies locale files must pass:

```bash
node scripts/i18n_parity_check.mjs
```

This script diffs flattened key sets between `en/` and `vi/` for every namespace and exits 1 on any mismatch. It runs automatically in `.github/workflows/ci-lint.yml`.

---

## 5. Dev Console

The app logs missing keys in development:

```
[i18n] Missing key: orders:detail.heading
```

Open DevTools → Console → filter by `[i18n]` while browsing to surface any gaps.
