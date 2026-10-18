import { useQuery } from '@tanstack/react-query'
import { getReferralOverview } from '@/features/referrals/services/referralService'

/**
 * The one Referral Overview query key, defined centrally here per
 * docs/FRONTEND_ARCHITECTURE.md §17.
 */
export const referralOverviewQueryKey = ['referrals', 'overview'] as const

export function useReferralOverview() {
  return useQuery({
    queryKey: referralOverviewQueryKey,
    queryFn: () => getReferralOverview(),
  })
}
