import { useParams } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { useAutomationWorkflow } from '@/features/automation/hooks/useAutomationWorkflow'
import { AutomationErrorState } from '@/features/automation/components/shared/AutomationErrorState'
import { AutomationDesktopOnlyNotice } from '@/features/automation/components/shared/AutomationDesktopOnlyNotice'
import { DesktopWorkflowDetailContent } from '@/features/automation/components/desktop/DesktopWorkflowDetailContent'

/** Workflow Detail route element — /automation/:workflowId. Not a menu item. Desktop Admin only. */
export function WorkflowDetailScreen() {
  const { workflowId } = useParams<{ workflowId: string }>()
  const isDesktop = useIsDesktopViewport()
  const { data: workflow, isPending, isError, refetch } = useAutomationWorkflow(workflowId ?? '')

  if (!isDesktop) {
    return <AutomationDesktopOnlyNotice />
  }

  if (isError) {
    return <AutomationErrorState message="Couldn't load this workflow." onRetry={() => refetch()} />
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!workflow) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-body font-medium">Workflow not found.</p>
        <p className="text-body-sm text-muted-foreground">
          This workflow doesn't exist or may have been removed.
        </p>
      </div>
    )
  }

  return <DesktopWorkflowDetailContent workflow={workflow} />
}
