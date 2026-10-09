import { useQuery } from '@tanstack/react-query'
import { getRewards } from '@/features/loyalty/services/loyaltyService'

/**
 * The one Rewards query key, defined centrally here per
 * docs/FRONTEND_ARCHITECTURE.md §17.
 */
export const rewardsQueryKey = ['loyalty', 'rewards'] as const

export function useRewards() {
  return useQuery({
    queryKey: rewardsQueryKey,
    queryFn: () => getRewards(),
  })
}
