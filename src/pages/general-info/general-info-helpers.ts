import dayjs from 'dayjs'

export type VehicleType = 'motorbike' | 'car'
export type VehicleFilterValue = 'all' | VehicleType
export type SortOrder = 'newest' | 'oldest'

export interface PolicyInfo {
  fullName: string
  driverCode: string
  partnerId: string
  phone: string
  accumulatedAmount: number
  contractNo: string
}

export interface BenefitDetail {
  accumulatedLimit: number
  paidAmount: number
  estimatedClaim: number
}

export interface Benefit {
  id: string
  order: number
  title: string
  maxLimit: number
  vehicle: VehicleFilterValue
  description?: string
  detail: BenefitDetail
}

export interface AccumulationOrder {
  id: string
  vehicle: VehicleType
  tripCode: string
  amount: number
  completedAt: string
}

export const ACCUMULATION_PAGE_SIZE = 10

export function formatVnd(amount: number): string {
  return `${amount.toLocaleString('de-DE')} VND`
}

export function formatDate(value: string | Date): string {
  return dayjs(value).format('DD/MM/YYYY')
}

export function formatDateTime(value: string | Date): string {
  return dayjs(value).format('DD/MM/YYYY HH:mm')
}
