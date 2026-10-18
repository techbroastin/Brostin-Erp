import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { AutomationDesktopOnlyNotice } from '@/features/automation/components/shared/AutomationDesktopOnlyNotice'
import { DesktopCreateWorkflowContent } from '@/features/automation/components/desktop/DesktopCreateWorkflowContent'

/** Create Workflow route element — /automation/new. Desktop Admin only. */
export function CreateWorkflowScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopCreateWorkflowContent /> : <AutomationDesktopOnlyNotice />
}
