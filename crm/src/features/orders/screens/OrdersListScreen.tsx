import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileOrderListContent } from '@/features/orders/components/mobile/MobileOrderListContent'
import { DesktopOrderListContent } from '@/features/orders/components/desktop/DesktopOrderListContent'

/**
 * Orders list route element. Mobile and desktop each own their query
 * (growing-pageSize "Load more" vs page/sort/filter-based pagination are
 * structurally different data needs) — same reasoning as
 * CustomersListScreen, not DashboardScreen's single shared query.
 */
export function OrdersListScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopOrderListContent /> : <MobileOrderListContent />
}

/** /orders/today — docs/NAVIGATION.md §9.2: today's orders only, same list otherwise. */
export function OrdersTodayScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopOrderListContent todayOnly /> : <MobileOrderListContent todayOnly />
}
