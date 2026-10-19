import { useQuery } from '@tanstack/react-query'
import { getPosConnectionById } from '@/features/pos-integrations/services/posIntegrationsService'

export const posConnectionQueryKey = (id: string) => ['pos-integrations', 'connection', id] as const

export function usePosConnection(id: string) {
  return useQuery({
    queryKey: posConnectionQueryKey(id),
    queryFn: () => getPosConnectionById(id),
  })
}
