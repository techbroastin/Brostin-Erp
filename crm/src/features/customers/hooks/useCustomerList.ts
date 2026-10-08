import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { listCustomers } from '@/features/customers/services/customerService'
import type { CustomerListParams } from '@/features/customers/types/customer'

/**
 * The central Customers-list query key, per docs/FRONTEND_ARCHITECTURE.md
 * §17.
 */
export const customerListQueryKey = (params: CustomerListParams) =>
  ['customers', 'list', params] as const

export function useCustomerList(params: CustomerListParams) {
  return useQuery({
    queryKey: customerListQueryKey(params),
    queryFn: () => listCustomers(params),
    placeholderData: keepPreviousData,
  })
}
