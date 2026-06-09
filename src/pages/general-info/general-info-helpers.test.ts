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

import {
  filterOrdersByVehicle,
  filterBenefitsByVehicle,
  searchOrders,
  sortOrders,
  paginate,
  sumOrderAmount,
} from './general-info-helpers'
import type { AccumulationOrder, Benefit } from './general-info-helpers'

const order = (id: string, vehicle: 'motorbike' | 'car', code: string, at: string): AccumulationOrder => ({
  id,
  vehicle,
  tripCode: code,
  amount: 250000,
  completedAt: at,
})

const ORDERS: AccumulationOrder[] = [
  order('a', 'motorbike', 'AAA111', '2025-02-18T08:20:00'),
  order('b', 'car', 'BBB222', '2025-02-18T19:15:00'),
  order('c', 'motorbike', 'CCC333', '2025-02-18T15:36:00'),
]

describe('filterOrdersByVehicle', () => {
  test('all returns every order', () => {
    expect(filterOrdersByVehicle(ORDERS, 'all')).toHaveLength(3)
  })
  test('motorbike returns only motorbikes', () => {
    expect(filterOrdersByVehicle(ORDERS, 'motorbike').map((o) => o.id)).toEqual(['a', 'c'])
  })
  test('does not mutate input', () => {
    const copy = [...ORDERS]
    filterOrdersByVehicle(ORDERS, 'car')
    expect(ORDERS).toEqual(copy)
  })
})

describe('filterBenefitsByVehicle', () => {
  const benefit = (id: string, vehicle: 'all' | 'motorbike' | 'car'): Benefit => ({
    id,
    order: 1,
    title: id,
    maxLimit: 1000,
    vehicle,
    detail: { accumulatedLimit: 1000, paidAmount: 0, estimatedClaim: 0 },
  })
  const BENEFITS = [benefit('x', 'all'), benefit('y', 'car')]
  test('motorbike filter keeps all-applicable benefits', () => {
    expect(filterBenefitsByVehicle(BENEFITS, 'motorbike').map((b) => b.id)).toEqual(['x'])
  })
  test('all filter keeps everything', () => {
    expect(filterBenefitsByVehicle(BENEFITS, 'all')).toHaveLength(2)
  })
})

describe('searchOrders', () => {
  test('empty query returns all', () => {
    expect(searchOrders(ORDERS, '')).toHaveLength(3)
  })
  test('matches trip code case-insensitively', () => {
    expect(searchOrders(ORDERS, 'bbb').map((o) => o.id)).toEqual(['b'])
  })
  test('trims whitespace', () => {
    expect(searchOrders(ORDERS, '  ccc ').map((o) => o.id)).toEqual(['c'])
  })
  test('no match returns empty', () => {
    expect(searchOrders(ORDERS, 'zzz')).toEqual([])
  })
})

describe('sortOrders', () => {
  test('newest first by completedAt desc', () => {
    expect(sortOrders(ORDERS, 'newest').map((o) => o.id)).toEqual(['b', 'c', 'a'])
  })
  test('oldest first by completedAt asc', () => {
    expect(sortOrders(ORDERS, 'oldest').map((o) => o.id)).toEqual(['a', 'c', 'b'])
  })
  test('does not mutate input', () => {
    const copy = [...ORDERS]
    sortOrders(ORDERS, 'newest')
    expect(ORDERS).toEqual(copy)
  })
})

describe('paginate', () => {
  const items = [1, 2, 3, 4, 5]
  test('returns the requested page slice (1-based)', () => {
    expect(paginate(items, 2, 2)).toEqual([3, 4])
  })
  test('clamps page below 1 to first page', () => {
    expect(paginate(items, 0, 2)).toEqual([1, 2])
  })
  test('out-of-range page returns empty', () => {
    expect(paginate(items, 9, 2)).toEqual([])
  })
})

describe('sumOrderAmount', () => {
  test('sums amounts', () => {
    expect(sumOrderAmount(ORDERS)).toBe(750000)
  })
  test('empty list sums to zero', () => {
    expect(sumOrderAmount([])).toBe(0)
  })
})
