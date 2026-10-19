import { useQuery } from '@tanstack/react-query'
import { listPosConnections } from '@/features/pos-integrations/services/posIntegrationsService'

/** The central POS Connections list query key, per docs/FRONTEND_ARCHITECTURE.md §17. */
export const posConnectionsQueryKey = ['pos-integrations', 'connections'] as const

export function usePosConnections() {
  return useQuery({
    queryKey: posConnectionsQueryKey,
    queryFn: () => listPosConnections(),
  })
}
