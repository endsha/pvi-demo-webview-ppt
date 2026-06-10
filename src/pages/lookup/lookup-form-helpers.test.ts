import { describe, expect, test } from 'vitest'
import {
  REGISTERED_PHONE,
  REGISTERED_PHONE_DISPLAY,
  isRegisteredPhone,
  normalizePhone,
} from './lookup-form-helpers'

describe('normalizePhone', () => {
  test('strips +84 country code and spaces', () => {
    expect(normalizePhone('+84 389858021')).toBe('389858021')
  })

  test('strips leading zero from local format', () => {
    expect(normalizePhone('0389858021')).toBe('389858021')
  })

  test('drops non-digit characters', () => {
    expect(normalizePhone('(038) 985-8021')).toBe('389858021')
  })

  test('returns empty string when no digits present', () => {
    expect(normalizePhone('abc')).toBe('')
  })
})

describe('isRegisteredPhone', () => {
  test('matches the registered phone in +84 format', () => {
    expect(isRegisteredPhone(REGISTERED_PHONE)).toBe(true)
  })

  test('matches the same number typed in local 0 format', () => {
    expect(isRegisteredPhone('0389858021')).toBe(true)
  })

  test('rejects an unknown number', () => {
    expect(isRegisteredPhone('0900000000')).toBe(false)
  })

  test('rejects empty input', () => {
    expect(isRegisteredPhone('')).toBe(false)
  })
})

describe('REGISTERED_PHONE_DISPLAY', () => {
  test('renders the registered number in local 0 format', () => {
    expect(REGISTERED_PHONE_DISPLAY).toBe('0389858021')
  })
})
