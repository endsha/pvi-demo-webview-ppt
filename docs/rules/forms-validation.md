# Forms & Validation

<!-- last-reviewed: 2026-05-10 -->

## Scope
Form construction, validation, submit, and error mapping. AntD `Form` is the form engine,
Zod is the schema source of truth. Schemas are shared with backend DTOs.

## Stack assumptions
AntD 5+ `Form`, Zod 3+, TanStack Query 5+ for submit mutations.
Zod schemas live in `src/schemas/<domain>.ts` and are imported by both FE and BE
(via path alias or workspace package).

## Rules

### 1. Zod is the source of truth — AntD rules are derived
- Define every form's shape and validation in a Zod schema. Never hand-write AntD `rules`
  next to a schema that already covers the field.

```ts
// src/schemas/user-schema.ts — shared with backend
import { z } from 'zod';

export const userInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(80),
  role: z.enum(['admin', 'member']),
});
export type UserInput = z.infer<typeof userInputSchema>;
```

### 2. One adapter — `zodFormRules` — generates AntD rules from Zod
- Place at `src/forms/zod-form-rules.ts`. Every form imports it. Do not roll your own per form.

```ts
// src/forms/zod-form-rules.ts
import type { Rule } from 'antd/es/form';
import type { ZodTypeAny } from 'zod';

export function zodFormRules<T extends ZodTypeAny>(field: T): Rule[] {
  return [{
    validator: async (_, value) => {
      const result = field.safeParse(value);
      if (!result.success) throw new Error(result.error.issues[0]?.message);
    },
  }];
}
```

```tsx
<Form.Item name="email" label="Email" rules={zodFormRules(userInputSchema.shape.email)}>
  <Input />
</Form.Item>
```

### 3. `Form.useForm()` lives in the screen-level container
- The container owns the form instance, mutation, and submit handler.
- Presentational form components receive props (`form`, `onSubmit`) — they don't call
  `useForm` themselves.

```tsx
// UserEditPage.tsx — container
const [form] = Form.useForm<UserInput>();
const mutation = useUpdateUserMutation();

const handleSubmit = async (values: UserInput) => {
  const parsed = userInputSchema.parse(values);
  mutation.mutate(parsed, {
    onError: (err) => mapServerErrorsToForm(err, form),
  });
};

return <UserForm form={form} onSubmit={handleSubmit} loading={mutation.isPending} />;
```

### 4. Submit goes through a TanStack Query mutation
- Never `fetch` from inside the form. Every submit is `mutation.mutate(values)`.
- See `data-fetching.md` for mutation hook conventions.

### 5. Server-side field errors map back via `form.setFields`

The shared `ApiError` type (defined once at `src/api/api-error.ts`) carries optional
per-field errors:

```ts
// src/api/api-error.ts
export interface ApiError extends Error {
  status: number;
  fields?: Record<string, string[]>; // field name → list of messages
}
```

- Field-level errors (e.g., 422 with per-field messages) attach to the corresponding
  `Form.Item`. Do not show them as a global `message.error`.

```ts
function mapServerErrorsToForm(err: ApiError, form: FormInstance) {
  if (err.status === 422 && err.fields) {
    form.setFields(
      Object.entries(err.fields).map(([name, errors]) => ({ name, errors })),
    );
    return;
  }
  // unexpected → let route errorComponent handle
  throw err;
}
```

- Global failures (500, network) → re-throw so the route's `errorComponent` catches them.

### 6. File uploads go through `Upload` + `customRequest` + a mutation
- Never use a raw `<input type="file">`.
- `customRequest` calls a dedicated `useUploadXxxMutation` so progress, retry, and
  cancellation are uniform.

```tsx
<Upload
  customRequest={({ file, onProgress, onSuccess, onError }) => {
    upload.mutate(
      { file: file as File, onProgress: (p) => onProgress?.({ percent: p }) },
      { onSuccess: (data) => onSuccess?.(data), onError: (err) => onError?.(err as Error) },
    );
  }}
/>
```

### 7. No `react-hook-form` mixed with AntD `Form`
- Pick one. In this project: AntD `Form`. Do not introduce `react-hook-form`,
  `<Controller>`, or `useFormContext` from RHF.

### 8. Field-level vs form-level validation
- Per-field rules: derived from Zod via `zodFormRules`.
- Cross-field rules (e.g., `endDate >= startDate`): Zod `.superRefine` on the schema, run
  via `userInputSchema.parse(values)` inside the submit handler. Surface failures with
  `form.setFields`.
- Do not duplicate cross-field logic as inline AntD validators.

### 9. Initial values are typed
- `Form.useForm<UserInput>()` so `initialValues`, `getFieldsValue()`, and `onFinish` are
  typed end-to-end. No `any` on form generics.

### 10. Disable submit while pending
- Bind submit button `loading={mutation.isPending}` and `disabled={mutation.isPending}`.
  Optionally `<Form disabled={mutation.isPending}>` to lock the whole form.

