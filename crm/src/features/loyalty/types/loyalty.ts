/**
 * Loyalty feature types — provisional frontend view models, not the
 * Broastin standard data model (NOT YET FINALIZED per
 * docs/FRONTEND_ARCHITECTURE.md §16).
 *
 * Per docs/IMPLEMENTATION_PLAN.md §12, no loyalty business rules are
 * finalized: how points are earned, redemption rules, point-to-currency
 * conversion, reward pricing, expiry, tiers and manual adjustments are
 * all UNDEFINED and are not invented here. `LoyaltyEventType` is
 * intentionally limited to the two minimal illustrative examples
 * approved for Phase 6 ('earned' | 'redeemed') — not a finalized event
 * taxonomy (docs/NAVIGATION.md §8.6 marks the real taxonomy itself
 * NOT YET FINALIZED).
 *
 * `CustomerBalance.points` is sourced from the existing
 * `Customer.loyaltyPoints` field (customers feature) — never an
 * independent balance — so Customers and Loyalty always agree; the
 * activity ledger adds up to the same balances (see loyalty.mock.ts).
 * The reward catalogue is owner-editable (name, description, point
 * cost) — a configurable structure, not a finalized reward model.
 */

export type LoyaltyEventType = 'earned' | 'redeemed'

export type LoyaltyEvent = {
  id: string
  customerId: string
  customerName: string
  type: LoyaltyEventType
  /** Positive for 'earned', negative for 'redeemed'. */
  points: number
  description: string
  /** The program that awarded these points; null for redemptions. */
  programId: string | null
  createdAt: string
}

/** Illustrative demo catalogue only — no real reward model exists yet. */
export type Reward = {
  id: string
  name: string
  description: string
  pointCost: number
}

export type RewardInput = Omit<Reward, 'id'>

export type CustomerBalance = {
  id: string
  name: string
  phone: string
  points: number | null
}

export type CustomerBalanceSortBy = 'name' | 'points'

export type CustomerBalanceListParams = {
  search: string
  page: number
  pageSize: number
  sortBy: CustomerBalanceSortBy
}

export type CustomerBalanceListResult = {
  items: CustomerBalance[]
  total: number
}

export type LoyaltyActivityListParams = {
  search: string
  /** Only events awarded by this program. */
  programId?: string
  /** Keep events of archived customers (their own timeline still shows them). */
  includeArchived?: boolean
  page: number
  pageSize: number
}

export type LoyaltyActivityListResult = {
  items: LoyaltyEvent[]
  total: number
}

export type LoyaltyOverview = {
  totalPointsOutstanding: number
  customersWithPoints: number
  rewardsAvailable: number
  rewardsRedeemed: number
}
