import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { listLoyaltyActivity } from '@/features/loyalty/services/loyaltyService'
import type { LoyaltyActivityListParams } from '@/features/loyalty/types/loyalty'

/**
 * The central Loyalty Activity query key, per
 * docs/FRONTEND_ARCHITECTURE.md §17.
 */
export const loyaltyActivityListQueryKey = (params: LoyaltyActivityListParams) =>
  ['loyalty', 'activity', params] as const

export function useLoyaltyActivity(params: LoyaltyActivityListParams) {
  return useQuery({
    queryKey: loyaltyActivityListQueryKey(params),
    queryFn: () => listLoyaltyActivity(params),
    placeholderData: keepPreviousData,
  })
}
