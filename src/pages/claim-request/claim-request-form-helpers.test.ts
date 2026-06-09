import { describe, expect, test } from 'vitest'
import {
  areAllCommitmentsAccepted,
  formatVndInput,
  parseVndInput,
  COMMITMENT_FIELDS,
  COMMITMENT_STATEMENTS,
  PAYMENT_CASE_OPTIONS,
  TREATMENT_TYPE_OPTIONS,
} from './claim-request-form-helpers'

describe('areAllCommitmentsAccepted', () => {
  test('false when values is undefined', () => {
    expect(areAllCommitmentsAccepted(undefined)).toBe(false)
  })
  test('false when only some are accepted', () => {
    expect(
      areAllCommitmentsAccepted({
        commitTruthful: true,
        commitThirdParty: true,
        commitSignature: false,
      }),
    ).toBe(false)
  })
  test('false when a field is missing', () => {
    expect(areAllCommitmentsAccepted({ commitTruthful: true })).toBe(false)
  })
  test('true only when all three are accepted', () => {
    expect(
      areAllCommitmentsAccepted({
        commitTruthful: true,
        commitThirdParty: true,
        commitSignature: true,
      }),
    ).toBe(true)
  })
})

describe('formatVndInput', () => {
  test('returns empty string for empty input', () => {
    expect(formatVndInput(undefined)).toBe('')
    expect(formatVndInput('')).toBe('')
  })
  test('inserts thousands separators', () => {
    expect(formatVndInput(1000)).toBe('1,000')
    expect(formatVndInput(1234567)).toBe('1,234,567')
  })
})

describe('parseVndInput', () => {
  test('strips non-digits', () => {
    expect(parseVndInput('1,234,567')).toBe('1234567')
    expect(parseVndInput('')).toBe('')
    expect(parseVndInput(undefined)).toBe('')
  })
})

describe('option/constant lists', () => {
  test('COMMITMENT_FIELDS matches COMMITMENT_STATEMENTS names', () => {
    expect(COMMITMENT_FIELDS).toEqual(COMMITMENT_STATEMENTS.map((s) => s.name))
  })
  test('payment cases are in screenshot order', () => {
    expect(PAYMENT_CASE_OPTIONS.map((o) => o.label)).toEqual([
      'Tử vong do tai nạn',
      'Thương tật toàn bộ vĩnh viễn do tai nạn',
      'Chi phí y tế do tai nạn',
      'Trợ cấp nằm viện do tai nạn',
    ])
  })
  test('treatment types are Ngoại trú then Nội trú', () => {
    expect(TREATMENT_TYPE_OPTIONS.map((o) => o.label)).toEqual(['Ngoại trú', 'Nội trú'])
  })
})
