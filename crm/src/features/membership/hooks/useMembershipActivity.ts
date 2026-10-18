import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { listMembershipActivity } from '@/features/membership/services/membershipService'
import type { MembershipActivityListParams } from '@/features/membership/types/membership'

/**
 * The central Membership Activity query key, per
 * docs/FRONTEND_ARCHITECTURE.md §17.
 */
export const membershipActivityQueryKey = (params: MembershipActivityListParams) =>
  ['membership', 'activity', params] as const

export function useMembershipActivity(params: MembershipActivityListParams) {
  return useQuery({
    queryKey: membershipActivityQueryKey(params),
    queryFn: () => listMembershipActivity(params),
    placeholderData: keepPreviousData,
  })
}
