import { useQuery } from '@tanstack/react-query'
import { getCustomerById } from '@/features/customers/services/customerService'

export const customerDetailQueryKey = (id: string) => ['customers', 'detail', id] as const

export function useCustomerDetail(id: string) {
  return useQuery({
    queryKey: customerDetailQueryKey(id),
    queryFn: () => getCustomerById(id),
  })
}
