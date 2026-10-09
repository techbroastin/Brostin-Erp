import { useQuery } from '@tanstack/react-query'
import { getOrderById } from '@/features/orders/services/orderService'

export const orderDetailQueryKey = (id: string) => ['orders', 'detail', id] as const

export function useOrderDetail(id: string) {
  return useQuery({
    queryKey: orderDetailQueryKey(id),
    queryFn: () => getOrderById(id),
  })
}
