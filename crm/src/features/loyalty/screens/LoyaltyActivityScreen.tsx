import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileLoyaltyActivityContent } from '@/features/loyalty/components/mobile/MobileLoyaltyActivityContent'
import { DesktopLoyaltyActivityContent } from '@/features/loyalty/components/desktop/DesktopLoyaltyActivityContent'

/** Activity route element — /loyalty/activity. */
export function LoyaltyActivityScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopLoyaltyActivityContent /> : <MobileLoyaltyActivityContent />
}
