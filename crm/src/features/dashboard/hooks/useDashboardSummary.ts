import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary } from '@/features/dashboard/services/dashboardService'

/**
 * The one Dashboard query key, defined centrally here per
 * docs/FRONTEND_ARCHITECTURE.md §17.
 */
export const dashboardSummaryQueryKey = ['dashboard', 'summary'] as const

export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardSummaryQueryKey,
    queryFn: () => getDashboardSummary(),
  })
}
