import type { Customer } from '@/features/customers/types/customer'
import type { Order, OrderStatus } from '@/features/orders/types/order'

/**
 * Desktop dashboard figures, worked out from the Orders and Customers
 * data (the same records those screens show) rather than fixed numbers.
 * Pure functions so they can be tested and swapped to real data later.
 */

const DAY_MS = 24 * 60 * 60 * 1000
const LIVE_STATUSES: OrderStatus[] = ['placed', 'confirmed', 'preparing', 'ready']

export type InsightRange = 'today' | 'week' | 'month'

export type StatCard = {
  id: 'sales' | 'orders' | 'customers' | 'items'
  label: string
  value: number
  /** % change vs the previous period; null when there's nothing to compare with. */
  changePercent: number | null
}

export type SeriesPoint = { label: string; value: number }

export type TopItem = { name: string; quantity: number; orders: number }

export type DashboardInsights = {
  stats: StatCard[]
  sales: Record<InsightRange, SeriesPoint[]>
  topItems: Record<InsightRange, TopItem[]>
  orderTypes: { dining: number; takeaway: number; delivery: number }
  payments: { upi: number; cash: number }
  customerVisits: SeriesPoint[]
  liveOrders: Order[]
  recentOrders: Order[]
  recentCustomers: Customer[]
}

const counted = (o: Order) => o.status !== 'cancelled'

function startOfDay(t: number): number {
  const d = new Date(t)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function inWindow(orders: Order[], from: number, to: number): Order[] {
  return orders.filter((o) => {
    const t = new Date(o.createdAt).getTime()
    return t >= from && t < to
  })
}

function change(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return Math.round(((current - previous) / previous) * 100)
}

function rangeStart(range: InsightRange, now: number): number {
  const today = startOfDay(now)
  if (range === 'today') return today
  return today - (range === 'week' ? 6 : 29) * DAY_MS
}

/** Today: 2-hour buckets 8 AM–10 PM. Week: one point per day. Month: one point per day. */
function salesSeries(orders: Order[], range: InsightRange, now: number): SeriesPoint[] {
  const today = startOfDay(now)
  if (range === 'today') {
    return Array.from({ length: 8 }, (_, i) => {
      const hour = 8 + i * 2
      const from = today + hour * 60 * 60 * 1000
      const value = inWindow(orders, from, from + 2 * 60 * 60 * 1000).reduce((s, o) => s + o.grandTotal, 0)
      const label = `${hour === 12 ? 12 : hour % 12} ${hour < 12 ? 'AM' : 'PM'}`
      return { label, value }
    })
  }
  const days = range === 'week' ? 7 : 30
  return Array.from({ length: days }, (_, i) => {
    const from = today - (days - 1 - i) * DAY_MS
    const date = new Date(from)
    const label =
      range === 'week'
        ? date.toLocaleDateString('en-IN', { weekday: 'short' })
        : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    return { label, value: inWindow(orders, from, from + DAY_MS).reduce((s, o) => s + o.grandTotal, 0) }
  })
}

function topItems(orders: Order[]): TopItem[] {
  const byName = new Map<string, TopItem>()
  for (const o of orders) {
    for (const line of o.items) {
      const item = byName.get(line.productName) ?? { name: line.productName, quantity: 0, orders: 0 }
      item.quantity += line.quantity
      item.orders += 1
      byName.set(line.productName, item)
    }
  }
  return [...byName.values()].sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name)).slice(0, 5)
}

export function buildInsights(allOrders: Order[], customers: Customer[], now: number = Date.now()): DashboardInsights {
  const orders = allOrders.filter(counted)
  const today = startOfDay(now)
  const end = today + DAY_MS
  const weekStart = today - 6 * DAY_MS
  const thisWeek = inWindow(orders, weekStart, end)
  const lastWeek = inWindow(orders, weekStart - 7 * DAY_MS, weekStart)

  const sum = (list: Order[]) => list.reduce((s, o) => s + o.grandTotal, 0)
  const items = (list: Order[]) => list.reduce((s, o) => s + o.items.reduce((n, l) => n + l.quantity, 0), 0)
  const firstVisits = (from: number, to: number) =>
    customers.filter((c) => c.firstVisitAt && new Date(c.firstVisitAt).getTime() >= from && new Date(c.firstVisitAt).getTime() < to).length
  const newThisWeek = firstVisits(weekStart, end)
  const newLastWeek = firstVisits(weekStart - 7 * DAY_MS, weekStart)

  const ranges: InsightRange[] = ['today', 'week', 'month']
  const byRange = <T,>(fn: (range: InsightRange) => T) =>
    Object.fromEntries(ranges.map((r) => [r, fn(r)])) as Record<InsightRange, T>

  const newestFirst = [...allOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return {
    stats: [
      { id: 'sales', label: 'Total Sales', value: sum(thisWeek), changePercent: change(sum(thisWeek), sum(lastWeek)) },
      { id: 'orders', label: 'Total Orders', value: thisWeek.length, changePercent: change(thisWeek.length, lastWeek.length) },
      { id: 'customers', label: 'New Customers', value: newThisWeek, changePercent: change(newThisWeek, newLastWeek) },
      { id: 'items', label: 'Items Sold', value: items(thisWeek), changePercent: change(items(thisWeek), items(lastWeek)) },
    ],
    sales: byRange((r) => salesSeries(orders, r, now)),
    topItems: byRange((r) => topItems(inWindow(orders, rangeStart(r, now), end))),
    orderTypes: {
      dining: thisWeek.filter((o) => o.orderType === 'dining').length,
      takeaway: thisWeek.filter((o) => o.orderType === 'takeaway').length,
      delivery: thisWeek.filter((o) => o.orderType === 'delivery').length,
    },
    payments: {
      upi: thisWeek.filter((o) => o.paymentMethod === 'upi').reduce((s, o) => s + o.grandTotal, 0),
      cash: thisWeek.filter((o) => o.paymentMethod === 'cash').reduce((s, o) => s + o.grandTotal, 0),
    },
    customerVisits: Array.from({ length: 7 }, (_, i) => {
      const from = weekStart + i * DAY_MS
      const visitors = new Set(inWindow(orders, from, from + DAY_MS).map((o) => o.customerId))
      return { label: new Date(from).toLocaleDateString('en-IN', { weekday: 'short' }), value: visitors.size }
    }),
    liveOrders: newestFirst.filter((o) => LIVE_STATUSES.includes(o.status)).slice(0, 5),
    recentOrders: newestFirst.slice(0, 6),
    recentCustomers: [...customers]
      .filter((c) => c.lastOrderAt && !c.archivedAt)
      .sort((a, b) => (b.lastOrderAt ?? '').localeCompare(a.lastOrderAt ?? ''))
      .slice(0, 5),
  }
}
