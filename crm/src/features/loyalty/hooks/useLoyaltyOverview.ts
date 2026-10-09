import { useQuery } from '@tanstack/react-query'
import { getLoyaltyOverview } from '@/features/loyalty/services/loyaltyService'

/**
 * The one Loyalty Overview query key, defined centrally here per
 * docs/FRONTEND_ARCHITECTURE.md §17.
 */
export const loyaltyOverviewQueryKey = ['loyalty', 'overview'] as const

export function useLoyaltyOverview() {
  return useQuery({
    queryKey: loyaltyOverviewQueryKey,
    queryFn: () => getLoyaltyOverview(),
  })
}
