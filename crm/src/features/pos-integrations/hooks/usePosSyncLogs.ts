import { useQuery } from '@tanstack/react-query'
import { getPosSyncLogs } from '@/features/pos-integrations/services/posIntegrationsService'

export const posSyncLogsQueryKey = (connectionId: string) =>
  ['pos-integrations', 'sync-logs', connectionId] as const

export function usePosSyncLogs(connectionId: string) {
  return useQuery({
    queryKey: posSyncLogsQueryKey(connectionId),
    queryFn: () => getPosSyncLogs(connectionId),
  })
}
