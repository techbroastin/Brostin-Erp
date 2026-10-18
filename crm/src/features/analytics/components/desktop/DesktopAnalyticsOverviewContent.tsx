import { Link } from 'react-router-dom'
import { TrendingUp, Users, Gift, Megaphone } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { KpiCard, KpiCardSkeleton, type KpiCardData } from '@/components/shared/KpiCard'
import { AnalyticsErrorState } from '@/features/analytics/components/shared/AnalyticsErrorState'
import { useAnalyticsOverview } from '@/features/analytics/hooks/useAnalyticsOverview'

/**
 * Desktop Analytics Overview — canonical docs/IMPLEMENTATION_PLAN.md
 * "Phase 14 — Analytics". Four KPIs, each sourced from an existing
 * feature's own service (see analyticsService.ts) — no new mock data.
 * "Total Order Value (All Orders)" is explicitly labeled to avoid
 * implying collected revenue or cash received.
 */
export function DesktopAnalyticsOverviewContent() {
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">Overview</h1>
        <DemoDataBadge />
      </div>

      {isError ? (
        <AnalyticsErrorState message="Couldn't load analytics overview." onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            {isPending
              ? [0, 1, 2, 3].map((i) => <KpiCardSkeleton key={i} />)
              : kpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Analytics Module</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Link to="/analytics/sales" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                <TrendingUp className="size-4" />
                Sales
              </Link>
              <Link to="/analytics/customers" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                <Users className="size-4" />
                Customers
              </Link>
              <Link to="/analytics/loyalty" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                <Gift className="size-4" />
                Loyalty
              </Link>
              <Link to="/analytics/marketing" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                <Megaphone className="size-4" />
                Marketing
              </Link>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
