import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileSalesAnalyticsContent } from '@/features/analytics/components/mobile/MobileSalesAnalyticsContent'
import { DesktopSalesAnalyticsContent } from '@/features/analytics/components/desktop/DesktopSalesAnalyticsContent'

/** Sales Analytics route element — /analytics/sales. */
export function SalesAnalyticsScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopSalesAnalyticsContent /> : <MobileSalesAnalyticsContent />
}
