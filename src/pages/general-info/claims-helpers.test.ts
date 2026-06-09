import { describe, expect, test } from 'vitest'
import {
  filterClaimsByStatus,
  searchClaims,
  CLAIM_STATUS_META,
  CLAIM_STATUS_FILTER_OPTIONS,
  type ClaimRequest,
  type ClaimStatus,
} from './claims-helpers'

const claim = (id: string, requestNo: string, status: ClaimStatus): ClaimRequest => ({
  id,
  requestNo,
  status,
  createdAt: '2026-06-09T15:22:00',
  accidentDate: '2026-06-01',
  requestedAmount: 1000,
  paidAmount: 0,
})

const CLAIMS: ClaimRequest[] = [
  claim('a', '26TT000001', 'processing'),
  claim('b', '26TT000002', 'paid'),
  claim('c', '26TT000003', 'processing'),
  claim('d', '26TT000004', 'rejected'),
  claim('e', '26TT000005', 'closed'),
]

describe('filterClaimsByStatus', () => {
  test('all returns every claim', () => {
    expect(filterClaimsByStatus(CLAIMS, 'all')).toHaveLength(5)
  })
  test('processing returns only processing claims', () => {
    expect(filterClaimsByStatus(CLAIMS, 'processing').map((c) => c.id)).toEqual(['a', 'c'])
  })
  test('paid returns only paid claims', () => {
    expect(filterClaimsByStatus(CLAIMS, 'paid').map((c) => c.id)).toEqual(['b'])
  })
  test('rejected returns only rejected claims', () => {
    expect(filterClaimsByStatus(CLAIMS, 'rejected').map((c) => c.id)).toEqual(['d'])
  })
  test('closed returns only closed claims', () => {
    expect(filterClaimsByStatus(CLAIMS, 'closed').map((c) => c.id)).toEqual(['e'])
  })
  test('does not mutate input', () => {
    const copy = [...CLAIMS]
    filterClaimsByStatus(CLAIMS, 'paid')
    expect(CLAIMS).toEqual(copy)
  })
})

describe('searchClaims', () => {
  test('empty query returns all', () => {
    expect(searchClaims(CLAIMS, '')).toHaveLength(5)
  })
  test('whitespace query returns all', () => {
    expect(searchClaims(CLAIMS, '   ')).toHaveLength(5)
  })
  test('matches request number case-insensitively', () => {
    expect(searchClaims(CLAIMS, '26tt000002').map((c) => c.id)).toEqual(['b'])
  })
  test('matches a partial substring', () => {
    expect(searchClaims(CLAIMS, '0000').map((c) => c.id)).toEqual(['a', 'b', 'c', 'd', 'e'])
  })
  test('no match returns empty', () => {
    expect(searchClaims(CLAIMS, 'ZZZ')).toEqual([])
  })
})

describe('CLAIM_STATUS_META', () => {
  test('has a non-empty label and color for every status', () => {
    const statuses: ClaimStatus[] = ['processing', 'rejected', 'paid', 'closed']
    for (const status of statuses) {
      expect(CLAIM_STATUS_META[status].label.length).toBeGreaterThan(0)
      expect(CLAIM_STATUS_META[status].colorClass.length).toBeGreaterThan(0)
    }
  })
  test('uses the exact Vietnamese labels', () => {
    expect(CLAIM_STATUS_META.processing.label).toBe('Đang xử lý')
    expect(CLAIM_STATUS_META.rejected.label).toBe('Từ chối')
    expect(CLAIM_STATUS_META.paid.label).toBe('Đã chi trả')
    expect(CLAIM_STATUS_META.closed.label).toBe('Đóng')
  })
})

describe('CLAIM_STATUS_FILTER_OPTIONS', () => {
  test('lists the five options in screenshot order', () => {
    expect(CLAIM_STATUS_FILTER_OPTIONS.map((o) => o.value)).toEqual([
      'all',
      'rejected',
      'paid',
      'processing',
      'closed',
    ])
    expect(CLAIM_STATUS_FILTER_OPTIONS.map((o) => o.label)).toEqual([
      'Tất cả',
      'Từ chối',
      'Đã chi trả',
      'Đang xử lý',
      'Đóng',
    ])
  })
})
