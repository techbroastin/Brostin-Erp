import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { AutomationDesktopOnlyNotice } from '@/features/automation/components/shared/AutomationDesktopOnlyNotice'
import { DesktopWorkflowsContent } from '@/features/automation/components/desktop/DesktopWorkflowsContent'

/** Workflows route element — /automation/workflows. Desktop Admin only. */
export function WorkflowsScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopWorkflowsContent /> : <AutomationDesktopOnlyNotice />
}
