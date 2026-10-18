import { useQuery } from '@tanstack/react-query'
import { getWorkflowById } from '@/features/automation/services/automationService'

export const workflowDetailQueryKey = (id: string) => ['automation', 'detail', id] as const

export function useAutomationWorkflow(id: string) {
  return useQuery({
    queryKey: workflowDetailQueryKey(id),
    queryFn: () => getWorkflowById(id),
  })
}
