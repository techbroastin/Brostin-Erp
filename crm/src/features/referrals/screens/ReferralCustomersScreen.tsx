import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileReferralCustomersContent } from '@/features/referrals/components/mobile/MobileReferralCustomersContent'
import { DesktopReferralCustomersContent } from '@/features/referrals/components/desktop/DesktopReferralCustomersContent'

/** Referral Customers route element — /referrals/customers. */
export function ReferralCustomersScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopReferralCustomersContent /> : <MobileReferralCustomersContent />
}
