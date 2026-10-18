import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { listWorkflows } from '@/features/automation/services/automationService'
import type { WorkflowListParams } from '@/features/automation/types/automation'

/** The central Automation Workflows query key, per docs/FRONTEND_ARCHITECTURE.md §17. */
export const workflowListQueryKey = (params: WorkflowListParams) =>
  ['automation', 'workflows', params] as const

export function useAutomationWorkflows(params: WorkflowListParams) {
  return useQuery({
    queryKey: workflowListQueryKey(params),
    queryFn: () => listWorkflows(params),
    placeholderData: keepPreviousData,
  })
}
