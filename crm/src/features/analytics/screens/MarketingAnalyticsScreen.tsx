import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileMarketingAnalyticsContent } from '@/features/analytics/components/mobile/MobileMarketingAnalyticsContent'
import { DesktopMarketingAnalyticsContent } from '@/features/analytics/components/desktop/DesktopMarketingAnalyticsContent'

/** Marketing Analytics route element — /analytics/marketing. */
export function MarketingAnalyticsScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopMarketingAnalyticsContent /> : <MobileMarketingAnalyticsContent />
}
