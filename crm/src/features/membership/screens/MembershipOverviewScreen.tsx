import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileMembershipOverviewContent } from '@/features/membership/components/mobile/MobileMembershipOverviewContent'
import { DesktopMembershipOverviewContent } from '@/features/membership/components/desktop/DesktopMembershipOverviewContent'

/** Membership Overview route element — /membership. */
export function MembershipOverviewScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopMembershipOverviewContent /> : <MobileMembershipOverviewContent />
}
