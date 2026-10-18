import { useQuery } from '@tanstack/react-query'
import { getMembershipOverview } from '@/features/membership/services/membershipService'

/**
 * The one Membership Overview query key, defined centrally here per
 * docs/FRONTEND_ARCHITECTURE.md §17.
 */
export const membershipOverviewQueryKey = ['membership', 'overview'] as const

export function useMembershipOverview() {
  return useQuery({
    queryKey: membershipOverviewQueryKey,
    queryFn: () => getMembershipOverview(),
  })
}
