import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileReferralRewardsContent } from '@/features/referrals/components/mobile/MobileReferralRewardsContent'
import { DesktopReferralRewardsContent } from '@/features/referrals/components/desktop/DesktopReferralRewardsContent'

/** Referral Rewards route element — /referrals/rewards. */
export function ReferralRewardsScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopReferralRewardsContent /> : <MobileReferralRewardsContent />
}
