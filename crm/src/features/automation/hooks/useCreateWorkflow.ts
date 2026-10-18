import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createWorkflow } from '@/features/automation/services/automationService'

/** Invalidates the Automation list/overview queries so a new in-memory workflow appears immediately. */
export function useCreateWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation'] })
    },
  })
}
