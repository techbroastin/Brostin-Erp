import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileReferralActivityContent } from '@/features/referrals/components/mobile/MobileReferralActivityContent'
import { DesktopReferralActivityContent } from '@/features/referrals/components/desktop/DesktopReferralActivityContent'

/** Referral Activity route element — /referrals/activity. */
export function ReferralActivityScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopReferralActivityContent /> : <MobileReferralActivityContent />
}
