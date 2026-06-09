import { describe, expect, test } from 'vitest'
import { MOCK_CLAIM_REQUESTS } from './mock-claims'
import { CLAIM_STATUS_META } from './claims-helpers'

describe('MOCK_CLAIM_REQUESTS', () => {
  test('first row matches the screenshot claim exactly', () => {
    expect(MOCK_CLAIM_REQUESTS[0]).toMatchObject({
      requestNo: '26TT000015',
      status: 'processing',
      createdAt: '2026-06-09T15:22:00',
      accidentDate: '2026-06-01',
      requestedAmount: 1000,
      paidAmount: 0,
    })
  })
  test('has more rows than one page so pagination is demonstrable', () => {
    expect(MOCK_CLAIM_REQUESTS.length).toBeGreaterThan(10)
  })
  test('every row has a known status', () => {
    for (const claim of MOCK_CLAIM_REQUESTS) {
      expect(CLAIM_STATUS_META[claim.status]).toBeDefined()
    }
  })
  test('covers all four statuses', () => {
    const statuses = new Set(MOCK_CLAIM_REQUESTS.map((c) => c.status))
    expect(statuses).toEqual(new Set(['processing', 'rejected', 'paid', 'closed']))
  })
  test('request numbers are unique', () => {
    const nos = MOCK_CLAIM_REQUESTS.map((c) => c.requestNo)
    expect(new Set(nos).size).toBe(nos.length)
  })
  test('paid rows carry a non-zero paid amount', () => {
    const paid = MOCK_CLAIM_REQUESTS.filter((c) => c.status === 'paid')
    expect(paid.length).toBeGreaterThan(0)
    expect(paid.every((c) => c.paidAmount > 0)).toBe(true)
  })
})