## Anti-patterns
- Inline `rules={[{ required: true, message: '...' }]}` on a field whose Zod schema
  already covers it.
- Parsing Zod errors by hand inside `onFinish` instead of `zodFormRules` / `setFields`.
- `react-hook-form` anywhere in the codebase.
- A `Form.useForm()` call inside a presentational component.
- Showing field-level server errors via `message.error` (global toast).
- Raw `<input type="file">` or third-party uploaders.
- `any` on `Form.useForm` or `onFinish`.

## Shared identity rules — `src/schemas/identity-rules.ts`

Phone, email, CCCD, passport, and tax code validation are **defined once** and reused
across every schema (customer, product, user, staff). Do NOT redeclare regex or zod
fields inline.

```ts
import {
  phoneRule, phoneRuleOptional,
  emailRule, emailRuleOptional,
  cccdRule, passportRule, taxCodeRule, taxCodeRuleOptional,
  PHONE_RE, CCCD_RE, PASSPORT_RE, TAX_CODE_RE,
  normalizePhone, formatTaxCode,
  validateIdNumber,
} from '@/schemas/identity-rules';
```

### Canonical formats

| Field | Regex | Notes |
|---|---|---|
| Phone | `/^(0|\+84)\d{9,10}$/` | Strict canonical. `0` or `+84` prefix + 9–10 digits (9 = mobile, 10 = landline). Dashes/spaces NOT accepted — call `normalizePhone()` first. |
| CCCD | `/^(\d{9}|\d{12})$/` | 9 = legacy CMND, 12 = new CCCD. |
| Passport | `/^[A-Z0-9]{6,12}$/i` | Alphanumeric, 6–12 chars. |
| Tax code | `/^(\d{10}|\d{12}|\d{13})$/` | 10 = parent, 13 = branch (with hyphen displayed via `TAX_CODE_DISPLAY_RE`). |

### Phone normalization — always normalize at API boundaries

The PHONE_RE only accepts clean digits. The rule's `.refine()` strips separators
before testing — so users can paste `+84-902-000-004`. But the **form value stays raw**.
Storage and BE must always see canonical clean digits. Normalize at every boundary:

| Direction | Where | Function |
|---|---|---|
| FE → BE (write) | `buildAddCustomerPayload`, `toCreatePayload`, `toUpdatePayload`, `searchCustomersApi` arg | `normalizePhone(value)` |
| BE → FE (read) | `mapDetail`, search list mapping, `toOrder` customer block | `normalizePhone(dto.phone ?? '')` |

Skipping a boundary means a mixed form with `+84-902-…` and `+84902…` rows that
won't compare equal — see `use-product-order-flow.ts` `CUSTOMER_PHONE_TAKEN`
recovery for what breaks.

### Tax code auto-format

`formatTaxCode(raw)` strips non-digits, caps at 13, inserts hyphen after position 10.
Used inline in customer forms (onChange) so user typing `0123456789001` shows as
`0123456789-001`. Validation uses `TAX_CODE_DISPLAY_RE` (with optional hyphen).

### ID number — runtime helper

`validateIdNumber(idType, idNumber)` returns an error message or null. Use in AntD
`Form.Item` validators when `idType` is a sibling field — zod can't easily branch on
a sibling, so this runtime helper covers `cccd / passport / tax_code / business_license`
inside the form rule.

---

## License plate validation — `src/api/products/license-plate/`

For TNDS car + vehicle-damage (NOT motorbike — gỡ theo BA decision). On plate Input
blur, call `POST /license-plate-validations` to detect duplicate. BE returns
`{ valid, reason }` — **`valid: false` means block** (duplicate/rejected).

```ts
import { useLicensePlateValidation } from '@/api/products/license-plate';

const validatePlate = useLicensePlateValidation();
const [plateValid, setPlateValid] = useState(true);

const onPlateBlur = (e) => {
  const value = e.target.value.trim();
  // Skip empty + skip when re-opened value is unchanged (BE would flag the policy against itself).
  if (!value || value === prefillOrder?.vehicle?.licenseNumber?.trim()) {
    setPlateValid(true);
    return;
  }
  validatePlate.mutate(value, {
    onSuccess: (result) => {
      form.setFields([{
        name: 'plateNumber',
        errors: result.valid ? [] : [t('products.errors.licensePlateTaken')],
      }]);
      setPlateValid(result.valid);
    },
  });
};

// On the form's Next button:
<Button disabled={!plateValid /* + other gating */} onClick={...}>Tiếp theo</Button>
```

**Don't** call the API on every keystroke; onBlur is the only trigger. **Don't** apply
to motorbike — BA decided motorbike plates aren't checked.

---

## Cross-refs
- Mutation hook conventions: `data-fetching.md`.
- Container vs presentational: `react-component-patterns.md`.
- Form labels and a11y: `accessibility.md`.
- Product page flow + license-plate UI wiring: `product-page-flow.md`.
