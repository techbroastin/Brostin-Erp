import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileMembershipPlansContent } from '@/features/membership/components/mobile/MobileMembershipPlansContent'
import { DesktopMembershipPlansContent } from '@/features/membership/components/desktop/DesktopMembershipPlansContent'

/** Membership Plans route element — /membership/plans. */
export function MembershipPlansScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopMembershipPlansContent /> : <MobileMembershipPlansContent />
}
