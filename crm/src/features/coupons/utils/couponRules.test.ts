import { describe, expect, test } from 'vitest'
import type { Coupon } from '@/features/coupons/types/coupon'
import { couponStatus, formatDiscount, generateBulkCodes, couponCodesToCsv } from './couponRules'
import { couponSchema, toCreateCouponInput, type CouponFormValues } from '@/features/coupons/schemas/couponSchema'

const coupon: Coupon = {
  id: 'c1',
  name: 'Test',
  discountType: 'percent',
  discountValue: 10,
  codeMode: 'shared',
  codes: ['TEST10'],
  totalUsageLimit: 3,
  perCustomerLimit: 1,
  expiresOn: '2026-10-24',
  channel: 'print',
  disabled: false,
  createdAt: '2026-10-01T00:00:00Z',
}

describe('couponStatus', () => {
  test('is valid through the whole expiry day', () => {
    expect(couponStatus(coupon, 0, '2026-10-24')).toBe('active')
    expect(couponStatus(coupon, 0, '2026-10-25')).toBe('expired')
  })

  test('is used up when the total limit is reached', () => {
    expect(couponStatus(coupon, 2, '2026-10-20')).toBe('active')
    expect(couponStatus(coupon, 3, '2026-10-20')).toBe('used_up')
    expect(couponStatus({ ...coupon, totalUsageLimit: null }, 999, '2026-10-20')).toBe('active')
  })

  test('disabled wins over every other status', () => {
    expect(couponStatus({ ...coupon, disabled: true }, 3, '2026-12-01')).toBe('disabled')
  })
})

describe('generateBulkCodes', () => {
  test('creates the requested number of unique, prefixed, unambiguous codes', () => {
    const codes = generateBulkCodes('campus', 200, new Set())
    expect(codes).toHaveLength(200)
    expect(new Set(codes).size).toBe(200)
    for (const code of codes) expect(code).toMatch(/^CAMPUS-[A-HJ-NP-Z2-9]{6}$/)
  })

  test('works without a prefix', () => {
    expect(generateBulkCodes('', 3, new Set())[0]).toMatch(/^[A-HJ-NP-Z2-9]{6}$/)
  })
})

test('formatDiscount', () => {
  expect(formatDiscount({ discountType: 'percent', discountValue: 15 })).toBe('15% off')
  expect(formatDiscount({ discountType: 'flat', discountValue: 1500 })).toBe('₹1,500 off')
})

test('couponCodesToCsv marks used codes', () => {
  const csv = couponCodesToCsv({ ...coupon, codes: ['A1', 'B2'] }, [
    {
      id: 'r',
      couponId: 'c1',
      couponName: 'Test',
      code: 'B2',
      customerId: 'x',
      customerName: 'X',
      orderId: 'o',
      discountAmount: 1,
      redeemedAt: '',
    },
  ])
  expect(csv).toBe('Code,Status\n"A1",Unused\n"B2",Used')
})

describe('couponSchema', () => {
  const base: CouponFormValues = {
    name: 'Weekend',
    discountType: 'percent',
    discountValue: '20',
    codeMode: 'shared',
    code: 'weekend20',
    bulkPrefix: '',
    bulkCount: '50',
    totalUsageLimit: '',
    perCustomerLimit: '1',
    expiresOn: '2999-01-01',
    channel: 'sms',
  }

  test('accepts a valid shared coupon and normalizes it', () => {
    const parsed = couponSchema.parse(base)
    const input = toCreateCouponInput(parsed)
    expect(input.code).toBe('WEEKEND20')
    expect(input.totalUsageLimit).toBeNull()
    expect(input.discountValue).toBe(20)
  })

  test('rejects a percentage above 100 and a past expiry', () => {
    expect(couponSchema.safeParse({ ...base, discountValue: '120' }).success).toBe(false)
    expect(couponSchema.safeParse({ ...base, expiresOn: '2000-01-01' }).success).toBe(false)
  })

  test('validates only the fields of the chosen code mode', () => {
    expect(couponSchema.safeParse({ ...base, code: 'x!' }).success).toBe(false)
    // Shared-only fields are ignored in bulk mode.
    expect(couponSchema.safeParse({ ...base, codeMode: 'bulk', code: 'x!', perCustomerLimit: '' }).success).toBe(true)
    expect(couponSchema.safeParse({ ...base, codeMode: 'bulk', bulkCount: '501' }).success).toBe(false)
  })
})
