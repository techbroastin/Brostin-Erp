import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileRewardsContent } from '@/features/loyalty/components/mobile/MobileRewardsContent'
import { DesktopRewardsContent } from '@/features/loyalty/components/desktop/DesktopRewardsContent'

/** Rewards route element — /loyalty/rewards. */
export function RewardsScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopRewardsContent /> : <MobileRewardsContent />
}
