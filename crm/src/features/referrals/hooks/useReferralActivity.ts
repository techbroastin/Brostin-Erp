import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { listReferralActivity } from '@/features/referrals/services/referralService'
import type { ReferralListParams } from '@/features/referrals/types/referral'

/**
 * The central Referral Activity query key, per
 * docs/FRONTEND_ARCHITECTURE.md §17.
 */
export const referralActivityQueryKey = (params: ReferralListParams) =>
  ['referrals', 'activity', params] as const

export function useReferralActivity(params: ReferralListParams) {
  return useQuery({
    queryKey: referralActivityQueryKey(params),
    queryFn: () => listReferralActivity(params),
    placeholderData: keepPreviousData,
  })
}
