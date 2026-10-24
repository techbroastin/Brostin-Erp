import { listCustomers } from '@/features/customers/services/customerService'
import type {
  Coupon,
  CouponDetail,
  CouponRedemption,
  CouponStatus,
  CouponSummary,
  CreateCouponInput,
} from '@/features/coupons/types/coupon'
import { couponStatus, generateBulkCodes, normalizeCode } from '@/features/coupons/utils/couponRules'
import {
  getCouponStore,
  getRedemptionStore,
  addCouponToStore,
  replaceCouponInStore,
  emptyCoupons,
  ERROR_SCENARIO_FLAG,
  type CouponMockScenario,
  type MockRedemption,
} from '@/features/coupons/mock/coupons.mock'

const ALL_CUSTOMERS_PAGE_SIZE = 1000

export type CouponListParams = {
  search: string
  status: CouponStatus | 'all'
}

export type RedemptionListParams = {
  search: string
}

/**
 * The swap point for real data later — nothing above this file knows
 * the data is mocked. Customer names come from the Customers service
 * (which also supplies the simulated latency).
 */
async function getCustomerNames(): Promise<Map<string, string>> {
  const { items } = await listCustomers({ search: '', page: 1, pageSize: ALL_CUSTOMERS_PAGE_SIZE, sortBy: 'name' })
  return new Map(items.map((c) => [c.id, c.name]))
}

function getSourceDataset(scenario: CouponMockScenario): Coupon[] {
  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load coupons.')
  }
  return scenario === 'empty' ? emptyCoupons : getCouponStore()
}

function withNames(redemptions: MockRedemption[], names: Map<string, string>): CouponRedemption[] {
  const couponNames = new Map(getCouponStore().map((c) => [c.id, c.name]))
  return redemptions
    .map((r) => ({
      ...r,
      customerName: names.get(r.customerId) ?? 'Unknown customer',
      couponName: couponNames.get(r.couponId) ?? 'Unknown coupon',
    }))
    .sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime())
}

function summarize(coupon: Coupon): CouponSummary {
  const redemptionCount = getRedemptionStore().filter((r) => r.couponId === coupon.id).length
  return { ...coupon, redemptionCount, status: couponStatus(coupon, redemptionCount) }
}

export async function listCoupons(
  params: CouponListParams,
  scenario: CouponMockScenario = 'normal',
): Promise<CouponSummary[]> {
  await getCustomerNames()
  const search = params.search.trim().toLowerCase()
  return getSourceDataset(scenario)
    .map(summarize)
    .filter((c) => params.status === 'all' || c.status === params.status)
    .filter(
      (c) =>
        !search ||
        c.name.toLowerCase().includes(search) ||
        c.codes.some((code) => code.toLowerCase().includes(search)),
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function getCouponDetail(
  id: string,
  scenario: CouponMockScenario = 'normal',
): Promise<CouponDetail | null> {
  const names = await getCustomerNames()
  const coupon = getSourceDataset(scenario).find((c) => c.id === id)
  if (!coupon) return null
  return {
    coupon: summarize(coupon),
    redemptions: withNames(
      getRedemptionStore().filter((r) => r.couponId === id),
      names,
    ),
  }
}

/** Book 3 §12 Redemption Log — every redemption across all coupons, newest first. */
export async function listRedemptions(
  params: RedemptionListParams,
  scenario: CouponMockScenario = 'normal',
): Promise<CouponRedemption[]> {
  const names = await getCustomerNames()
  const coupons = getSourceDataset(scenario)
  const couponIds = new Set(coupons.map((c) => c.id))
  const search = params.search.trim().toLowerCase()
  return withNames(
    getRedemptionStore().filter((r) => couponIds.has(r.couponId)),
    names,
  ).filter(
    (r) => !search || r.code.toLowerCase().includes(search) || r.customerName.toLowerCase().includes(search),
  )
}

/**
 * In-memory mock store only — lost on reload. Codes must be unique
 * across every coupon, so a redemption always resolves to one coupon.
 * Bulk codes are single-use: one redemption per code, so the total
 * limit equals the number of codes.
 */
export async function createCoupon(input: CreateCouponInput): Promise<Coupon> {
  await getCustomerNames()
  const taken = new Set(getCouponStore().flatMap((c) => c.codes))

  let codes: string[]
  if (input.codeMode === 'shared') {
    const code = normalizeCode(input.code)
    if (taken.has(code)) throw new Error('This coupon code is already in use.')
    codes = [code]
  } else {
    codes = generateBulkCodes(input.bulkPrefix, input.bulkCount, taken)
  }

  const coupon: Coupon = {
    id: `cpn-${Date.now()}`,
    name: input.name.trim(),
    discountType: input.discountType,
    discountValue: input.discountValue,
    codeMode: input.codeMode,
    codes,
    totalUsageLimit: input.codeMode === 'bulk' ? codes.length : input.totalUsageLimit,
    perCustomerLimit: input.codeMode === 'bulk' ? 1 : input.perCustomerLimit,
    expiresOn: input.expiresOn,
    channel: input.channel,
    disabled: false,
    createdAt: new Date().toISOString(),
  }
  addCouponToStore(coupon)
  return coupon
}

/** Switch a coupon off (or back on). Past redemptions are kept. */
export async function setCouponDisabled(id: string, disabled: boolean): Promise<Coupon> {
  await getCustomerNames()
  const existing = getCouponStore().find((c) => c.id === id)
  if (!existing) throw new Error('Coupon not found.')
  const updated = { ...existing, disabled }
  replaceCouponInStore(updated)
  return updated
}
