import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileSettingsContent } from '@/features/settings/components/mobile/MobileSettingsContent'
import { DesktopPosConnectionsListContent } from '@/features/pos-integrations/components/desktop/DesktopPosConnectionsListContent'

/**
 * POS Connections route element — /settings/integrations. Settings is
 * DESKTOP ADMIN and Mobile Manager (LIMITED), so mobile falls back to
 * the same shared MobileSettingsContent every other /settings/* route
 * uses, per docs/NAVIGATION.md §19 and router.tsx's existing comment.
 */
export function PosConnectionsScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopPosConnectionsListContent /> : <MobileSettingsContent />
}
