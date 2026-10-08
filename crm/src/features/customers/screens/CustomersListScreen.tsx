import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileCustomerListContent } from '@/features/customers/components/mobile/MobileCustomerListContent'
import { DesktopCustomerListContent } from '@/features/customers/components/desktop/DesktopCustomerListContent'

/**
 * Customers list route element. Mobile and desktop each own their query
 * (growing-pageSize "Load more" vs page/sort-based pagination are
 * structurally different data needs, unlike Dashboard's single shared
 * query) — so, unlike DashboardScreen, this screen only picks the shell
 * composition and does no fetching itself.
 */
export function CustomersListScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopCustomerListContent /> : <MobileCustomerListContent />
}
