/**
 * Analytics feature types — provisional frontend view models, not the
 * Broastin standard data model (NOT YET FINALIZED per
 * docs/FRONTEND_ARCHITECTURE.md §16).
 *
 * Every field here is an aggregation over existing Orders/Customers/
 * Loyalty data — no new mock dataset exists for Analytics. See
 * services/analyticsService.ts for the exact calculation of each field.
 */

import type { CustomerBalance } from '@/features/loyalty/types/loyalty'

export type AnalyticsOverview = {
  /** sum(Order.grandTotal) across all orders — not collected revenue. */
  totalOrderValue: number
  totalOrders: number
  totalCustomers: number
  /** Passed through unchanged from loyaltyService.getLoyaltyOverview(). */
  totalLoyaltyPointsOutstanding: number
}

export type SalesBreakdownEntry = {
  key: string
  label: string
  count: number
  value: number
}

export type TopOrderEntry = {
  id: string
  orderNumber: string
  customerName: string
  grandTotal: number
}

export type SalesAnalytics = {
  totalOrderValue: number
  totalOrders: number
  byOrderType: SalesBreakdownEntry[]
  byPaymentMethod: SalesBreakdownEntry[]
  bySource: SalesBreakdownEntry[]
  topOrders: TopOrderEntry[]
}

export type CustomerRankingEntry = {
  id: string
  name: string
  orderCount: number
}

export type CustomerAnalytics = {
  totalCustomers: number
  customersWithOrders: number
  customersWithLoyaltyPoints: number
  topCustomersByOrders: CustomerRankingEntry[]
  /** Reused verbatim from loyaltyService.listCustomerBalances(sortBy: 'points'). */
  topCustomersByPoints: CustomerBalance[]
}

export type LoyaltyAnalytics = {
  /** Passed through unchanged from loyaltyService.getLoyaltyOverview(). */
  totalPointsOutstanding: number
  customersWithPoints: number
  rewardsAvailable: number
  rewardsRedemptionCount: number
  /**
   * Historical activity totals from listLoyaltyActivity() — NOT a
   * reconciled ledger against totalPointsOutstanding. See
   * loyalty.mock.ts's own comment: "not a reconciled points ledger."
   */
  totalPointsEarned: number
  totalPointsRedeemed: number
  topCustomersByPoints: CustomerBalance[]
}
