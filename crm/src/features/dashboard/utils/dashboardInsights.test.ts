import { describe, expect, test } from 'vitest'
import { normalOrders } from '@/features/orders/mock/orders.mock'
import { normalCustomers } from '@/features/customers/mock/customers.mock'
import { buildInsights } from './dashboardInsights'
import { cn } from '@/lib/utils'

const DAY = 24 * 60 * 60 * 1000
const NOW = new Date('2026-10-24T18:00:00').getTime()

describe('buildInsights', () => {
  const orders = normalOrders.map((o, i) => ({ ...o, createdAt: new Date(NOW - i * 0.5 * DAY).toISOString() }))
  const insights = buildInsights(orders, normalCustomers, NOW)

  test('stats cover the last 7 days and leave out cancelled orders', () => {
    const weekStart = new Date(NOW)
    weekStart.setHours(0, 0, 0, 0)
    const from = weekStart.getTime() - 6 * DAY
    const counted = orders.filter((o) => o.status !== 'cancelled' && new Date(o.createdAt).getTime() >= from)
    const sales = insights.stats.find((s) => s.id === 'sales')!
    expect(sales.value).toBe(counted.reduce((s, o) => s + o.grandTotal, 0))
    expect(insights.stats.find((s) => s.id === 'orders')!.value).toBe(counted.length)
  })

  test('the weekly sales series adds up to the weekly total', () => {
    const weekTotal = insights.sales.week.reduce((s, p) => s + p.value, 0)
    expect(weekTotal).toBe(insights.stats.find((s) => s.id === 'sales')!.value)
    expect(insights.sales.week).toHaveLength(7)
    expect(insights.sales.month).toHaveLength(30)
    expect(insights.sales.today).toHaveLength(8)
  })

  test('order types, payments and visits are consistent with the week', () => {
    const { dining, takeaway, delivery } = insights.orderTypes
    expect(dining + takeaway + delivery).toBe(insights.stats.find((s) => s.id === 'orders')!.value)
    expect(insights.payments.upi + insights.payments.cash).toBe(insights.stats.find((s) => s.id === 'sales')!.value)
    expect(insights.customerVisits).toHaveLength(7)
  })

  test('live orders are in progress only; lists are newest first and capped', () => {
    expect(insights.liveOrders.every((o) => ['placed', 'confirmed', 'preparing', 'ready'].includes(o.status))).toBe(true)
    expect(insights.recentOrders).toHaveLength(6)
    const times = insights.recentOrders.map((o) => o.createdAt)
    expect([...times].sort().reverse()).toEqual(times)
    expect(insights.topItems.week.length).toBeLessThanOrEqual(5)
    expect(insights.recentCustomers.every((c) => !c.archivedAt)).toBe(true)
  })

  test('% change is 0 when both periods are empty', () => {
    const empty = buildInsights([], normalCustomers, NOW)
    expect(empty.stats.find((s) => s.id === 'sales')!.changePercent).toBe(0)
  })
})

describe('cn', () => {
  test('keeps custom text sizes alongside text colours', () => {
    expect(cn('text-caption font-medium', 'text-success')).toBe('text-caption font-medium text-success')
    expect(cn('text-caption', 'text-body')).toBe('text-body')
  })
})
