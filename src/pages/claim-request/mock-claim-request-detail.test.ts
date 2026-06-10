import { describe, expect, test } from 'vitest'
import { MOCK_CLAIM_REQUESTS } from '@/pages/general-info/mock-claims'
import {
  buildClaimDetail,
  CLAIM_DETAIL_OVERRIDES,
  MOCK_CLAIM_DETAIL,
} from './mock-claim-request-detail'

const byId = (id: string) => {
  const claim = MOCK_CLAIM_REQUESTS.find((c) => c.id === id)
  if (!claim) throw new Error(`Missing mock claim ${id}`)
  return claim
}

describe('buildClaimDetail', () => {
  test('returns the base template when no claim is provided', () => {
    expect(buildClaimDetail(undefined)).toBe(MOCK_CLAIM_DETAIL)
  })

  test('takes accidentDate and requestedAmount from the list row', () => {
    const claim = byId('c2')
    const detail = buildClaimDetail(claim)
    expect(detail.requestedAmount).toBe(claim.requestedAmount)
    expect(detail.accidentDate?.format('YYYY-MM-DD')).toBe(claim.accidentDate)
  })

  test('applies the per-claim narrative override', () => {
    const detail = buildClaimDetail(byId('c2'))
    expect(detail.diagnosis).toContain('xương đòn')
    expect(detail.treatmentType).toBe('inpatient')
    expect(detail.bankName).toBe('BIDV')
  })

  test('different claims produce different detail', () => {
    const d1 = buildClaimDetail(byId('c1'))
    const d3 = buildClaimDetail(byId('c3'))
    expect(d1.diagnosis).not.toBe(d3.diagnosis)
    expect(d1.accidentPlace).not.toBe(d3.accidentPlace)
    expect(d1.accountNumber).not.toBe(d3.accountNumber)
  })

  test('every list claim has a detail override', () => {
    for (const claim of MOCK_CLAIM_REQUESTS) {
      expect(CLAIM_DETAIL_OVERRIDES[claim.id]).toBeDefined()
    }
  })

  test('detail accident date matches its list row for every claim', () => {
    for (const claim of MOCK_CLAIM_REQUESTS) {
      const detail = buildClaimDetail(claim)
      expect(detail.accidentDate?.format('YYYY-MM-DD')).toBe(claim.accidentDate)
      expect(detail.requestedAmount).toBe(claim.requestedAmount)
    }
  })
})
