import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileQrOverviewContent } from '@/features/qr/components/mobile/MobileQrOverviewContent'
import { DesktopQrOverviewContent } from '@/features/qr/components/desktop/DesktopQrOverviewContent'

/** QR Overview route element — /qr. */
export function QrOverviewScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopQrOverviewContent /> : <MobileQrOverviewContent />
}
