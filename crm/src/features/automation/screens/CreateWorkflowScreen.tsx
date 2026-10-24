import { useParams } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { useAutomationWorkflow } from '@/features/automation/hooks/useAutomationWorkflow'
import { AutomationErrorState } from '@/features/automation/components/shared/AutomationErrorState'
import { AutomationDesktopOnlyNotice } from '@/features/automation/components/shared/AutomationDesktopOnlyNotice'
import { DesktopCreateWorkflowContent } from '@/features/automation/components/desktop/DesktopCreateWorkflowContent'

/** Create Workflow route element — /automation/new. Desktop Admin only. */
export function CreateWorkflowScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopCreateWorkflowContent /> : <AutomationDesktopOnlyNotice />
}

/** /automation/:workflowId/edit — draft or paused workflows only. Desktop Admin only. */
export function EditWorkflowScreen() {
  const { workflowId } = useParams<{ workflowId: string }>()
  const isDesktop = useIsDesktopViewport()
  const { data: workflow, isPending, isError, refetch } = useAutomationWorkflow(workflowId ?? '')

  if (!isDesktop) return <AutomationDesktopOnlyNotice />
  if (isError) return <AutomationErrorState message="Couldn't load this workflow." onRetry={() => refetch()} />
  if (isPending) return <Skeleton className="h-64 w-full" />
  if (!workflow) {
    return <p className="py-16 text-center text-body font-medium">Workflow not found.</p>
  }
  if (workflow.status === 'active') {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-body font-medium">Pause this workflow before editing it.</p>
        <p className="text-body-sm text-muted-foreground">A live rule can't change while it's running.</p>
      </div>
    )
  }
  return <DesktopCreateWorkflowContent key={workflow.id} workflow={workflow} />
}
