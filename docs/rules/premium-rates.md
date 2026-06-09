# Premium Rate Constants

> Mọi rate / bracket / công thức FE dùng để tính phí bảo hiểm PHẢI sống trong
> [`src/lib/premium-rates.ts`](../../src/lib/premium-rates.ts). Không khai báo
> rate riêng lẻ trong product page.

## Khi nào cần đụng tới file này

- Hiển thị "tỷ lệ phí chuẩn" trên form trước khi gọi BE quote.
- Tự tính phí trên FE cho sản phẩm chưa có endpoint BE quote.
- BA gửi rule mới / sửa rate → cập nhật ở đây, KHÔNG sửa rải rác trong page.

## Quy tắc

1. **Add to `premium-rates.ts` trước, dùng sau.** Trước khi viết
   `const RATE = 0.0015` hay `if (days < 30) return 0.2` trong page,
   kiểm tra file này trước. Nếu chưa có thì thêm vào (theo template bên dưới).

2. **Export theo từng sản phẩm.** Đặt tên rõ scope:
   - Map cố định: `<PRODUCT>_<NAME>_RATES` hoặc `<PRODUCT>_<NAME>_MAP`
     (ví dụ `HOME_DAMAGE_RISK_RATES`, `PA_RATE_MAP` cho apartment-risk).
   - Hàm bracket: `get<Product><Name>(...)` trả về `number` hoặc `number | null`.
     (ví dụ `getHomeDamageDurationFactor`, `getTndsMotorbikePassengerRate`).

3. **Comment % bằng phần ngàn.** Mọi rate gắn comment `// 0.x%` để người đọc
   không phải nhân nhẩm. BA gửi rule dạng "0.05%" → ghi `0.0005 // 0.05%`.

4. **Hàm bracket trả về `null` khi input không hợp lệ.** Caller tự quyết định
   skip / default. Ví dụ `getHomeInsuranceStandardRate(buildAge, termDays)`
   trả null nếu age âm hoặc termDays ≤ 0.

5. **`DEFAULT_TAX_RATE` (VAT 10%) KHÔNG ở đây.** Nó sống trong
   [`src/api/products/premium-adapter-helpers.ts`](../../src/api/products/premium-adapter-helpers.ts)
   vì BE-call adapter cũng dùng. Import từ đó nếu cần dùng trong page:
   ```ts
   import { DEFAULT_TAX_RATE as VAT_RATE } from '@/api/products/premium-adapter-helpers';
   ```

6. **Không gộp rule UI list (Select options) vào file này.** Option label
   (ví dụ `'20.000.000 VNĐ/người/vụ'`) thuộc về `*-constants.ts` của sản phẩm,
   không phải `premium-rates.ts`.

## Template

```ts
// ============================================================================
// <product-slug> (<BE product code>)
// ============================================================================

/** <Mô tả ngắn — link tới BRD section nếu có>. */
export const <PRODUCT>_<NAME>_RATES: Record<string, number> = {
  key1: 0.001, // 0.1%
  key2: 0.002, // 0.2%
};

/** <Mô tả công thức bracket>. */
export function get<Product><Name>(input: number): number {
  if (input <= 50_000_000) return 0.001; // 0.1%
  if (input <= 100_000_000) return 0.002; // 0.2%
  return 0.003;                           // 0.3%
}
```

## Anti-patterns

```ts
// ❌ Khai báo trong product page
const RISK_RATES = { riskA: 0.002, riskB: 0.00015, ... };

// ❌ Magic number inline
const baseRatePct = buildAge < 15 ? 0.15 : 0.20;

// ❌ Để rate map trong file UI-options
export const PA_RATE_MAP = { ... };               // ở apartment-risk-constants.ts
export const PERSONAL_ACCIDENT_LIMIT_OPTIONS = [  // option list — fine
  { value: '20000000', label: '20.000.000 VNĐ/người/vụ' },
];
```

```ts
// ✅ Import từ lib
import {
  HOME_DAMAGE_RISK_RATES,
  getHomeDamageDurationFactor,
  getHomeInsuranceStandardRate,
} from '@/lib/premium-rates';
```
