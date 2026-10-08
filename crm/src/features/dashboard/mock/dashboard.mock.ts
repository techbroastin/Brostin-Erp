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

export const normalDashboardSummary: DashboardSummary = {
  kpis: [
    { id: 'orders-today', label: "Today's Orders", value: '18', trend: 'up', trendLabel: 'vs yesterday' },
    { id: 'revenue-today', label: "Today's Revenue", value: '₹9,420', trend: 'up', trendLabel: 'vs yesterday' },
    { id: 'new-customers', label: 'New Customers', value: '4', trend: 'flat', trendLabel: 'vs yesterday' },
    { id: 'active-alerts', label: 'Open Alerts', value: '2', trend: 'down', trendLabel: 'vs yesterday' },
  ],
  activity: [
    { id: 'act-1', title: 'Order #1042 placed', detail: 'Takeaway — 2 items', timestamp: '5 min ago' },
    { id: 'act-2', title: 'Order #1041 delivered', detail: 'Delivery — customer confirmed', timestamp: '22 min ago' },
    { id: 'act-3', title: 'New customer identified', detail: 'Phone ending 4821', timestamp: '1 hr ago' },
  ],
  alerts: [
    { id: 'alert-1', message: 'Order #1038 pending for over 20 minutes', severity: 'warning' },
    { id: 'alert-2', message: '2 negative feedback items await review', severity: 'info' },
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
