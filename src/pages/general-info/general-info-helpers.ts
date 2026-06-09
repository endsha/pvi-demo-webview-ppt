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

export function filterOrdersByVehicle(
  orders: readonly AccumulationOrder[],
  filter: VehicleFilterValue,
): AccumulationOrder[] {
  if (filter === 'all') return [...orders]
  return orders.filter((o) => o.vehicle === filter)
}

export function filterBenefitsByVehicle(
  benefits: readonly Benefit[],
  filter: VehicleFilterValue,
): Benefit[] {
  if (filter === 'all') return [...benefits]
  return benefits.filter((b) => b.vehicle === 'all' || b.vehicle === filter)
}

export function searchOrders(
  orders: readonly AccumulationOrder[],
  query: string,
): AccumulationOrder[] {
  const q = query.trim().toLowerCase()
  if (q === '') return [...orders]
  return orders.filter((o) => o.tripCode.toLowerCase().includes(q))
}

export function sortOrders(
  orders: readonly AccumulationOrder[],
  order: SortOrder,
): AccumulationOrder[] {
  const sorted = [...orders].sort(
    (a, b) => a.completedAt.localeCompare(b.completedAt),
  )
  return order === 'newest' ? sorted.reverse() : sorted
}

export function paginate<T>(items: readonly T[], page: number, pageSize: number): T[] {
  const safePage = Math.max(1, page)
  const start = (safePage - 1) * pageSize
  return items.slice(start, start + pageSize)
}

export function sumOrderAmount(orders: readonly AccumulationOrder[]): number {
  return orders.reduce((total, o) => total + o.amount, 0)
}
