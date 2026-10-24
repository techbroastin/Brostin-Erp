import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { CreateCouponInput } from '@/features/coupons/types/coupon'

/**
 * Pure mock-service tests — no backend, no network. vi.resetModules()
 * gives every test a fresh in-memory coupon store.
 */
describe('couponService', () => {
  let service: typeof import('./couponService')

  const input: CreateCouponInput = {
    name: 'Weekend',
    discountType: 'percent',
    discountValue: 20,
    codeMode: 'shared',
    code: 'WEEKEND20',
    bulkPrefix: '',
    bulkCount: 0,
    totalUsageLimit: null,
    perCustomerLimit: 2,
    expiresOn: '2999-01-01',
    channel: 'sms',
  }

  beforeEach(async () => {
    vi.resetModules()
    service = await import('./couponService')
  })

  test('seed data covers every status', async () => {
    const coupons = await service.listCoupons({ search: '', status: 'all' })
    expect(new Set(coupons.map((c) => c.status))).toEqual(new Set(['active', 'expired', 'used_up', 'disabled']))
  })

  test('filters by status and by code search', async () => {
    const usedUp = await service.listCoupons({ search: '', status: 'used_up' })
    expect(usedUp.map((c) => c.codes[0])).toEqual(['FLYER50'])

    const byCode = await service.listCoupons({ search: 'campus-7k2', status: 'all' })
    expect(byCode.map((c) => c.id)).toEqual(['cpn-002'])
  })

  test('creates a shared coupon and rejects a duplicate code', async () => {
    const created = await service.createCoupon(input)
    expect(created.codes).toEqual(['WEEKEND20'])
    expect(created.perCustomerLimit).toBe(2)
    await expect(service.createCoupon({ ...input, code: 'welcome10' })).rejects.toThrow('already in use')
  })

  test('bulk coupons get unique single-use codes', async () => {
    const created = await service.createCoupon({
      ...input,
      codeMode: 'bulk',
      bulkPrefix: 'GYM',
      bulkCount: 25,
      totalUsageLimit: 999,
      perCustomerLimit: 5,
    })
    expect(created.codes).toHaveLength(25)
    expect(created.totalUsageLimit).toBe(25)
    expect(created.perCustomerLimit).toBe(1)
  })

  test('redemption log joins customer and coupon names, newest first', async () => {
    const log = await service.listRedemptions({ search: '' })
    expect(log).toHaveLength(15)
    expect(log.every((r) => r.customerName !== 'Unknown customer' && r.couponName !== 'Unknown coupon')).toBe(true)
    const times = log.map((r) => new Date(r.redeemedAt).getTime())
    expect([...times].sort((a, b) => b - a)).toEqual(times)
  })

  test('disabling keeps past redemptions and can be undone', async () => {
    await service.setCouponDisabled('cpn-001', true)
    let detail = await service.getCouponDetail('cpn-001')
    expect(detail?.coupon.status).toBe('disabled')
    expect(detail?.redemptions).toHaveLength(4)

    await service.setCouponDisabled('cpn-001', false)
    detail = await service.getCouponDetail('cpn-001')
    expect(detail?.coupon.status).toBe('active')
  })

  test('the error scenario throws', async () => {
    await expect(service.listCoupons({ search: '', status: 'all' }, 'error')).rejects.toThrow()
  })
})
