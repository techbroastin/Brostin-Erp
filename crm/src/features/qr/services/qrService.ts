import { listOrders } from '@/features/orders/services/orderService'

export type QrOverview = {
  totalQrOrders: number
}

/**
 * Large enough to return every QR-sourced mock order (orders.mock.ts
 * currently generates 24 total orders, roughly half QR) in a single
 * page.
 */
const ALL_QR_ORDERS_PAGE_SIZE = 1000

/**
 * The only logic this feature owns: a source-pinned count, delegated
 * entirely to the existing Orders service. No new mock dataset, no
 * new business rule — docs/IMPLEMENTATION_PLAN.md "Phase 13 — QR
 * Administration" describes this as an operational view of existing
 * order data, not a rebuild or a new entity. There is no established
 * project convention for computing a "today" boundary from a mock
 * createdAt timestamp (confirmed by inspection — Dashboard's "Today's
 * Orders" is a hardcoded mock string, not a real computation), so no
 * such KPI is included here.
 */
export async function getQrOverview(): Promise<QrOverview> {
  const result = await listOrders({
    search: '',
    status: 'all',
    source: 'qr',
    page: 1,
    pageSize: ALL_QR_ORDERS_PAGE_SIZE,
    sortBy: 'createdAt',
  })

  return { totalQrOrders: result.total }
}
