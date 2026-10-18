import { useQuery } from '@tanstack/react-query'
import { getSalesAnalytics } from '@/features/analytics/services/analyticsService'

export const salesAnalyticsQueryKey = ['analytics', 'sales'] as const

export function useSalesAnalytics() {
  return useQuery({
    queryKey: salesAnalyticsQueryKey,
    queryFn: () => getSalesAnalytics(),
  })
}
