import { listOrders } from '@/features/orders/services/orderService'
import type { Order, OrderType, PaymentMethod, OrderSource } from '@/features/orders/types/order'
import { listCustomers } from '@/features/customers/services/customerService'
import {
  getLoyaltyOverview,
  listCustomerBalances,
  listLoyaltyActivity,
} from '@/features/loyalty/services/loyaltyService'
import type {
  AnalyticsOverview,
  SalesAnalytics,
  SalesBreakdownEntry,
  CustomerAnalytics,
  LoyaltyAnalytics,
} from '@/features/analytics/types/analytics'

/**
 * Large enough to return every mock order/customer/activity record in a
 * single page, so aggregation reads the complete dataset without
 * inventing a second bulk API on Orders/Customers/Loyalty — same pattern
 * as qrService.ts's ALL_QR_ORDERS_PAGE_SIZE.
 */
const ALL_RECORDS_PAGE_SIZE = 1000
const TOP_N = 5

async function fetchAllOrders(): Promise<Order[]> {
  const { items } = await listOrders({
    search: '',
    status: 'all',
    source: 'all',
    page: 1,
    pageSize: ALL_RECORDS_PAGE_SIZE,
    sortBy: 'createdAt',
  })
  return items
}

async function fetchAllCustomers() {
  const { items } = await listCustomers({
    search: '',
    page: 1,
    pageSize: ALL_RECORDS_PAGE_SIZE,
    sortBy: 'name',
  })
  return items
}

const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  takeaway: 'Takeaway',
  delivery: 'Delivery',
  dining: 'Dining',
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  upi: 'UPI',
}

const ORDER_SOURCE_LABELS: Record<OrderSource, string> = {
  qr: 'QR',
  web: 'Web',
}

function buildBreakdown(
  orders: Order[],
  keyOf: (order: Order) => string,
  labels: Record<string, string>,
): SalesBreakdownEntry[] {
  return Object.entries(labels).map(([key, label]) => {
    const matching = orders.filter((order) => keyOf(order) === key)
    return {
      key,
      label,
      count: matching.length,
      value: matching.reduce((sum, order) => sum + order.grandTotal, 0),
    }
  })
}

/**
 * Overview KPIs — each sourced from an existing feature's own service,
 * zero new mock data. `totalOrderValue` sums Order.grandTotal across
 * every order regardless of status (approved default — see
 * docs/IMPLEMENTATION_PLAN.md §17 planning thread); it is explicitly
 * NOT collected revenue or cash received.
 */
export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const [orders, customers, loyaltyOverview] = await Promise.all([
    fetchAllOrders(),
    fetchAllCustomers(),
    getLoyaltyOverview(),
  ])

  return {
    totalOrderValue: orders.reduce((sum, order) => sum + order.grandTotal, 0),
    totalOrders: orders.length,
    totalCustomers: customers.length,
    totalLoyaltyPointsOutstanding: loyaltyOverview.totalPointsOutstanding,
  }
}

/**
 * Sales breakdowns use only the existing orderType/paymentMethod/source
 * fields already on Order — no invented categories, no trend/time-series
 * data (orders.mock.ts spans only ~12 days).
 */
export async function getSalesAnalytics(): Promise<SalesAnalytics> {
  const orders = await fetchAllOrders()

  const topOrders = [...orders]
    .sort((a, b) => b.grandTotal - a.grandTotal)
    .slice(0, TOP_N)
    .map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      grandTotal: order.grandTotal,
    }))

  return {
    totalOrderValue: orders.reduce((sum, order) => sum + order.grandTotal, 0),
    totalOrders: orders.length,
    byOrderType: buildBreakdown(orders, (o) => o.orderType, ORDER_TYPE_LABELS),
    byPaymentMethod: buildBreakdown(orders, (o) => o.paymentMethod, PAYMENT_METHOD_LABELS),
    bySource: buildBreakdown(orders, (o) => o.source, ORDER_SOURCE_LABELS),
    topOrders,
  }
}

/**
 * Customer rankings/counts use only existing Customer fields
 * (orderCount, loyaltyPoints) via customerService.listCustomers(), plus
 * loyaltyService.listCustomerBalances() reused verbatim for the
 * points ranking — never recomputed independently. No signup-date
 * metric: Customer has no such field (confirmed, not added).
 */
export async function getCustomerAnalytics(): Promise<CustomerAnalytics> {
  const [customers, topByPoints] = await Promise.all([
    fetchAllCustomers(),
    listCustomerBalances({ search: '', page: 1, pageSize: TOP_N, sortBy: 'points' }),
  ])

  const customersWithOrders = customers.filter((c) => c.orderCount > 0)
  const customersWithLoyaltyPoints = customers.filter((c) => (c.loyaltyPoints ?? 0) > 0)

  const topCustomersByOrders = [...customers]
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, TOP_N)
    .map((c) => ({ id: c.id, name: c.name, orderCount: c.orderCount }))

  return {
    totalCustomers: customers.length,
    customersWithOrders: customersWithOrders.length,
    customersWithLoyaltyPoints: customersWithLoyaltyPoints.length,
    topCustomersByOrders,
    topCustomersByPoints: topByPoints.items,
  }
}

/**
 * totalPointsOutstanding/customersWithPoints/rewardsAvailable/
 * rewardsRedemptionCount are passed through unchanged from
 * loyaltyService.getLoyaltyOverview() — never recomputed from activity
 * events. totalPointsEarned/totalPointsRedeemed are a SEPARATE pair of
 * historical totals summed from listLoyaltyActivity()'s signed `points`
 * field (positive for 'earned', negative for 'redeemed' — confirmed in
 * loyalty.mock.ts::buildActivity()); loyalty.mock.ts's own comment
 * states this activity feed is "not a reconciled points ledger," so
 * these two totals are not expected to reconcile with
 * totalPointsOutstanding and must not be presented as if they do.
 */
export async function getLoyaltyAnalytics(): Promise<LoyaltyAnalytics> {
  const [overview, activity, topByPoints] = await Promise.all([
    getLoyaltyOverview(),
    listLoyaltyActivity({ search: '', page: 1, pageSize: ALL_RECORDS_PAGE_SIZE }),
    listCustomerBalances({ search: '', page: 1, pageSize: TOP_N, sortBy: 'points' }),
  ])

  const totalPointsEarned = activity.items
    .filter((event) => event.type === 'earned')
    .reduce((sum, event) => sum + event.points, 0)

  const totalPointsRedeemed = Math.abs(
    activity.items
      .filter((event) => event.type === 'redeemed')
      .reduce((sum, event) => sum + event.points, 0),
  )

  return {
    totalPointsOutstanding: overview.totalPointsOutstanding,
    customersWithPoints: overview.customersWithPoints,
    rewardsAvailable: overview.rewardsAvailable,
    rewardsRedemptionCount: overview.rewardsRedeemed,
    totalPointsEarned,
    totalPointsRedeemed,
    topCustomersByPoints: topByPoints.items,
  }
}
