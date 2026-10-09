import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileCustomerBalancesContent } from '@/features/loyalty/components/mobile/MobileCustomerBalancesContent'
import { DesktopCustomerBalancesContent } from '@/features/loyalty/components/desktop/DesktopCustomerBalancesContent'

/** Customer Balances route element — /loyalty/customers. */
export function CustomerBalancesScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopCustomerBalancesContent /> : <MobileCustomerBalancesContent />
}
