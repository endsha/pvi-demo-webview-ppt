# New Product Page Conventions

> Mọi product page mới PHẢI tuân theo pattern của các sản phẩm đã done.
> Reference implementations:
> - Simple confirm (1 section): `src/pages/products/tnds-car/TndsCarProductPage.tsx`
> - Complex confirm (nhiều sections/upload): `src/pages/products/vehicle-damage/`
> - Multi-person: `src/pages/products/comprehensive-health/`

---

## Bắt buộc — Layout Shell (`ProductFormLayout`)

**LUÔN** dùng `ProductFormLayout` làm wrapper ngoài cùng cho mọi product page (steps 0–2). **KHÔNG BAO GIỜ** dùng trực tiếp `SettingsPageLayout`, hay tự dựng breadcrumb / Steps bar / white card riêng.

```tsx
// ✅ Đúng
import { ProductFormLayout } from '@/components/ProductShared';

return (
  <>
    <ProductFormLayout
      title={t('products.<slug>.title')}
      currentStep={currentStep}
    >
      {/* Step 0 — Form */}
      {/* Step 1 — ConfirmContent */}
      {/* Step 2 — PaymentStep */}
    </ProductFormLayout>
    {/* AntD Modals (portals) đặt ngoài layout */}
    <MyModal ... />
  </>
);

// ❌ Sai — tự dựng lại những gì ProductFormLayout đã lo
return (
  <ConfigProvider theme={{ token: { colorPrimary: pviColors.blue } }}>
    <SettingsPageLayout>
      <Breadcrumb items={[...]} />
      <Typography.Title>{title}</Typography.Title>
      <div style={{ background: '#fff', border: '1px solid #f0f0f0', ... }}>
        <Steps current={currentStep} items={[...]} />
        {children}
      </div>
    </SettingsPageLayout>
  </ConfigProvider>
);
```

`ProductFormLayout` tự lo toàn bộ:

| Thứ lo | Chi tiết |
|---|---|
| Page shell | `SettingsPageLayout` (sidebar + header + content area) |
| Theme | `ConfigProvider` PVI blue — override Button, Table dark header, Steps color |
| Breadcrumb | 3 cấp — `t('products.breadcrumbParent')` / `t('products.breadcrumbSub')` / `title` prop |
| Page title | `Typography.Title level={4}` bold |
| White card | Border + borderRadius 8 + overflow hidden |
| Steps bar | 3 bước cố định — text lấy từ `t('products.steps.fill|confirm|payment')` |
| Responsive padding | Mobile 16px / Desktop 24–48px |

**Step 3 (Kết quả)** — `ProductResultPage` render layout riêng, **không** bọc trong `ProductFormLayout`.

Props của `ProductFormLayout`:

```ts
interface ProductFormLayoutProps {
  title: string;       // tên sản phẩm hiển thị trên trang
  currentStep: number; // 0 | 1 | 2
  children: ReactNode;
}
```

---

## Bắt buộc — Form Management

**LUÔN** dùng AntD Form. **KHÔNG BAO GIỜ** dùng `useState` để quản lý form state.

```tsx
// ✅ Đúng
const [form] = Form.useForm<MyFormValues>();
// ...
<Form form={form} layout="vertical" initialValues={...}>
  <Form.Item name="field" rules={zodFormRules(s.field)}>
    <Input />
  </Form.Item>
</Form>

// ❌ Sai — gây duplicate logic, không có search/validate tự động
const [form, setForm] = useState({ field: '' });
const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
```

Validation khi submit:
```tsx
const handleNext = async () => {
  try {
    await form.validateFields();
  } catch {
    void message.error(t('products.errors.requiredAll'));
    return;
  }
  // proceed
};
```

---

## Bắt buộc — Shared Components

| Section | Component | Import |
|---|---|---|
| **Page shell (Steps 0–2)** | `<ProductFormLayout />` | `@/components/ProductShared` |
| Nhân viên bán hàng (Section I) | `<StaffInfoSection />` | `@/components/ProductShared` |
| Bên mua bảo hiểm (Section II) | `<CustomerInfoSection />` | `@/components/ProductShared` |
| Thanh toán (Step 2) | `<PaymentStep />` | `@/components/ProductShared` |
| Kết quả (Step 3) | `<ProductResultPage />` | `@/components/ProductShared` |

**KHÔNG** tự implement lại bất kỳ component nào trên. Nếu cần customization nhỏ, dùng props của component đó.

---

## Bắt buộc — Schema

