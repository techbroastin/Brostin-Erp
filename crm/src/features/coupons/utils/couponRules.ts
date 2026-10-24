import type {
  Coupon,
  CouponChannel,
  CouponRedemption,
  CouponStatus,
} from '@/features/coupons/types/coupon'

export const CHANNEL_LABELS: Record<CouponChannel, string> = {
  whatsapp: 'WhatsApp',
  sms: 'SMS',
  email: 'Email',
  print: 'Print',
  partner: 'Partner',
  in_store: 'In store',
}

export const COUPON_STATUS_LABELS: Record<CouponStatus, string> = {
  active: 'Active',
  expired: 'Expired',
  used_up: 'Used up',
  disabled: 'Disabled',
}

export const COUPON_CHANNELS = Object.keys(CHANNEL_LABELS) as CouponChannel[]

/** Unambiguous characters only — no 0/O, 1/I/L — so printed codes read cleanly. */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const BULK_SUFFIX_LENGTH = 6

export const MAX_BULK_CODES = 500

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase()
}

function randomSuffix(): string {
  const bytes = new Uint32Array(BULK_SUFFIX_LENGTH)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')
}

/**
 * `count` unique codes like "BRO-7K2QXM", avoiding any code in `taken`.
 * Collisions are astronomically rare at this size but still re-rolled.
 */
export function generateBulkCodes(prefix: string, count: number, taken: Set<string>): string[] {
  const head = normalizeCode(prefix)
  const codes = new Set<string>()
  while (codes.size < count) {
    const code = head ? `${head}-${randomSuffix()}` : randomSuffix()
    if (!taken.has(code)) codes.add(code)
  }
  return [...codes]
}

/** Today as YYYY-MM-DD in local time. */
export function todayLocal(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/**
 * Status precedence: disabled → expired → used up → active. A coupon is
 * valid through the whole of its expiry day.
 */
export function couponStatus(coupon: Coupon, redemptionCount: number, today: string = todayLocal()): CouponStatus {
  if (coupon.disabled) return 'disabled'
  if (coupon.expiresOn < today) return 'expired'
  if (coupon.totalUsageLimit !== null && redemptionCount >= coupon.totalUsageLimit) return 'used_up'
  return 'active'
}

export function formatDiscount(coupon: Pick<Coupon, 'discountType' | 'discountValue'>): string {
  return coupon.discountType === 'percent'
    ? `${coupon.discountValue}% off`
    : `₹${coupon.discountValue.toLocaleString('en-IN')} off`
}

/** Which codes have been used, for the bulk codes list and CSV. */
export function usedCodes(redemptions: CouponRedemption[]): Set<string> {
  return new Set(redemptions.map((r) => r.code))
}

export function couponCodesToCsv(coupon: Coupon, redemptions: CouponRedemption[]): string {
  const used = usedCodes(redemptions)
  const rows = coupon.codes.map((code) => `"${code}",${used.has(code) ? 'Used' : 'Unused'}`)
  return ['Code,Status', ...rows].join('\n')
}
