# Orders Page — Rules & Patterns

## 1. BE → FE Status Mapping

File: `src/api/orders/use-order-query.ts` → `STATUS_MAP`

| BE value | FE `OrderStatus` | Label UI |
|---|---|---|
| `INITIATED` / `INIT` / `CREATED` | `created` | Khởi tạo |
| `PENDING_PAYMENT` / `WAITING_PAYMENT` / `PENDING` | `waiting_payment` | Chờ thanh toán |
| `ACTIVE` / `ISSUED` / `PAID` | `issued` | Đã xác nhận / Đã cấp ⚠️ derived — see below |
| `CANCELLED` | `cancelled` | Đã hủy |
| `REJECTED` | `rejected` | Thất bại |
| `CANCEL_REQUESTED` | `cancel_requested` | Yêu cầu hủy |

**Quy tắc**: Khi BE trả về status mới chưa có trong map → thêm vào `STATUS_MAP`, KHÔNG để fallback về `'created'`.

### Derived display: "Đã xác nhận" vs "Đã cấp"

`OrderStatusBadge` (`src/components/Orders/OrderStatusBadge.tsx`) splits `issued`:

- `issued` AND any of `certificateNo` / `contractNo` / `serialNo` / `piasContractCode` is truthy → **"Đã cấp"** (purple)
- `issued` AND all four cert fields empty → **"Đã xác nhận"** (cyan)

Reason: `ACTIVE` orders that haven't received GCNBH data from BE yet look bad as "Đã cấp" with all cert columns showing `-`. The cyan "Đã xác nhận" state communicates "paid & acknowledged, cert pending"; once BE ships any cert field the badge flips to purple "Đã cấp" automatically.

Caller passes `hasCertificate` from the record:
```tsx
<OrderStatusBadge
  status={record.status}
  hasCertificate={!!(record.certificateNo || record.contractNo || record.serialNo || record.piasContractCode)}
/>
```

Filter dropdown keeps a single "Đã cấp" option (both display variants share status=`issued`).

---

## 2. Action Menu — Điều kiện hiển thị

File: `src/pages/orders/OrdersPage.tsx` → cột `actions`

| Action | Điều kiện | API |
|---|---|---|
| Xác nhận thanh toán | `status === 'waiting_payment'` | `POST /api/v1/policies/{id}/payment-confirmation` (no body) |
| Yêu cầu chỉnh sửa | `status === 'issued'` | Mock (`requestEditOrderMock`) — swap khi BE confirm |
| Thông tin đơn | Luôn hiện | Navigate sang product page với `prefillOrder` state |
| Quản lý tài liệu | Luôn hiện | Mock documents API |
| Yêu cầu hủy | `status !== 'cancelled' && !== 'rejected' && !== 'cancel_requested'` | Mock (`requestCancelOrderMock`) — swap khi BE confirm |

---

## 3. Xác nhận thanh toán (Confirm Payment)

Hook: `useConfirmOrderPayment()` trong `src/api/orders/use-order-query.ts` — signature đã update:

```typescript
confirmOrderPayment.mutate({ id: record.id, method: record.paymentMethod });
// FE method (cash/bank_transfer/payment_gateway) → BE method (CASH/BANK_TRANSFER/CARD) mapping internally.
```

### Per-row action — 2 nhánh theo `record.paymentMethod`

```tsx
{
  key: 'confirm-payment',
  label: t('orders.actions.confirmPayment'),
  onClick: () => {
    if (!record.paymentMethod) {
      // Chưa có method → navigate sang product page, land trực tiếp ở B2 để user pick
      void handleOpenOrderDetail(record, { initialStep: 2 });
      return;
    }
    // Có method → gọi API trực tiếp, truyền method
    confirmOrderPayment.mutate({ id: record.id, method: record.paymentMethod }, { ... });
  },
}
```

Lý do branch: BE `POST /policies/{id}/payment-confirmation` cần `method`. Order có `paymentMethod = null` (PENDING_PAYMENT chưa pick) sẽ 422 nếu gọi mà không truyền method. UX: dẫn user vào B2 để chọn, rồi đi tiếp B3.

### Bulk confirm (checkbox selection)