Mỗi product PHẢI có file `src/schemas/<slug>-schema.ts`:

```ts
// src/schemas/my-product-schema.ts
export const myProductFormSchema = z.object({
  // Section I — Staff (StaffInfoSection quản lý, khai báo để form biết)
  providerId: z.string().min(1, { error: req }),
  providerStaffId: z.string().min(1, { error: req }),
  customerId: z.string().optional().default(''),

  // Section II — Buyer (CustomerInfoSection standard field names — KHÔNG đổi tên)
  customerType: z.string().min(1, { error: req }),
  fullName: z.string().min(1, { error: req }),
  nationality: z.string().min(1, { error: req }),
  phone: phoneRule,
  email: emailRule,
  // ... các field chuẩn của CustomerInfoSection

  // Section III+ — Product-specific fields
  startDate: z.string().min(1, { error: req }),
  // ...
});

export type MyProductFormValues = z.infer<typeof myProductFormSchema>;
```

**Lưu ý quan trọng**: CustomerInfoSection dùng field names chuẩn (`fullName`, `phone`, `email`, `province`, `ward`, `idType`, `idNumber`, v.v.). Schema PHẢI dùng đúng tên này — KHÔNG đặt prefix như `buyerName`, `buyerPhone`.

---

## Bắt buộc — Confirm Step (Step 1)

Chọn 1 trong 2 pattern tùy độ phức tạp:

### Pattern A — Simple: dùng shared `<ConfirmStep>`

Áp dụng khi: 1 bảng thông tin duy nhất, không có upload, không có section phức tạp.

```tsx
import { ConfirmStep } from '@/components/ProductShared';

{currentStep === 1 && (
  <ConfirmStep
    sectionTitle={t('...')}
    tableTitle={t('...')}
    items={[
      { label: t('...'), value: stepData.field ?? '-' },
      // ...
    ]}
    backLabel={t('...')} nextLabel={t('...')}
    onBack={handleBack} onNext={handleNext}
  />
)}
```

Ví dụ: `TndsCarProductPage`, `TndsMotorbikeProductPage`

### Pattern B — Complex: tách `<Slug>ConfirmContent.tsx`

Áp dụng khi: nhiều bảng sections, có upload file, có download template, hoặc UI đặc thù.

```tsx
// <Slug>ConfirmContent.tsx — export interface + component
export interface MyProductConfirmContentProps {
  stepData: Partial<MyProductFormValues> & { endDate?: string };
  // ... các computed values cần hiển thị
  onBack: () => void;
  onNext: () => void;
  loading?: boolean;
}
export function MyProductConfirmContent(props: MyProductConfirmContentProps) { ... }

// <Slug>ProductPage.tsx — import và dùng
import { MyProductConfirmContent } from './MyProductConfirmContent';
```

Ví dụ: `VehicleDamageConfirmContent`, `TravelDomesticConfirmContent`, `ComprehensiveHealthConfirmContent`

---

## Bắt buộc — Mutation / Confirm

- Type `form` trong mutation/confirm content PHẢI import từ schema file (`*FormValues`), KHÔNG từ types file.
- Snapshot `stepData` = `form.getFieldsValue()` khi move to step 1 — không truyền thủ công từng field.

---

## Cấm

| Cấm | Lý do |
|---|---|
| `useState` cho form fields | Duplicate logic, không có search/validate, khó maintain |
| Tự implement customer/staff section | Duplicate UI + logic đã có trong shared components |
| Custom `FieldItem` / `FieldWrapper` | AntD `Form.Item` đã cung cấp đầy đủ |
| Manual `fieldErrors` state | AntD Form validate tự động qua `rules` |
| Hardcode validation (regex, length check) trong page | Phải đặt trong Zod schema |
| Import `ComprehensiveHealthFormInput` từ types file | Type đó đã move vào schema |

---

## File Structure

```
src/pages/products/<slug>/
├── <Slug>ProductPage.tsx       # Main page (AntD Form)
├── <Slug>ConfirmContent.tsx    # Step 1 confirm (nhận FormValues prop)
├── <Slug>PersonCard.tsx        # Nếu có multi-person (dùng useState riêng)
└── <slug>-types.ts             # Domain types: constants, helpers, InsuredPerson, etc.
                                # KHÔNG chứa form input type — cái đó ở schema

src/schemas/
└── <slug>-schema.ts            # Zod schema + export FormValues type

src/api/products/<slug>/
├── *-types.ts                  # API request/response types
├── use-create-*-mutation.ts    # Import FormValues từ schema
└── ...
```
