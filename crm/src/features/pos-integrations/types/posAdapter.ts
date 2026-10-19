import type { Order } from '@/features/orders/types/order'
import type { PosConnection } from '@/features/pos-integrations/types/posIntegration'

/**
 * Vendor-neutral adapter contract — docs/IMPLEMENTATION_PLAN.md §21:
 * "Create an adapter/service boundary... UI must not know API
 * credentials, endpoint details, authentication details, or
 * provider-specific payload structures." Normalized orders reuse the
 * EXISTING features/orders Order type rather than a parallel shape.
 *
 * No screen calls fetchOrders yet — only testConnection is wired to
 * the UI (the Test Connection action). fetchOrders exists to state the
 * adapter contract's shape and remains explicitly unimplemented for
 * any real vendor until verified API documentation is available (see
 * mock/mockAdapters.ts).
 */

export type PosTestConnectionResult = {
  ok: boolean
  message: string
}

export interface PosAdapter {
  vendor: PosConnection['vendor']
  testConnection(connection: PosConnection): Promise<PosTestConnectionResult>
  /** Not yet called by any screen — unimplemented for every vendor until real API docs exist. */
  fetchOrders(connection: PosConnection, since: string | null): Promise<Order[]>
}
