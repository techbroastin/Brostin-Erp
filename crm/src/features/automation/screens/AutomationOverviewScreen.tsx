import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { AutomationDesktopOnlyNotice } from '@/features/automation/components/shared/AutomationDesktopOnlyNotice'
import { DesktopAutomationOverviewContent } from '@/features/automation/components/desktop/DesktopAutomationOverviewContent'

/** Automation Overview route element — /automation. Desktop Admin only. */
export function AutomationOverviewScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopAutomationOverviewContent /> : <AutomationDesktopOnlyNotice />
}
