import { z } from 'zod'
import type { CouponChannel, CreateCouponInput } from '@/features/coupons/types/coupon'
import { COUPON_CHANNELS, MAX_BULK_CODES, normalizeCode, todayLocal } from '@/features/coupons/utils/couponRules'

const MAX_FLAT_DISCOUNT = 10000
const WHOLE_NUMBER = /^\d+$/
const CODE_PATTERN = /^[A-Z0-9-]{3,20}$/
const PREFIX_PATTERN = /^[A-Z0-9]{0,10}$/

/**
 * Coupon Builder form schema — docs/FRONTEND_ARCHITECTURE.md §19.
 * Numeric inputs stay strings in the form (what <input> holds) and are
 * converted by toCreateCouponInput(). Only Book 3 §12's simple rules
 * are validated; minimum order value and item restrictions are Phase 2.
 */
export const couponSchema = z
  .object({
    name: z.string().trim().min(1, 'Coupon name is required.').max(80, 'Coupon name is too long.'),
    discountType: z.enum(['percent', 'flat']),
    discountValue: z.string().trim(),
    codeMode: z.enum(['shared', 'bulk']),
    code: z.string(),
    bulkPrefix: z.string(),
    bulkCount: z.string().trim(),
    totalUsageLimit: z.string().trim(),
    perCustomerLimit: z.string().trim(),
    expiresOn: z.string().min(1, 'Pick an expiry date.'),
    channel: z.enum(COUPON_CHANNELS as [CouponChannel, ...CouponChannel[]]),
  })
  .superRefine((v, ctx) => {
    const issue = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message })

    const value = Number(v.discountValue)
    if (!WHOLE_NUMBER.test(v.discountValue) || value < 1) {
      issue('discountValue', 'Enter a whole number above 0.')
    } else if (v.discountType === 'percent' && value > 100) {
      issue('discountValue', 'A percentage discount cannot be more than 100.')
    } else if (v.discountType === 'flat' && value > MAX_FLAT_DISCOUNT) {
      issue('discountValue', `A flat discount cannot be more than ₹${MAX_FLAT_DISCOUNT.toLocaleString('en-IN')}.`)
    }

    if (v.codeMode === 'shared') {
      if (!CODE_PATTERN.test(normalizeCode(v.code))) {
        issue('code', 'Use 3-20 letters, numbers or dashes.')
      }
      if (v.totalUsageLimit !== '' && (!WHOLE_NUMBER.test(v.totalUsageLimit) || Number(v.totalUsageLimit) < 1)) {
        issue('totalUsageLimit', 'Enter a whole number above 0, or leave blank for no limit.')
      }
      if (!WHOLE_NUMBER.test(v.perCustomerLimit) || Number(v.perCustomerLimit) < 1) {
        issue('perCustomerLimit', 'Enter a whole number above 0.')
      }
    } else {
      if (!PREFIX_PATTERN.test(normalizeCode(v.bulkPrefix))) {
        issue('bulkPrefix', 'Use up to 10 letters or numbers.')
      }
      const count = Number(v.bulkCount)
      if (!WHOLE_NUMBER.test(v.bulkCount) || count < 1 || count > MAX_BULK_CODES) {
        issue('bulkCount', `Enter a number from 1 to ${MAX_BULK_CODES}.`)
      }
    }

    if (v.expiresOn && v.expiresOn < todayLocal()) {
      issue('expiresOn', 'The expiry date cannot be in the past.')
    }
  })

export type CouponFormValues = z.infer<typeof couponSchema>

export function toCreateCouponInput(v: CouponFormValues): CreateCouponInput {
  return {
    name: v.name.trim(),
    discountType: v.discountType,
    discountValue: Number(v.discountValue),
    codeMode: v.codeMode,
    code: normalizeCode(v.code),
    bulkPrefix: normalizeCode(v.bulkPrefix),
    bulkCount: Number(v.bulkCount),
    totalUsageLimit: v.totalUsageLimit === '' ? null : Number(v.totalUsageLimit),
    perCustomerLimit: Number(v.perCustomerLimit),
    expiresOn: v.expiresOn,
    channel: v.channel,
  }
}
