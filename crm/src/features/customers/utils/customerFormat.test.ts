import { describe, expect, test } from 'vitest'
import { formatCalendarDate, formatRupees, formatTimestampDate } from './customerFormat'
import { normalCustomers } from '@/features/customers/mock/customers.mock'

describe('customerFormat', () => {
  test('calendar dates keep their day regardless of timezone', () => {
    expect(formatCalendarDate('1990-03-01')).toBe('1 Mar 1990')
  })

  test('missing values render as a dash', () => {
    expect(formatCalendarDate(null)).toBe('—')
    expect(formatTimestampDate(null)).toBe('—')
  })

  test('rupees use Indian digit grouping', () => {
    expect(formatRupees(125000)).toBe('₹1,25,000')
  })
})

describe('customer mock — Book 3 §1 fields stay internally consistent', () => {
  test('never-ordered customers have no visit, spend, outlet or segment', () => {
    for (const c of normalCustomers.filter((c) => c.orderCount === 0)) {
      expect(c.firstVisitAt).toBeNull()
      expect(c.lastOrderAt).toBeNull()
      expect(c.lifetimeSpend).toBe(0)
      expect(c.preferredOutlets).toEqual([])
      expect(c.segments).toEqual([])
    }
  })

  test('first visit is never after last order', () => {
    for (const c of normalCustomers.filter((c) => c.lastOrderAt)) {
      expect(new Date(c.firstVisitAt!).getTime()).toBeLessThan(new Date(c.lastOrderAt!).getTime())
    }
  })

  test('only customers with loyalty points are enrolled in Loyalty', () => {
    for (const c of normalCustomers) {
      expect(c.activePrograms.includes('Loyalty')).toBe(c.loyaltyPoints !== null)
    }
  })
})
