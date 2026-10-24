import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getRewards, saveReward } from '@/features/loyalty/services/loyaltyService'
import type { RewardInput } from '@/features/loyalty/types/loyalty'

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

/** Add when `id` is undefined, otherwise edit. Programs show reward names, so their queries refresh too. */
export function useSaveReward(id?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: RewardInput) => saveReward(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty'] })
      queryClient.invalidateQueries({ queryKey: ['programs'] })
    },
  })
}
