import { useQuery } from '@tanstack/react-query'
import { getMembershipPlans } from '@/features/membership/services/membershipService'

/**
 * The one Membership Plans query key, defined centrally here per
 * docs/FRONTEND_ARCHITECTURE.md §17.
 */
export const membershipPlansQueryKey = ['membership', 'plans'] as const

export function useMembershipPlans() {
  return useQuery({
    queryKey: membershipPlansQueryKey,
    queryFn: () => getMembershipPlans(),
  })
}
