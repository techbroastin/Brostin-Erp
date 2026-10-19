/**
 * Dashboard feature types. These are provisional frontend view models, not
 * the Broastin standard data model (NOT YET FINALIZED per
 * docs/FRONTEND_ARCHITECTURE.md §16) — expect them to be remapped once a
 * real backend shape exists.
 */

export type TrendDirection = 'up' | 'down' | 'flat'

export type DashboardKpi = {
  id: string
  label: string
  value: string
  trend?: TrendDirection
  trendLabel?: string
  /** Module this KPI opens, e.g. '/orders'. Omitted when no single destination exists. */
  href?: string
}

export type ActivityItem = {
  id: string
  title: string
  detail: string
  timestamp: string
  /** Route to the specific record this activity refers to — a real, existing order/customer id. */
  href?: string
}

export type AlertSeverity = 'info' | 'warning' | 'error'

export type AlertItem = {
  id: string
  message: string
  severity: AlertSeverity
  /** Route to where this alert can be resolved. */
  href?: string
}

export type DashboardSummary = {
  kpis: DashboardKpi[]
  activity: ActivityItem[]
  alerts: AlertItem[]
}
