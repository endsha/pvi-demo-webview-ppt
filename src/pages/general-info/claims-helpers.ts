export type ClaimStatus = 'processing' | 'rejected' | 'paid' | 'closed'
export type ClaimStatusFilter = 'all' | ClaimStatus

export interface ClaimRequest {
  id: string
  requestNo: string
  status: ClaimStatus
  createdAt: string
  accidentDate: string
  requestedAmount: number
  paidAmount: number
}

export const CLAIMS_PAGE_SIZE = 10

export interface ClaimStatusMeta {
  label: string
  colorClass: string
}

export const CLAIM_STATUS_META: Record<ClaimStatus, ClaimStatusMeta> = {
  processing: { label: 'Đang xử lý', colorClass: 'text-orange-500' },
  rejected: { label: 'Từ chối', colorClass: 'text-pvi-red' },
  paid: { label: 'Đã chi trả', colorClass: 'text-green-600' },
  closed: { label: 'Đóng', colorClass: 'text-gray-500' },
}

export const CLAIM_STATUS_FILTER_OPTIONS: { value: ClaimStatusFilter; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'rejected', label: 'Từ chối' },
  { value: 'paid', label: 'Đã chi trả' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'closed', label: 'Đóng' },
]

export function filterClaimsByStatus(
  claims: readonly ClaimRequest[],
  filter: ClaimStatusFilter,
): ClaimRequest[] {
  if (filter === 'all') return [...claims]
  return claims.filter((c) => c.status === filter)
}

export function searchClaims(claims: readonly ClaimRequest[], query: string): ClaimRequest[] {
  const q = query.trim().toLowerCase()
  if (q === '') return [...claims]
  return claims.filter((c) => c.requestNo.toLowerCase().includes(q))
}
