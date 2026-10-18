import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileQrOrdersContent } from '@/features/qr/components/mobile/MobileQrOrdersContent'
import { DesktopQrOrdersContent } from '@/features/qr/components/desktop/DesktopQrOrdersContent'

/** QR Orders route element — /qr/orders. */
export function QrOrdersScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopQrOrdersContent /> : <MobileQrOrdersContent />
}
