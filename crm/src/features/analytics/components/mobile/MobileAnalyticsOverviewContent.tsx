import { Link } from 'react-router-dom'
import { TrendingUp, Users, Gift, Megaphone } from 'lucide-react'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { KpiCard, KpiCardSkeleton, type KpiCardData } from '@/components/shared/KpiCard'
import { AnalyticsErrorState } from '@/features/analytics/components/shared/AnalyticsErrorState'
import { useAnalyticsOverview } from '@/features/analytics/hooks/useAnalyticsOverview'

/** Mobile Analytics Overview — docs/MOBILE_UI_SPEC.md §20: operational visibility only. */
export function MobileAnalyticsOverviewContent() {
  const { data, isPending, isError, refetch } = useAnalyticsOverview()

  const kpis: KpiCardData[] = data
    ? [
        { id: 'total-order-value', label: 'Total Order Value (All Orders)', value: `₹${data.totalOrderValue}` },
        { id: 'total-orders', label: 'Total Orders', value: String(data.totalOrders) },
        { id: 'total-customers', label: 'Total Customers', value: String(data.totalCustomers) },
        {
          id: 'total-points-outstanding',
          label: 'Total Loyalty Points Outstanding',
          value: String(data.totalLoyaltyPointsOutstanding),
        },
      ]
    : []

  return (
    <div className="flex flex-col gap-6 p-4">
      <DemoDataBadge />
      <h2 className="text-page-title font-semibold">Overview</h2>

      {isError ? (
        <AnalyticsErrorState message="Couldn't load analytics overview." onRetry={() => refetch()} />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {isPending
              ? [0, 1, 2, 3].map((i) => <KpiCardSkeleton key={i} />)
              : kpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
          </div>

          <div className="flex flex-col gap-2">
            <Link
              to="/analytics/sales"
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-body-sm font-medium"
            >
              <TrendingUp className="size-4 shrink-0" />
              Sales
            </Link>
            <Link
              to="/analytics/customers"
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-body-sm font-medium"
            >
              <Users className="size-4 shrink-0" />
              Customers
            </Link>
            <Link
              to="/analytics/loyalty"
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-body-sm font-medium"
            >
              <Gift className="size-4 shrink-0" />
              Loyalty
            </Link>
            <Link
              to="/analytics/marketing"
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-body-sm font-medium"
            >
              <Megaphone className="size-4 shrink-0" />
              Marketing
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
