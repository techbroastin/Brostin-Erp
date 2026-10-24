import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MessageLogDesktopOnlyNotice } from '@/features/notifications/components/shared/MessageParts'
import { DesktopMessageLogContent } from '@/features/notifications/components/desktop/DesktopMessageLogContent'

/** /campaigns/messages — Message Log. Desktop Admin only. */
export function MessageLogScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopMessageLogContent /> : <MessageLogDesktopOnlyNotice />
}
