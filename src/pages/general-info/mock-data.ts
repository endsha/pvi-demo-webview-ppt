import type { AccumulationOrder, Benefit, PolicyInfo } from './general-info-helpers'

export const MOCK_POLICY_INFO: PolicyInfo = {
  fullName: 'Trần Việt Dũng',
  driverCode: '6062006',
  partnerId: '6062006',
  phone: '+84 389858021',
  accumulatedAmount: 2000000,
  contractNo: '25/PC-GRAB/014635',
}

export const DEFAULT_LOOKUP_DATE = '2025-03-06'
export const DEFAULT_RANGE_FROM = '2025-02-18'
export const DEFAULT_RANGE_TO = '2025-03-06'

export const MOCK_BENEFITS: Benefit[] = [
  {
    id: 'death',
    order: 1,
    title: 'Tử vong do tai nạn',
    maxLimit: 2000000,
    vehicle: 'all',
    detail: { accumulatedLimit: 2000000, paidAmount: 0, estimatedClaim: 0 },
  },
  {
    id: 'permanent-disability',
    order: 2,
    title: 'Thương tật toàn bộ vĩnh viễn do tai nạn',
    maxLimit: 2000000,
    vehicle: 'all',
    detail: { accumulatedLimit: 2000000, paidAmount: 0, estimatedClaim: 0 },
  },
  {
    id: 'hospital-allowance',
    order: 3,
    title: 'Trợ cấp nằm viện do tai nạn',
    maxLimit: 120000,
    vehicle: 'all',
    description:
      'Chỉ trả trợ cấp nằm viện do tai nạn từ trọn 2 ngày trở lên, tối đa mỗi đợt nằm viện 1.500.000 VND đối với tài xế xe máy & 3.000.000 VND đối với tài xế ô tô',
    detail: { accumulatedLimit: 120000, paidAmount: 0, estimatedClaim: 0 },
  },
  {
    id: 'medical-expense',
    order: 4,
    title: 'Chi phí y tế do tai nạn',
    maxLimit: 120000,
    vehicle: 'all',
    description: 'Chỉ chi trả các chi phí y tế phát sinh trong thời hạn bảo hiểm',
    detail: { accumulatedLimit: 120000, paidAmount: 0, estimatedClaim: 0 },
  },
]

export const MOCK_BENEFIT_NOTES: string[] = [
  'STBH tích lũy và hạn mức quyền lợi sẽ được cập nhật theo ngày',
  'Hệ thống chỉ hiển thị thông tin các chuyến xe tích lũy bảo hiểm',
]

const trip = (id: string, tripCode: string, completedAt: string): AccumulationOrder => ({
  id,
  vehicle: 'motorbike',
  tripCode,
  amount: 250000,
  completedAt,
})

export const MOCK_ACCUMULATION_ORDERS: AccumulationOrder[] = [
  trip('o1', '01JMCDK44W2MSDJC26JJCTZFQM', '2025-02-18T19:15:00'),
  trip('o2', '01JMC63NQJEECB1VK39Q3382TJ', '2025-02-18T16:55:00'),
  trip('o3', '01JMC4K0BE3TY4ADPJ7CWSQKCX', '2025-02-18T16:28:00'),
  trip('o4', '01JMC375NWNWSRPF1CET7RNDS5', '2025-02-18T15:56:00'),
  trip('o5', '01JMC178G5AWEYDN9T5DWBRAPF', '2025-02-18T15:36:00'),
  trip('o6', '01JMBA0GACW20YA8N7831GWA11', '2025-02-18T09:01:00'),
  trip('o7', '01JMB8GEJY4WJ0MBT006SWW45Q', '2025-02-18T08:20:00'),
  trip('o8', '01JMB644Z1V6WXKHT811A8H2CP', '2025-02-18T07:52:00'),
]
