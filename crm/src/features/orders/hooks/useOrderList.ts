import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { listOrders } from '@/features/orders/services/orderService'
import type { OrderListParams } from '@/features/orders/types/order'

/** The central Orders-list query key, per docs/FRONTEND_ARCHITECTURE.md §17. */
export const orderListQueryKey = (params: OrderListParams) => ['orders', 'list', params] as const

export function useOrderList(params: OrderListParams) {
  return useQuery({
    queryKey: orderListQueryKey(params),
    queryFn: () => listOrders(params),
    placeholderData: keepPreviousData,
  })
}
