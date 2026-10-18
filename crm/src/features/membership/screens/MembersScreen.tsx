import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileMembersContent } from '@/features/membership/components/mobile/MobileMembersContent'
import { DesktopMembersContent } from '@/features/membership/components/desktop/DesktopMembersContent'

/** Members route element — /membership/members. */
export function MembersScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopMembersContent /> : <MobileMembersContent />
}
