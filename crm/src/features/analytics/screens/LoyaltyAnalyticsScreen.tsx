import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileLoyaltyAnalyticsContent } from '@/features/analytics/components/mobile/MobileLoyaltyAnalyticsContent'
import { DesktopLoyaltyAnalyticsContent } from '@/features/analytics/components/desktop/DesktopLoyaltyAnalyticsContent'

/** Loyalty Analytics route element — /analytics/loyalty. */
export function LoyaltyAnalyticsScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopLoyaltyAnalyticsContent /> : <MobileLoyaltyAnalyticsContent />
}
