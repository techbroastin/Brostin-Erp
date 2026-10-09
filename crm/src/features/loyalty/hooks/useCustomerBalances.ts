import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { listCustomerBalances } from '@/features/loyalty/services/loyaltyService'
import type { CustomerBalanceListParams } from '@/features/loyalty/types/loyalty'

/**
 * The central Customer Balances query key, per
 * docs/FRONTEND_ARCHITECTURE.md §17.
 */
export const customerBalanceListQueryKey = (params: CustomerBalanceListParams) =>
  ['loyalty', 'customer-balances', params] as const

export function useCustomerBalances(params: CustomerBalanceListParams) {
  return useQuery({
    queryKey: customerBalanceListQueryKey(params),
    queryFn: () => listCustomerBalances(params),
    placeholderData: keepPreviousData,
  })
}
