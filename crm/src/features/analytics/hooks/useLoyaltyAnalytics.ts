import { useQuery } from '@tanstack/react-query'
import { getLoyaltyAnalytics } from '@/features/analytics/services/analyticsService'

export const loyaltyAnalyticsQueryKey = ['analytics', 'loyalty'] as const

export function useLoyaltyAnalytics() {
  return useQuery({
    queryKey: loyaltyAnalyticsQueryKey,
    queryFn: () => getLoyaltyAnalytics(),
  })
}
