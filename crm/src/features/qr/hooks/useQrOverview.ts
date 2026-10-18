import { useQuery } from '@tanstack/react-query'
import { getQrOverview } from '@/features/qr/services/qrService'

/**
 * The one QR Overview query key, defined centrally here per
 * docs/FRONTEND_ARCHITECTURE.md §17.
 */
export const qrOverviewQueryKey = ['qr', 'overview'] as const

export function useQrOverview() {
  return useQuery({
    queryKey: qrOverviewQueryKey,
    queryFn: () => getQrOverview(),
  })
}
