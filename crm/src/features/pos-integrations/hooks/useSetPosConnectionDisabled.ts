import { useMutation, useQueryClient } from '@tanstack/react-query'
import { setPosConnectionDisabled } from '@/features/pos-integrations/services/posIntegrationsService'

/** Disables or re-enables (to 'pending') a connection's mock status. */
export function useSetPosConnectionDisabled() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, disabled }: { id: string; disabled: boolean }) =>
      setPosConnectionDisabled(id, disabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-integrations'] })
    },
  })
}
