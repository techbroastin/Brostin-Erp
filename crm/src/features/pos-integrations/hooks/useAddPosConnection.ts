import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addPosConnection } from '@/features/pos-integrations/services/posIntegrationsService'

/** Invalidates the POS Connections list so a new in-memory connection appears immediately. */
export function useAddPosConnection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addPosConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-integrations'] })
    },
  })
}