Look up method từ `data.list` cho mỗi row. Rows không có method sẽ fail server-side — user phải dùng per-row action để pick method:

```ts
const byId = new Map(data?.list?.map((o) => [o.id, o]) ?? []);
selectedIds.map((id) => confirmOrderPayment.mutateAsync({
  id,
  method: byId.get(id)?.paymentMethod || undefined,
}));
```

---

## 3b. Navigation từ Orders → Product page với `initialStep`

`handleOpenOrderDetail(order, { initialStep })` nhận optional `initialStep`, đặt vào route state. Product page reads `routeState.initialStep` và pass xuống `useProductFormSteps({ ..., initialStep })`. Hook init `currentStep` ở step được chỉ định, useEffect snapshot stepData (form values + extras) để PaymentStep/ConfirmStep thấy giá trị đầy đủ ngay (không bị `0 VNĐ` flash).

| Caller | initialStep | Use case |
|---|---|---|
| "Thông tin đơn" | undefined (= 0) | User xem từ đầu B0 |
| "Xác nhận thanh toán" + no method | 2 | Land thẳng B2 để pick method |

---

## 4. "Thông tin đơn" — Navigate sang Product Page

### Vấn đề: Tạo đơn trùng lặp (CRITICAL BUG đã fix)

Khi click "Thông tin đơn" → navigate sang product page với `prefillOrder` state.
Trước fix: `createdPolicy = null` → user đến step 1 confirm → **tạo đơn MỚI**, không dùng đơn cũ.

### Fix đã áp dụng

Các product page có API tạo đơn thật (`TndsMotorbikeProductPage`, `TndsCarProductPage`) đã khởi tạo `createdPolicy` từ `prefillOrder.id`:

```typescript
const [createdPolicy, setCreatedPolicy] = useState<CreateXxxResponse | null>(
  prefillOrder ? { id: prefillOrder.id, orderCode: prefillOrder.orderCode } as CreateXxxResponse : null,
);
```

Kết quả: khi user đến step 1 confirm, điều kiện `if (createdPolicy)` là `true` → **skip creation**, dùng đơn cũ.

### Product pages có API tạo đơn thật (cần áp dụng pattern trên)

| Page | File | API |
|---|---|---|
| ✅ TndsMotorbike | `TndsMotorbikeProductPage.tsx` | `useCreateTndsMotorMutation` |
| ✅ TndsCar | `TndsCarProductPage.tsx` | `useCreateTndsCarMutation` |
| ⏳ Các trang còn lại | `VehicleDamage`, `HomeComprehensive`, `TravelDomestic`, v.v. | Chưa wire API thật — khi wire xong, **bắt buộc** áp dụng pattern `createdPolicy` từ `prefillOrder` |

### Checklist khi wire API tạo đơn cho product page mới

Khi chuyển `createdPolicyId` (stub) thành real API call ở step 1:
1. Đổi `const [createdPolicyId] = useState<string | null>(null)` thành `useState` có setter
2. Khởi tạo từ `prefillOrder` ngay khi declare:
   ```typescript
   const [createdPolicyId, setCreatedPolicyId] = useState<string | null>(
     prefillOrder?.id ?? null,
   );
   ```
3. Step 1 `onNext`: kiểm tra `if (createdPolicyId) { setCurrentStep(2); return; }` trước khi `createOrder.mutate`
4. `createOrder.onSuccess`: gọi `setCreatedPolicyId(data.id)`

---

## 5. Thêm Action Mới vào Orders

Checklist khi thêm action mới vào dropdown `...`:

1. **API layer**: thêm payload type vào `order-types.ts`, mock function vào `order-mock.ts`, hook `use<Action>Order` vào `use-order-query.ts`
2. **Component** (nếu cần modal): tạo `<Action>Modal.tsx` trong `src/components/Orders/`, export qua `index.ts` — pattern giống `CancelRequestModal`
3. **Dropdown**: thêm item vào `actions` column trong `OrdersPage.tsx` với điều kiện status phù hợp
4. **i18n**: thêm key `orders.actions.<action>` + label modal vào cả `vi/` và `en/` `common.json`
5. **Verify**: `yarn typecheck && yarn i18n:parity`
