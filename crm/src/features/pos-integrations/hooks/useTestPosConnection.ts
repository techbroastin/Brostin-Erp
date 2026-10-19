import { useMutation, useQueryClient } from '@tanstack/react-query'
import { testPosConnection } from '@/features/pos-integrations/services/posIntegrationsService'

/** Runs the mock adapter's Test Connection and refreshes the affected connection's queries. */
export function useTestPosConnection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: testPosConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-integrations'] })
    },
  })
}
