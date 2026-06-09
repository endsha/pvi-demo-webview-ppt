export type InsuranceType = 'all' | 'motorbike' | 'car'

export interface InsuranceTypeOption {
  value: InsuranceType
  label: string
}

export const INSURANCE_TYPE_OPTIONS: InsuranceTypeOption[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'motorbike', label: 'Xe máy' },
  { value: 'car', label: 'Ô tô' },
]

export const DEFAULT_INSURANCE_TYPE: InsuranceType = 'all'

// Mock value shown read-only; in the real webview the host injects the phone.
export const MOCK_PHONE = 'Chưa cập nhật'

export interface LookupFormValues {
  phone: string
  insuranceType: InsuranceType
}
