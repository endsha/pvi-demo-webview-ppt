import { describe, expect, test } from 'vitest'
import { MOCK_POLICY_INFO, MOCK_BENEFITS, MOCK_ACCUMULATION_ORDERS } from './mock-data'
import { sumOrderAmount } from './general-info-helpers'

describe('mock policy info', () => {
  test('matches the reference screenshot values', () => {
    expect(MOCK_POLICY_INFO.fullName).toBe('Trần Việt Dũng')
    expect(MOCK_POLICY_INFO.phone).toBe('+84 389858021')
    expect(MOCK_POLICY_INFO.contractNo).toBe('25/PC-GSM/014635')
    expect(MOCK_POLICY_INFO.accumulatedAmount).toBe(2000000)
  })
})

describe('mock benefits', () => {
  test('has four benefits', () => {
    expect(MOCK_BENEFITS).toHaveLength(4)
  })
  test('benefit ids are unique', () => {
    expect(new Set(MOCK_BENEFITS.map((b) => b.id)).size).toBe(4)
  })
})

describe('mock accumulation orders', () => {
  test('has eight orders', () => {
    expect(MOCK_ACCUMULATION_ORDERS).toHaveLength(8)
  })
  test('order ids are unique', () => {
    expect(new Set(MOCK_ACCUMULATION_ORDERS.map((o) => o.id)).size).toBe(8)
  })
  test('total accumulated equals the policy accumulated amount', () => {
    expect(sumOrderAmount(MOCK_ACCUMULATION_ORDERS)).toBe(MOCK_POLICY_INFO.accumulatedAmount)
  })
})
