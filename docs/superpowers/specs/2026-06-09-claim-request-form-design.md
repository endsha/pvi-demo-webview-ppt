# Claim Request Form — Design Spec

**Date:** 2026-06-09
**Page:** Nhập yêu cầu bồi thường (Claim Request Form)
**Scope:** UI + mock data only. No API, no network calls.
**Design source:** `docs/ui/claim-request-form-01.png` … `claim-request-form-05.png`

> Governed by `docs/rules/ui-ux-strict.md` — match screenshots 100% (labels, placeholders,
> section order, grid, conditional reveals). Do not invent or omit fields.

---

## 1. Goal

Implement the single-page claim request form shown across the five screenshots. The page
is a vertical AntD `Form` made of five collapsible sections, ending in a `Nộp hồ sơ`
(submit) button. All submit handling is UI-only (`console.info` + success message); no API
is mocked.

## 2. Decisions (confirmed with user)

| Topic | Decision |
|---|---|
| Routing / entry | New route `/claim-request`. Entered from the claims-list `Gửi yêu cầu bồi thường` button. Back arrow → `/general-info`. |
| Commitment section | Header `Switch` = master "agree-all"; 3 required checkboxes; `Nộp hồ sơ` disabled until all 3 accepted. |
| Payment cases | Multi-select (checkbox group), 4 options. |
| Treatment date range | `Từ ngày` / `Đến ngày` disabled unless `Hình thức điều trị` = `Nội trú` (inpatient). |

## 3. Architecture

Mirror the existing `general-info` / `lookup` page structure (decomposed sections +
`*-helpers.ts` + `mock-*.ts`). One AntD `Form` wraps a `Collapse` of five panels.

### Routing
- `src/router/routes/claim-request-route.ts` → path `/claim-request`, child of `rootRoute`.
- Register in `src/router/router.ts` `routeTree`.
- `ClaimsSection.tsx`: wire `Gửi yêu cầu bồi thường` button → `navigate({ to: '/claim-request' })`.
- Back arrow in header → `navigate({ to: '/general-info' })`.

### File structure (`src/pages/claim-request/`)
- `ClaimRequestPage.tsx` — single `Form.useForm` (`layout="vertical"`); renders header +
  `Collapse` (all five panels open by default, `expandIconPosition="end"`) + behavior wiring.
- `components/`
  - `ClaimRequestHeader.tsx` — back arrow + centered title **"Nhập yêu cầu bồi thường"** (no subtitle).
  - `InsuredPersonSection.tsx` — Thông tin về người được bảo hiểm.
  - `AccidentMedicalSection.tsx` — Thông tin về tai nạn và khám chữa bệnh (conditional date range).
  - `PaymentInfoSection.tsx` — Thông tin thanh toán (subsections 1 & 2).
  - `AttachmentsSection.tsx` — Tài liệu đính kèm.
  - `CommitmentSection.tsx` — Cam kết (master toggle + 3 checkboxes + submit button).
- `claim-request-form-helpers.ts` — `ClaimRequestFormValues` type, option lists, constants,
  pure helpers (`areAllCommitmentsAccepted`, submit gating).
- `mock-claim-request.ts` — prefilled insured-person mock.
- `claim-request-form-helpers.test.ts` — tests for pure gating/toggle logic.

Grid: AntD `Row`/`Col` per ui-ux-strict (2-column rows → `xs={24} md={12}`).

## 4. Sections & fields (exact labels/placeholders)

### Section 1 — Thông tin về người được bảo hiểm (2-col grid)
| Label | Control | Notes |
|---|---|---|
| Mã Tài xế GSM | Input | readonly/gray, mock `6062006` |
| Họ và tên | Input | readonly/gray, mock `Trần Việt Dũng` |
| Giới tính | Input | readonly/gray, mock `Nam` |
| Số CMND/ CCCD/ Hộ chiếu | Input | placeholder `Nhập số CMND/CCCD/Hộ chiếu` |
| Ngày sinh | Input | placeholder `Nhập ngày sinh` |
| Email * | Input | required; placeholder `Nhập email` |
| Số điện thoại sử dụng Zalo * | Input | required; placeholder `Nhập số điện thoại sử dụng zalo` |

### Section 2 — Thông tin về tai nạn và khám chữa bệnh (2-col grid)
| Label | Control | Notes |
|---|---|---|
| Ngày tai nạn * | DatePicker | required; placeholder `Chọn Ngày tai nạn` |
| Nơi xảy ra tai nạn * | Input | required; placeholder `Nhập nơi xảy ra tai nạn` |
| Ngày khám bệnh * | DatePicker | required; placeholder `Chọn ngày khám bệnh` |
| Ngày nhập viện | DatePicker | placeholder `Chọn ngày nhập viện` |
| Nơi điều trị | Input | placeholder `Nhập nơi điều trị` |
| Nguyên nhân / Chẩn đoán về tai nạn * | Input | required; placeholder `Nhập nguyên nhân/chẩn đoán về tai nạn` |
| Hậu quả * | Input | required; placeholder `Nhập hậu quả` |
| Hình thức điều trị * | Radio | options `Ngoại trú` (default), `Nội trú` |
| Từ ngày | DatePicker | placeholder `Chọn ngày`; **disabled unless Nội trú** |
| Đến ngày | DatePicker | placeholder `Chọn ngày`; **disabled unless Nội trú** |

