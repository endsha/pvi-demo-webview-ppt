import { describe, expect, test } from 'vitest'
import { formatVnd, formatDate, formatDateTime } from './general-info-helpers'

describe('formatVnd', () => {
  test('formats millions with dot separators and VND suffix', () => {
    expect(formatVnd(2000000)).toBe('2.000.000 VND')
  })

  test('formats zero', () => {
    expect(formatVnd(0)).toBe('0 VND')
  })

  test('formats hundred-thousands', () => {
    expect(formatVnd(120000)).toBe('120.000 VND')
  })
})

describe('formatDate', () => {
  test('formats ISO date as DD/MM/YYYY', () => {
    expect(formatDate('2025-03-06')).toBe('06/03/2025')
  })
})

describe('formatDateTime', () => {
  test('formats ISO datetime as DD/MM/YYYY HH:mm', () => {
    expect(formatDateTime('2025-02-18T19:15:00')).toBe('18/02/2025 19:15')
  })
})
