import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getPublishProblems,
  listWorkflowRuns,
  testWorkflow,
  updateWorkflow,
} from '@/features/automation/services/automationService'
import type { TriggerContext, WorkflowInput } from '@/features/automation/types/automation'

/** Run log for one workflow, or every workflow when `workflowId` is undefined. */
export function useWorkflowRuns(workflowId?: string) {
  return useQuery({ queryKey: ['automation', 'runs', workflowId ?? 'all'], queryFn: () => listWorkflowRuns(workflowId) })
}

export function usePublishProblems(workflowId: string) {
  return useQuery({ queryKey: ['automation', 'publish-problems', workflowId], queryFn: () => getPublishProblems(workflowId) })
}

export function useTestWorkflow(workflowId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ customerId, context }: { customerId: string; context: TriggerContext }) =>
      testWorkflow(workflowId, customerId, context),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'runs'] })
      queryClient.invalidateQueries({ queryKey: ['automation', 'publish-problems', workflowId] })
    },
  })
}

export function useUpdateWorkflow(workflowId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: WorkflowInput) => updateWorkflow(workflowId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation'] })
    },
  })
}