### Section 3 — Thông tin thanh toán
**1. Nội dung yêu cầu chi trả bảo hiểm**
- `Tổng số tiền yêu cầu chi trả *` — Input with `VND` suffix, thousands formatting; placeholder `Nhập số tiền yêu cầu chi trả`. Required.
- `Chi trả cho những trường hợp *` — bordered **checkbox** group (multi-select), required ≥1:
  1. Tử vong do tai nạn
  2. Thương tật toàn bộ vĩnh viễn do tai nạn
  3. Chi phí y tế do tai nạn
  4. Trợ cấp nằm viện do tai nạn

**2. Thông tin người thụ hưởng** (2-col grid)
| Label | Control | Notes |
|---|---|---|
| Người thụ hưởng * | Input | required; placeholder `Nhập tên người thụ hưởng` |
| Số tài khoản * | Input | required; placeholder `Nhập số tài khoản` |
| Ngân hàng * | Input | required; placeholder `Nhập Ngân hàng` |
| Địa chỉ Ngân hàng | Input | placeholder `Nhập địa chỉ Ngân hàng` |

### Section 4 — Tài liệu đính kèm
- Intro: `Vui lòng tải lên tài liệu liên quan, gồm:` followed by numbered list (copy exactly):
  1. Biên bản tai nạn: **Tải mẫu biên bản** (red link, no-op)
  2. Chứng từ y tế phát sinh: Sổ khám, toa thuốc, các phiếu chỉ định & kết quả cận lâm sàng (siêu âm, Xquang, xét nghiệm…)
  3. Chứng từ thanh toán: Hóa đơn tài chính, Phiếu thu, các bảng kê chi tiết kèm theo
  4. Hai mặt CMND/CCCD, Giấy phép lái xe, Giấy đăng ký xe (trường hợp điều khiển phương tiện giao thông)
  5. Các chứng từ liên quan khác (nếu có)
- `Tải lên` upload button (navy, upload icon). AntD `Upload` with `beforeUpload` → `false`
  (no network); files held in form state only; `multiple`.
- Red note (copy exactly):
  - `Lưu ý:`
  - `- Chỉ hỗ trợ các định dạng PNG, JPG, WORD, EXCEL, PDF, EMAIL, TXT, RAR và tối đa 5MB`
  - `- Hình chụp cần rõ nét, không bị mất gốc/thông tin`
- Advisory paragraph: `Trong một số trường hợp, Bảo hiểm PVI có thể yêu cầu Quý khách hàng hỗ trợ gửi bản gốc và/hoặc bổ sung các chứng từ yêu cầu bồi thường cho chúng tôi để xử lý bồi thường`

### Section 5 — Cam kết
- Header: section title + `Switch` (master agree-all toggle).
- Three checkbox statements (copy exactly):
  1. `Tôi cam đoan những thông tin kê khai trên đây là chính xác và đầy đủ. Tôi xin hoàn toàn chịu trách nhiệm trước pháp luật nếu có bất cứ sự sai lệch nào về thông tin đã cung cấp và bất cứ tranh chấp nào về quyền thụ hưởng số tiền được chi trả bảo hiểm.`
  2. `Bằng Giấy yêu cầu chi trả tiền bảo hiểm này, tôi cho phép đại diện của Bảo hiểm PVI được quyền tiếp xúc với các bên thứ ba để thu thập thông tin cần thiết cho việc xét bồi thường này, bao gồm nhưng không giới hạn ở mức tiếp xúc với (các) bác sĩ đã và đang điều trị của tôi.`
  3. `Việc nhấn "Gửi yêu cầu bồi thường" trên Cổng bồi thường trực tuyến sẽ thay cho chữ ký sống của tôi trên Giấy yêu cầu chi trả tiền bảo hiểm này.`
- `Nộp hồ sơ` button — centered; **disabled until all 3 checkboxes accepted**.

## 5. Behavior & data flow

- Single `Form.useForm`. `Form.useWatch` drives:
  - **Treatment date range** enablement from `Hình thức điều trị` (`Nội trú` → enabled).
  - **Commitment gating** from the 3 checkbox values.
- Master toggle: `onChange` calls `form.setFieldsValue` to set/unset all 3 commitment
  checkboxes; the `Switch` `checked` reflects `areAllCommitmentsAccepted(values)`.
- Required-field validation with Vietnamese messages; validate on submit.
- `onFinish(values)`: `console.info('Yêu cầu bồi thường:', values)` + `message.success(...)`.
  No API. (Matches `LookupForm` precedent.)

## 6. Styling

- White rounded section cards on `bg-form-band` page, matching screenshots.
- AntD `Collapse` ghost/bordered with `expandIconPosition="end"` (chevron on right).
- Tokens from `src/app/theme.ts` (`PVI_NAVY`, `PVI_RED`) and Tailwind utilities
  (`text-pvi-navy`, `bg-form-band`).
- Section heading: navy, bold (consistent with existing sections).

## 7. Testing

- `claim-request-form-helpers.test.ts`: pure logic only —
  - `areAllCommitmentsAccepted` true only when all three flags set.
  - master-toggle set-all / clear-all derivation.
  - submit-enabled gating.
- Visual check against the five screenshots after implementation.

## 8. Out of scope

- No API or network of any kind.
- No real file upload or `Tải mẫu biên bản` download.
- No confirm/result steps — this screenshot set ends at `Nộp hồ sơ`.
</content>
