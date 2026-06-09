# Styling — Tailwind + Ant Design

<!-- last-reviewed: 2026-05-10 -->

## Scope
Division of labour between Tailwind CSS and Ant Design. Theme tokens, the `cn()` helper,
and what's banned. Excludes component composition (see `react-component-patterns.md`).

## Stack assumptions
Tailwind CSS (latest) + Ant Design 5+ (latest). One `<ConfigProvider>` mounted at app root.
No CSS-in-JS, no styled-components, no `*.module.css`.

## Rules

### 1. Division of labour — strict
- **Tailwind owns**: layout, spacing, flex/grid, responsive breakpoints, typography on
  non-AntD elements, one-off color/border on raw HTML (`<div>`, `<section>`, `<h1>`).
- **AntD owns**: every interactive component — `Button`, `Input`, `Select`, `Table`,
  `Modal`, `Drawer`, `Menu`, `Tabs`, `Form`, `Tooltip`, `DatePicker`, `Upload`, etc.
- Do not reimplement an AntD component in Tailwind. If AntD has it, use it.
- Do not use Tailwind for things AntD already styles (button colors, input borders).

```tsx
// ✅ Good — Tailwind for layout, AntD for the component
<div className="flex items-center gap-4 p-6">
  <Button type="primary" onClick={onSave}>Save</Button>
  <Button onClick={onCancel}>Cancel</Button>
</div>

// ❌ Avoid — Tailwind reimplementing a button
<button className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
```

### 2. `<ConfigProvider>` is the single source of theme truth
- Mount once at the app root. All AntD components inherit tokens from here.

```tsx
// src/app/theme.ts
export const themeTokens = {
  colorPrimary: '#1677ff',
  colorSuccess: '#52c41a',
  colorError: '#ff4d4f',
  borderRadius: 6,
  fontFamily: 'Inter, system-ui, sans-serif',
} as const;

// src/main.tsx
<ConfigProvider theme={{ token: themeTokens }}>
  <App />
</ConfigProvider>
```

### 3. Tailwind theme mirrors AntD tokens — single source file
- `tailwind.config.ts` reads from the same `themeTokens` constants. Do not duplicate values.

```ts
// tailwind.config.ts
import { themeTokens } from './src/app/theme';

export default {
  theme: {
    extend: {
      colors: {
        primary: themeTokens.colorPrimary,
        success: themeTokens.colorSuccess,
        error: themeTokens.colorError,
      },
      borderRadius: { DEFAULT: `${themeTokens.borderRadius}px` },
      fontFamily: { sans: themeTokens.fontFamily.split(',').map((s) => s.trim()) },
    },
  },
};
```

### 4. Customise AntD via `ConfigProvider`, never via class overrides
- Component-specific tweaks: `<ConfigProvider theme={{ components: { Button: { ... } } }}>`.
- Per-instance customisation: use the AntD `classNames` and `styles` props (v5).
- Never target AntD internal class names (`.ant-btn-primary`) from Tailwind or global CSS.

```tsx
// ✅ Good — official customisation API
<Button classNames={{ icon: 'mr-2' }} styles={{ icon: { color: 'white' } }}>Save</Button>

// ❌ Avoid — overriding AntD internals
<Button className="!bg-red-500 [&>.ant-btn-icon]:text-white">Save</Button>
```

### 5. Use `cn()` for conditional classes
- One helper at `src/utils/cn.ts`. Combines `clsx` and `tailwind-merge` so later utilities
  override earlier ones predictably.

```ts
// src/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```tsx
<div className={cn('p-4', isActive && 'bg-primary text-white', className)}>...</div>
```

### 6. No CSS-in-JS, no `styled-components`, no `*.module.css`
- AntD already handles style scoping. Tailwind covers everything else.
- Global styles allowed only in `src/app/globals.css` for: Tailwind directives, font-face,
  CSS variables, and resets. Nothing component-specific.

### 7. Responsive: Tailwind breakpoints, not AntD `Grid`
- For layout, use Tailwind utilities (`md:flex-row`, `lg:grid-cols-3`).
- AntD `Row`/`Col` is allowed inside AntD-native layouts (e.g., `Form` grid), but not as
  a general-purpose layout primitive.

### 8. Class ordering
- Order: layout → spacing → sizing → typography → color → state (`hover:`, `focus:`) → responsive (`md:`, `lg:`).
- Use the official Tailwind Prettier plugin (`prettier-plugin-tailwindcss`) — do not hand-order.

### 9. Dark mode via AntD algorithm
- Toggle via `<ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>`.
- Tailwind's `dark:` variant is allowed for Tailwind-styled raw HTML, but AntD components
  follow the algorithm — do not use `dark:` to restyle AntD internals.

## Anti-patterns
- `!important` (`!bg-red-500`) to win against AntD specificity.
- Selectors targeting AntD internals: `.ant-*`, `[&>.ant-...]`, `:global(.ant-...)`.
- Reinventing AntD components in Tailwind (custom dropdown, custom modal).
- Duplicating color/spacing values between `themeTokens` and `tailwind.config.ts`.
- `*.module.css`, `styled-components`, Emotion, `css` prop.
- Inline `style={{ ... }}` for anything except dynamic geometry (`width: ${pct}%`).
- Conditional class strings concatenated by hand instead of `cn()`.

## Cross-refs
- Where styled markup lives: `react-component-patterns.md`.
- Accessibility implications of theming (contrast): `accessibility.md`.
- Bundle impact of icon and component imports: `performance.md`.
