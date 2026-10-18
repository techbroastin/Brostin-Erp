/**
 * Referrals feature types — provisional frontend view models, not the
 * Broastin standard data model (NOT YET FINALIZED per
 * docs/FRONTEND_ARCHITECTURE.md §16).
 *
 * Per docs/IMPLEMENTATION_PLAN.md §14 and docs/NAVIGATION.md §14, no
 * referral business rules are finalized: qualification criteria, the
 * event that makes a referral "successful", reward eligibility/
 * calculation, and any referral-to-purchase requirement are all
 * UNDEFINED and are not invented here. `ReferralStatus` is intentionally
 * limited to two minimal, purely descriptive illustrative values
 * ('pending' | 'completed') — not a finalized lifecycle or qualification
 * model. There is no approve/reject/resolve/payout action anywhere in
 * this feature (view-only, same discipline as Feedback).
 *
 * `ReferralRecord.referrerCustomerName` is always sourced from the
 * customers feature (never duplicated). A referred person is either an
 * existing mock customer (`registered: true` — `customerId` links to the
 * real Customer Detail page, `name`/`phone` sourced from that same
 * record, never duplicated) or an unregistered contact (`registered:
 * false` — `name`/`phone` are mock-only contact details; this variant
 * has no `customerId` field at all, so an unregistered referral can
 * never be rendered as a fabricated Customer record).
 *
 * `ReferralReward` is an independent type — deliberately NOT the
 * Loyalty feature's `Reward` type, so Referrals is never coupled to
 * Loyalty's reward model. It carries no cost/value/currency field: no
 * such field is defined by any approved documentation, so one is not
 * invented here.
 */

export type ReferralStatus = 'pending' | 'completed'

export type ReferredContact =
  | { registered: true; customerId: string; name: string; phone: string }
  | { registered: false; name: string; phone: string }

export type ReferralRecord = {
  id: string
  referrerCustomerId: string
  referrerCustomerName: string
  referred: ReferredContact
  status: ReferralStatus
  createdAt: string
}

export type ReferralListParams = {
  search: string
  page: number
  pageSize: number
}

export type ReferralListResult = {
  items: ReferralRecord[]
  total: number
}

export type ReferralOverview = {
  totalReferrals: number
  completedReferrals: number
  pendingReferrals: number
  rewardsAvailable: number
}

/** Illustrative only — no cost/value field exists; see module doc comment above. */
export type ReferralReward = {
  id: string
  name: string
  description: string
}
