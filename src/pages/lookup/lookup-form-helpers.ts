import { MOCK_POLICY_INFO } from '../general-info/mock-data'

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

// Single source of truth for the registered phone (mirrors the policy record).
export const REGISTERED_PHONE = MOCK_POLICY_INFO.phone

// Reduce a VN phone to its national significant number (drop +84 / leading 0 / spaces).
export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('84')) return digits.slice(2)
  if (digits.startsWith('0')) return digits.slice(1)
  return digits
}

// Demo hint: the registered number in the local 0xxxxxxxxx format users would type.
export const REGISTERED_PHONE_DISPLAY = `0${normalizePhone(REGISTERED_PHONE)}`

export function isRegisteredPhone(value: string): boolean {
  const input = normalizePhone(value)
  return input.length > 0 && input === normalizePhone(REGISTERED_PHONE)
}

export interface LookupFormValues {
  phone: string
  insuranceType: InsuranceType
}
