import type { Coupon, CouponRedemption } from '@/features/coupons/types/coupon'

/**
 * Coupons mock data — the single feature-local mock source, per
 * docs/FRONTEND_ARCHITECTURE.md §6/§16. Only
 * src/features/coupons/services/couponService.ts may import this file.
 *
 * MUTABLE in memory, like the Campaigns store: coupons created or
 * disabled in the UI live only for the current browser session. Seed
 * redemptions are illustrative — no real order was discounted. They
 * reference mock customer/order ids; customer and coupon names are
 * joined in by the service.
 */

export type CouponMockScenario = 'normal' | 'empty' | 'error'
export const ERROR_SCENARIO_FLAG: CouponMockScenario = 'error'

export type MockRedemption = Omit<CouponRedemption, 'customerName' | 'couponName'>

const DAY_MS = 24 * 60 * 60 * 1000

function dateOnly(offsetDays: number): string {
  const d = new Date(Date.now() + offsetDays * DAY_MS)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function isoAgo(days: number, hours = 0): string {
  return new Date(Date.now() - days * DAY_MS - hours * 60 * 60 * 1000).toISOString()
}

/** Fixed, readable seed codes so redemptions can reference them. */
const COLLEGE_CODES = [
  'CAMPUS-7K2QXM', 'CAMPUS-4HPWRT', 'CAMPUS-9MZBCE', 'CAMPUS-3TNVYA', 'CAMPUS-8QJDKS',
  'CAMPUS-6RFGHU', 'CAMPUS-2WXEPN', 'CAMPUS-5YCMTB', 'CAMPUS-7VDAZQ', 'CAMPUS-4KSNHJ',
  'CAMPUS-9PEWGR', 'CAMPUS-3BXUMF', 'CAMPUS-8HTCYD', 'CAMPUS-6ZQKVE', 'CAMPUS-2MNRAW',
  'CAMPUS-5GJPXS', 'CAMPUS-7UDEBT', 'CAMPUS-4CWYHN', 'CAMPUS-9RKMZQ', 'CAMPUS-3FVSAP',
]

function seedCoupons(): Coupon[] {
  return [
    {
      id: 'cpn-001',
      name: 'Welcome offer',
      discountType: 'percent',
      discountValue: 10,
      codeMode: 'shared',
      codes: ['WELCOME10'],
      totalUsageLimit: null,
      perCustomerLimit: 1,
      expiresOn: dateOnly(60),
      channel: 'whatsapp',
      disabled: false,
      createdAt: isoAgo(40),
    },
    {
      id: 'cpn-002',
      name: 'College partnership',
      discountType: 'percent',
      discountValue: 20,
      codeMode: 'bulk',
      codes: COLLEGE_CODES,
      totalUsageLimit: COLLEGE_CODES.length,
      perCustomerLimit: 1,
      expiresOn: dateOnly(30),
      channel: 'partner',
      disabled: false,
      createdAt: isoAgo(14),
    },
    {
      id: 'cpn-003',
      name: 'Diwali flat discount',
      discountType: 'flat',
      discountValue: 150,
      codeMode: 'shared',
      codes: ['DIWALI150'],
      totalUsageLimit: 50,
      perCustomerLimit: 1,
      expiresOn: dateOnly(-3),
      channel: 'sms',
      disabled: false,
      createdAt: isoAgo(25),
    },
    {
      id: 'cpn-004',
      name: 'Launch flyer',
      discountType: 'flat',
      discountValue: 50,
      codeMode: 'shared',
      codes: ['FLYER50'],
      totalUsageLimit: 5,
      perCustomerLimit: 1,
      expiresOn: dateOnly(20),
      channel: 'print',
      disabled: false,
      createdAt: isoAgo(10),
    },
    {
      id: 'cpn-005',
      name: 'Staff family discount',
      discountType: 'percent',
      discountValue: 25,
      codeMode: 'shared',
      codes: ['FAMILY25'],
      totalUsageLimit: null,
      perCustomerLimit: 4,
      expiresOn: dateOnly(90),
      channel: 'in_store',
      disabled: true,
      createdAt: isoAgo(30),
    },
  ]
}

function seedRedemptions(): MockRedemption[] {
  const r = (
    n: number,
    couponId: string,
    code: string,
    customer: number,
    discountAmount: number,
    daysAgo: number,
  ): MockRedemption => ({
    id: `rdm-${String(n).padStart(3, '0')}`,
    couponId,
    code,
    customerId: `cust-${String(customer).padStart(3, '0')}`,
    orderId: `ord-${String(n + 100).padStart(3, '0')}`,
    discountAmount,
    redeemedAt: isoAgo(daysAgo, n % 7),
  })

  return [
    r(1, 'cpn-001', 'WELCOME10', 2, 45, 30),
    r(2, 'cpn-001', 'WELCOME10', 6, 62, 21),
    r(3, 'cpn-001', 'WELCOME10', 11, 38, 9),
    r(4, 'cpn-001', 'WELCOME10', 17, 51, 2),
    r(5, 'cpn-002', 'CAMPUS-7K2QXM', 3, 96, 12),
    r(6, 'cpn-002', 'CAMPUS-9MZBCE', 8, 84, 6),
    r(7, 'cpn-002', 'CAMPUS-5YCMTB', 13, 110, 1),
    r(8, 'cpn-003', 'DIWALI150', 1, 150, 8),
    r(9, 'cpn-003', 'DIWALI150', 4, 150, 7),
    r(10, 'cpn-003', 'DIWALI150', 10, 150, 5),
    r(11, 'cpn-004', 'FLYER50', 7, 50, 9),
    r(12, 'cpn-004', 'FLYER50', 12, 50, 8),
    r(13, 'cpn-004', 'FLYER50', 16, 50, 6),
    r(14, 'cpn-004', 'FLYER50', 19, 50, 4),
    r(15, 'cpn-004', 'FLYER50', 23, 50, 3),
  ]
}

/** Mutable in-session stores — see file header. */
let couponStore: Coupon[] = seedCoupons()
const redemptionStore: MockRedemption[] = seedRedemptions()

export const emptyCoupons: Coupon[] = []

export function getCouponStore(): Coupon[] {
  return couponStore
}

export function getRedemptionStore(): MockRedemption[] {
  return redemptionStore
}

export function addCouponToStore(coupon: Coupon): void {
  couponStore = [...couponStore, coupon]
}

export function replaceCouponInStore(coupon: Coupon): void {
  couponStore = couponStore.map((c) => (c.id === coupon.id ? coupon : c))
}
