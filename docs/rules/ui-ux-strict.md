# UI/UX — Tuân thủ Figma / Screenshot TUYỆT ĐỐI

> **Bắt buộc đọc trước khi code bất kỳ trang nào có Figma / screenshot.**
>
> Quy tắc này có khi tự user-bằng-người không nhận ra Claude đã "đơn giản hoá" sai. Sai một field/section/toggle = sai cả flow nghiệp vụ bảo hiểm — rất khó debug về sau.

---

## 8 nguyên tắc bất biến

### 1. Bám sát 100% pixel + behavior
Không tự sáng tạo layout, color, label, section order, button position, hay flow logic. Có hình thì code theo hình. Hình không có thì hỏi, đừng đoán.

### 2. Toggle / radio / conditional reveal là MUST
Nếu hình cho thấy toggle ON hiện block A, toggle OFF ẩn block A — BẮT BUỘC implement đúng vậy.
- **Không** bỏ qua "vì nó đơn giản"
- **Không** "để toggle nhưng cứ hiện luôn"
- **Phải** dùng `Form.useWatch` để theo dõi state toggle và `{isOn && <Block />}` để conditional render

Ví dụ chuẩn: 3 toggle trong `VehicleDamageProductPage.tsx` (vehicle damage, passenger liability, compulsory TNDS).

### 3. Label / placeholder / mục text — copy CHÍNH XÁC
Bao gồm dấu cách, dấu phẩy, dấu chấm, hoa thường, dấu "/" giữa từ. Ví dụ:
- ✅ "Mức trách nhiệm/ người/ vụ" (có khoảng trắng sau "/")
- ❌ "Mức trách nhiệm / người / vụ" (khoảng trắng cả 2 bên)
- ❌ "Mức trách nhiệm/người/vụ" (không khoảng trắng)

Lệch là sai — user phải sửa lại.

### 4. Section heading + thứ tự
Giữ nguyên prefix "I., II., III., IV., V., VI." và tên section như hình. Không đổi order, không đổi tên.

### 5. Số cột / grid theo hình
Ant Design grid 24 cột:
- Hình 3 cột → `<Col xs={24} md={8}>` (3 × 8 = 24)
- Hình 2 cột → `<Col xs={24} md={12}>` (2 × 12 = 24)
- Hình full → `<Col xs={24}>` hoặc `<Col xs={24} md={24}>`

### 6. Confirm step (bước 2)
Có 2 pattern, chọn theo hình:

**Pattern A — Flat single Descriptions table** (TndsCar / TndsMotorbike):
```tsx
import { ConfirmStep } from '@/components/ProductShared';
<ConfirmStep sectionTitle="..." tableTitle="..." items={confirmItems} ... />
```

**Pattern B — Multi-section sectioned tables** (VehicleDamage / HomeComprehensive):
```tsx
// Inline ConfirmTable component (label 260px nền xám + value flex-1 nền trắng)
<ConfirmTable title="Thông tin xe..." rows={vehicleInfoRows} />
<ConfirmTable title="Thông tin khách hàng" rows={customerRows} />
// ... nhiều bảng theo hình
```

Nếu hình cho thấy NHIỀU sub-section với heading riêng → Pattern B.
Nếu chỉ 1 bảng dài → Pattern A.

### 7. Bước 3 (Thanh toán) + Bước 4 (Kết quả) — TÁI SỬ DỤNG
```tsx
import { PaymentStep, ProductResultPage } from '@/components/ProductShared';
```
**KHÔNG** viết lại 2 component này cho mỗi product. Chỉ truyền `labels` + state.

### 8. Cấm tự thêm field / section / button không có trong hình
Nếu hình thiếu thông tin / Claude thấy "có vẻ cần thêm field này cho hợp lý" → **DỪNG LẠI** và hỏi user. Đừng đoán nghiệp vụ bảo hiểm.

---

## Anti-patterns đã từng xảy ra

| Sai | Đúng |
|---|---|
| "Để toggle nhưng không cho ẩn nội dung phía sau" | Toggle phải reveal/hide block tương ứng (Form.useWatch + conditional render) |
| "Confirm step dùng 1 bảng flat cho mọi product" | Theo hình — multi-section nếu hình cho thấy có heading riêng |
| "Đổi tên section cho ngắn hơn" | Giữ nguyên 100% tên tiếng Việt từ hình |
| "Tự thêm icon / button vì nó hợp lý" | Chỉ thêm đúng thứ hình có |
| "Viết lại PaymentStep cho product mới" | Tái sử dụng `PaymentStep` chung từ ProductShared |
| Export non-component (constants, defaultFormValues) cùng file với component | Tách sang file `*-form-helpers.ts` để pass `react-refresh/only-export-components` |

---

## Quick reference khi làm product mới

Đọc [`docs/STATUS.md`](../STATUS.md) — checklist 7 bước + danh sách product/setting đã/chưa làm.
