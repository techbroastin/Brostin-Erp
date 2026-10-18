import { useQuery } from '@tanstack/react-query'
import { getAnalyticsOverview } from '@/features/analytics/services/analyticsService'

/**
 * The one Analytics Overview query key, defined centrally here per
 * docs/FRONTEND_ARCHITECTURE.md §17.
 */
export const analyticsOverviewQueryKey = ['analytics', 'overview'] as const

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: analyticsOverviewQueryKey,
    queryFn: () => getAnalyticsOverview(),
  })
}
