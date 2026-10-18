import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileMembershipActivityContent } from '@/features/membership/components/mobile/MobileMembershipActivityContent'
import { DesktopMembershipActivityContent } from '@/features/membership/components/desktop/DesktopMembershipActivityContent'

/** Membership Activity route element — /membership/activity. */
export function MembershipActivityScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopMembershipActivityContent /> : <MobileMembershipActivityContent />
}
