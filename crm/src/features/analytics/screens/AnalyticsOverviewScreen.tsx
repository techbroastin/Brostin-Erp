import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileAnalyticsOverviewContent } from '@/features/analytics/components/mobile/MobileAnalyticsOverviewContent'
import { DesktopAnalyticsOverviewContent } from '@/features/analytics/components/desktop/DesktopAnalyticsOverviewContent'

/** Analytics Overview route element — /analytics. */
export function AnalyticsOverviewScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopAnalyticsOverviewContent /> : <MobileAnalyticsOverviewContent />
}
