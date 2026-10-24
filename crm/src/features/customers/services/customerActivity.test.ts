import { beforeEach, describe, expect, test, vi } from 'vitest'

/** Pure mock-service tests; vi.resetModules() gives every test fresh stores. */
describe('Customer Activity and Orders Today', () => {
  beforeEach(() => vi.resetModules())

  test('activity covers all customers, newest first, and agrees with each customer timeline', async () => {
    const timeline = await import('./customerTimelineService')
    const feed = await timeline.listCustomerActivity({ type: 'all', limit: 1000 })

    expect(new Set(feed.map((e) => e.customerId)).size).toBeGreaterThan(1)
    const times = feed.map((e) => new Date(e.occurredAt).getTime())
    expect([...times].sort((a, b) => b - a)).toEqual(times)

    const one = await timeline.getCustomerTimeline('cust-002')
    expect(feed.filter((e) => e.customerId === 'cust-002').map((e) => e.id)).toEqual(one.map((e) => e.id))
  })

  test('activity filters by type and respects the limit', async () => {
    const timeline = await import('./customerTimelineService')
    const reviews = await timeline.listCustomerActivity({ type: 'review', limit: 1000 })
    expect(reviews.length).toBeGreaterThan(0)
    expect(reviews.every((e) => e.type === 'review')).toBe(true)
    expect(await timeline.listCustomerActivity({ type: 'all', limit: 5 })).toHaveLength(5)
  })

  test('archived customers drop out of the activity feed', async () => {
    const customers = await import('./customerService')
    const timeline = await import('./customerTimelineService')
    await customers.archiveCustomer('cust-002', '')
    const feed = await timeline.listCustomerActivity({ type: 'all', limit: 1000 })
    expect(feed.some((e) => e.customerId === 'cust-002')).toBe(false)
  })

  test('createdFrom keeps only orders from that time on', async () => {
    const orders = await import('@/features/orders/services/orderService')
    const all = await orders.listOrders({ search: '', status: 'all', source: 'all', page: 1, pageSize: 1000, sortBy: 'createdAt' })
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const today = await orders.listOrders({
      search: '',
      status: 'all',
      source: 'all',
      page: 1,
      pageSize: 1000,
      sortBy: 'createdAt',
      createdFrom: start.toISOString(),
    })
    expect(today.items.every((o) => new Date(o.createdAt).getTime() >= start.getTime())).toBe(true)
    expect(today.total).toBe(all.items.filter((o) => new Date(o.createdAt).getTime() >= start.getTime()).length)
  })
})
