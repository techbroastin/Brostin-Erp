import { useQuery } from '@tanstack/react-query'
import { openCustomerProfile } from '@/features/customers/services/customerService'

export const customerDetailQueryKey = (id: string) => ['customers', 'detail', id] as const

export function useCustomerDetail(id: string) {
  return useQuery({
    queryKey: customerDetailQueryKey(id),
    queryFn: () => openCustomerProfile(id),
  })
}
