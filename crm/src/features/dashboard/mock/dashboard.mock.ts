import type { DashboardSummary } from '@/features/dashboard/types/dashboard'

/**
 * Dashboard mock data — the single feature-local mock source, per
 * docs/FRONTEND_ARCHITECTURE.md §6/§16. Three scenarios exist: normal,
 * empty, error. Only src/features/dashboard/services/dashboardService.ts
 * may import this file — no component imports it directly.
 *
 * Values here are illustrative placeholders only. They are not final
 * business metric definitions (docs/NAVIGATION.md §7/§24 mark exact
 * dashboard metrics and quick actions NOT YET FINALIZED) and must not be
 * mistaken for real figures — see DemoDataBadge, shown wherever this data
 * renders.
 */

/**
 * Activity/alert hrefs below point at real, existing records from
 * orders.mock.ts/customers.mock.ts (ord-001/cust-002, etc. — same
 * deterministic `cust-${index+1}`/`ord-${index+1}` id scheme those
 * files use) and real existing routes (/feedback/negative), per the
 * Functional Navigation task: no fabricated ids or screens.
 */
export const normalDashboardSummary: DashboardSummary = {
  kpis: [
    { id: 'orders-today', label: "Today's Orders", value: '18', trend: 'up', trendLabel: 'vs yesterday', href: '/orders' },
    { id: 'revenue-today', label: "Today's Revenue", value: '₹9,420', trend: 'up', trendLabel: 'vs yesterday', href: '/analytics/sales' },
    { id: 'new-customers', label: 'New Customers', value: '4', trend: 'flat', trendLabel: 'vs yesterday', href: '/customers' },
    { id: 'active-alerts', label: 'Open Alerts', value: '2', trend: 'down', trendLabel: 'vs yesterday' },
  ],
  activity: [
    { id: 'act-1', title: 'Order BR-1040 placed', detail: 'Takeaway — 1 item', timestamp: '5 min ago', href: '/orders/ord-001' },
    { id: 'act-2', title: 'Order BR-1045 delivered', detail: 'Order completed', timestamp: '22 min ago', href: '/orders/ord-006' },
    { id: 'act-3', title: 'New customer identified', detail: 'Divya Pillai', timestamp: '1 hr ago', href: '/customers/cust-002' },
  ],
  alerts: [
    { id: 'alert-1', message: 'Order BR-1040 pending for over 20 minutes', severity: 'warning', href: '/orders/ord-001' },
    { id: 'alert-2', message: 'Negative feedback awaiting review', severity: 'info', href: '/feedback/negative' },
  ],
}

export const emptyDashboardSummary: DashboardSummary = {
  kpis: [
    { id: 'orders-today', label: "Today's Orders", value: '0' },
    { id: 'revenue-today', label: "Today's Revenue", value: '₹0' },
    { id: 'new-customers', label: 'New Customers', value: '0' },
    { id: 'active-alerts', label: 'Open Alerts', value: '0' },
  ],
  activity: [],
  alerts: [],
}

/**
 * Not a data scenario — a sentinel dashboardService checks for to throw a
 * simulated failure, exercising DashboardErrorState.
 */
export const ERROR_SCENARIO_FLAG = 'error'

export type DashboardMockScenario = 'normal' | 'empty' | typeof ERROR_SCENARIO_FLAG
