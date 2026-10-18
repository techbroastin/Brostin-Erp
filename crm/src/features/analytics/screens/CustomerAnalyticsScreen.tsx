import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileCustomerAnalyticsContent } from '@/features/analytics/components/mobile/MobileCustomerAnalyticsContent'
import { DesktopCustomerAnalyticsContent } from '@/features/analytics/components/desktop/DesktopCustomerAnalyticsContent'

/** Customer Analytics route element — /analytics/customers. */
export function CustomerAnalyticsScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopCustomerAnalyticsContent /> : <MobileCustomerAnalyticsContent />
}
