import { useQuery } from '@tanstack/react-query'
import { getReferralRewards } from '@/features/referrals/services/referralService'

/**
 * The one Referral Rewards query key, defined centrally here per
 * docs/FRONTEND_ARCHITECTURE.md §17.
 */
export const referralRewardsQueryKey = ['referrals', 'rewards'] as const

export function useReferralRewards() {
  return useQuery({
    queryKey: referralRewardsQueryKey,
    queryFn: () => getReferralRewards(),
  })
}
