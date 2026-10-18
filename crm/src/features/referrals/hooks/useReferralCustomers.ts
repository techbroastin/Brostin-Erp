import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { listReferralCustomers } from '@/features/referrals/services/referralService'
import type { ReferralListParams } from '@/features/referrals/types/referral'

/**
 * The central Referral Customers query key, per
 * docs/FRONTEND_ARCHITECTURE.md §17.
 */
export const referralCustomersQueryKey = (params: ReferralListParams) =>
  ['referrals', 'customers', params] as const

export function useReferralCustomers(params: ReferralListParams) {
  return useQuery({
    queryKey: referralCustomersQueryKey(params),
    queryFn: () => listReferralCustomers(params),
    placeholderData: keepPreviousData,
  })
}
