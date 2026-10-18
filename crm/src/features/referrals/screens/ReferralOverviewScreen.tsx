import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileReferralOverviewContent } from '@/features/referrals/components/mobile/MobileReferralOverviewContent'
import { DesktopReferralOverviewContent } from '@/features/referrals/components/desktop/DesktopReferralOverviewContent'

/** Referrals Overview route element — /referrals. */
export function ReferralOverviewScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopReferralOverviewContent /> : <MobileReferralOverviewContent />
}
