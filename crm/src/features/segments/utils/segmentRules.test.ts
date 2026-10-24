import { describe, expect, test } from 'vitest'
import type { Customer } from '@/features/customers/types/customer'
import { describeRule, evaluateSegment, matchesRule } from './segmentRules'
import { ruleSchema, segmentSchema } from '@/features/segments/schemas/segmentSchema'

const NOW = new Date('2026-10-24T12:00:00Z').getTime()
const DAY_MS = 24 * 60 * 60 * 1000

function customer(overrides: Partial<Customer>): Customer {
  return {
    id: 'c',
    name: 'Test',
    phone: '+91 900',
    dateOfBirth: null,
    anniversaryDate: null,
    firstVisitAt: null,
    lastOrderAt: null,
    orderCount: 0,
    lifetimeSpend: 0,
    preferredOutlets: [],
    preferenceTags: [],
    whatsappOptIn: false,
    segments: [],
    activePrograms: [],
    loyaltyPoints: null,
    alert: null,
    ...overrides,
  }
}

describe('segmentRules', () => {
  test('numeric operators compare against the parsed value', () => {
    const c = customer({ lifetimeSpend: 3000 })
    expect(matchesRule(c, { field: 'lifetime_spend', operator: 'gt', value: '3000' }, NOW)).toBe(false)
    expect(matchesRule(c, { field: 'lifetime_spend', operator: 'gte', value: '3000' }, NOW)).toBe(true)
    expect(matchesRule(c, { field: 'lifetime_spend', operator: 'eq', value: '3000' }, NOW)).toBe(true)
    expect(matchesRule(c, { field: 'lifetime_spend', operator: 'lt', value: '3000' }, NOW)).toBe(false)
  })

  test('days since last order never matches a customer who has not ordered', () => {
    const never = customer({ lastOrderAt: null })
    expect(matchesRule(never, { field: 'days_since_last_order', operator: 'gte', value: '0' }, NOW)).toBe(false)

    const lapsed = customer({ lastOrderAt: new Date(NOW - 25 * DAY_MS).toISOString() })
    expect(matchesRule(lapsed, { field: 'days_since_last_order', operator: 'gte', value: '21' }, NOW)).toBe(true)
  })

  test('text and boolean rules', () => {
    const c = customer({ preferredOutlets: ['Main Branch'], preferenceTags: ['Spicy'], whatsappOptIn: true })
    expect(matchesRule(c, { field: 'preferred_outlet', operator: 'is', value: 'Main Branch' }, NOW)).toBe(true)
    expect(matchesRule(c, { field: 'preference_tag', operator: 'is', value: 'Mild' }, NOW)).toBe(false)
    expect(matchesRule(c, { field: 'whatsapp_opt_in', operator: 'is', value: 'true' }, NOW)).toBe(true)
    expect(matchesRule(c, { field: 'whatsapp_opt_in', operator: 'is', value: 'false' }, NOW)).toBe(false)
  })

  test("match 'all' requires every rule, 'any' requires one", () => {
    const a = customer({ id: 'a', lifetimeSpend: 6000, orderCount: 1 })
    const b = customer({ id: 'b', lifetimeSpend: 100, orderCount: 8 })
    const rules = [
      { field: 'lifetime_spend' as const, operator: 'gt' as const, value: '5000' },
      { field: 'order_count' as const, operator: 'gte' as const, value: '6' },
    ]
    expect(evaluateSegment({ match: 'all', rules }, [a, b], NOW)).toEqual([])
    expect(evaluateSegment({ match: 'any', rules }, [a, b], NOW).map((c) => c.id)).toEqual(['a', 'b'])
  })

  test('a definition with no rules matches nobody', () => {
    expect(evaluateSegment({ match: 'any', rules: [] }, [customer({})], NOW)).toEqual([])
  })

  test('describeRule reads as a sentence', () => {
    expect(describeRule({ field: 'lifetime_spend', operator: 'gte', value: '3000' })).toBe(
      'Lifetime spend at least ₹3,000',
    )
    expect(describeRule({ field: 'whatsapp_opt_in', operator: 'is', value: 'false' })).toBe(
      'WhatsApp opt-in: not opted in',
    )
  })
})

describe('segmentSchema', () => {
  test('rejects non-numeric values for numeric fields and empty text values', () => {
    expect(ruleSchema.safeParse({ field: 'order_count', operator: 'gte', value: 'abc' }).success).toBe(false)
    expect(ruleSchema.safeParse({ field: 'order_count', operator: 'is', value: '3' }).success).toBe(false)
    expect(ruleSchema.safeParse({ field: 'preferred_outlet', operator: 'is', value: '' }).success).toBe(false)
    expect(ruleSchema.safeParse({ field: 'order_count', operator: 'gte', value: '3' }).success).toBe(true)
  })

  test('requires a name and at least one rule', () => {
    expect(segmentSchema.safeParse({ name: '', description: '', match: 'all', rules: [] }).success).toBe(false)
    expect(
      segmentSchema.safeParse({
        name: 'Regulars',
        description: '',
        match: 'all',
        rules: [{ field: 'order_count', operator: 'gte', value: '3' }],
      }).success,
    ).toBe(true)
  })
})
