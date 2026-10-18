import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { listMembers } from '@/features/membership/services/membershipService'
import type { MemberListParams } from '@/features/membership/types/membership'

/**
 * The central Members query key, per docs/FRONTEND_ARCHITECTURE.md §17.
 */
export const membersQueryKey = (params: MemberListParams) => ['membership', 'members', params] as const

export function useMembers(params: MemberListParams) {
  return useQuery({
    queryKey: membersQueryKey(params),
    queryFn: () => listMembers(params),
    placeholderData: keepPreviousData,
  })
}
