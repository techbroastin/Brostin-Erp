import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileLoyaltyOverviewContent } from '@/features/loyalty/components/mobile/MobileLoyaltyOverviewContent'
import { DesktopLoyaltyOverviewContent } from '@/features/loyalty/components/desktop/DesktopLoyaltyOverviewContent'

/** Loyalty Overview route element — /loyalty. */
export function LoyaltyOverviewScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopLoyaltyOverviewContent /> : <MobileLoyaltyOverviewContent />
}
