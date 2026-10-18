import { useQuery } from '@tanstack/react-query'
import { getCustomerAnalytics } from '@/features/analytics/services/analyticsService'

export const customerAnalyticsQueryKey = ['analytics', 'customers'] as const

export function useCustomerAnalytics() {
  return useQuery({
    queryKey: customerAnalyticsQueryKey,
    queryFn: () => getCustomerAnalytics(),
  })
}
