/**
 * Coupons domain types — Book 3 §12 (MVP, simple version; advanced
 * rules are Phase 2). Mock-only: no coupon or redemption table exists
 * in the backend, and nothing here applies a discount to a real order.
 */

export type CouponDiscountType = 'percent' | 'flat'

/**
 * 'shared' = one code many customers can use (e.g. printed on a flyer).
 * 'bulk'   = many unique codes, each usable once (e.g. partner hand-outs).
 */
export type CouponCodeMode = 'shared' | 'bulk'

/** Where the codes are handed out — Book 3 §12 "channel of distribution". */
export type CouponChannel = 'whatsapp' | 'sms' | 'email' | 'print' | 'partner' | 'in_store'

/** Derived, never stored — see couponStatus() in utils/couponRules.ts. */
export type CouponStatus = 'active' | 'expired' | 'used_up' | 'disabled'

export type Coupon = {
  id: string
  name: string
  discountType: CouponDiscountType
  /** Percent (1-100) or whole rupees, depending on discountType. */
  discountValue: number
  codeMode: CouponCodeMode
  /** One code for 'shared', one per hand-out for 'bulk'. */
  codes: string[]
  /** Total redemptions allowed across everyone; null = unlimited (shared only). */
  totalUsageLimit: number | null
  /** Redemptions allowed per customer. */
  perCustomerLimit: number
  /** Last valid calendar day, YYYY-MM-DD. */
  expiresOn: string
  channel: CouponChannel
  /** Manually switched off by an admin. */
  disabled: boolean
  createdAt: string
}

export type CouponRedemption = {
  id: string
  couponId: string
  couponName: string
  code: string
  customerId: string
  customerName: string
  orderId: string
  /** Discount given, whole rupees. */
  discountAmount: number
  redeemedAt: string
}

export type CouponSummary = Coupon & {
  status: CouponStatus
  redemptionCount: number
}

export type CouponDetail = {
  coupon: CouponSummary
  redemptions: CouponRedemption[]
}

export type CreateCouponInput = {
  name: string
  discountType: CouponDiscountType
  discountValue: number
  codeMode: CouponCodeMode
  /** shared mode: the code the admin typed. */
  code: string
  /** bulk mode: prefix and how many unique codes to generate. */
  bulkPrefix: string
  bulkCount: number
  totalUsageLimit: number | null
  perCustomerLimit: number
  expiresOn: string
  channel: CouponChannel
}
