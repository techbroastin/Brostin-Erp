import { Link } from 'react-router-dom'
import { LineChart } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { KpiCard, KpiCardSkeleton, type KpiCardData } from '@/components/shared/KpiCard'
import { AnalyticsErrorState } from '@/features/analytics/components/shared/AnalyticsErrorState'
import { useSalesAnalytics } from '@/features/analytics/hooks/useSalesAnalytics'
import type { SalesBreakdownEntry } from '@/features/analytics/types/analytics'

function BreakdownCard({ title, entries }: { title: string; entries: SalesBreakdownEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {entries.map((entry) => (
          <div key={entry.key} className="flex items-center justify-between text-body-sm">
            <span className="text-muted-foreground">{entry.label}</span>
            <span className="font-medium">
              {entry.count} · ₹{entry.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

/**
 * Desktop Sales Analytics — breakdowns use only existing orderType/
 * paymentMethod/source fields on Order; no new categories invented.
 * Chart placeholder mirrors DesktopDashboardContent.tsx's established
 * convention (docs/FRONTEND_ARCHITECTURE.md §2: charting library not
 * yet selected) — approved decision 1.
 */
export function DesktopSalesAnalyticsContent() {
  const { data, isPending, isError, refetch } = useSalesAnalytics()

  const kpis: KpiCardData[] = data
    ? [
        { id: 'total-order-value', label: 'Total Order Value (All Orders)', value: `₹${data.totalOrderValue}` },
        { id: 'total-orders', label: 'Total Orders', value: String(data.totalOrders) },
      ]
    : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">Sales</h1>
        <DemoDataBadge />
      </div>

      {isError ? (
        <AnalyticsErrorState message="Couldn't load sales analytics." onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid max-w-md grid-cols-2 gap-4">
            {isPending
              ? [0, 1].map((i) => <KpiCardSkeleton key={i} />)
              : kpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {isPending ? (
              [0, 1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="h-24" />
                </Card>
              ))
            ) : (
              <>
                <BreakdownCard title="By Order Type" entries={data!.byOrderType} />
                <BreakdownCard title="By Payment Method" entries={data!.byPaymentMethod} />
                <BreakdownCard title="By Source" entries={data!.bySource} />
              </>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border text-center text-muted-foreground">
                  <LineChart className="size-6" />
                  <p className="max-w-xs text-body-sm">
                    Charting library not yet selected — see docs/FRONTEND_ARCHITECTURE.md §2.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Orders</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {isPending
                  ? null
                  : data!.topOrders.map((order) => (
                      <Link
                        key={order.id}
                        to={`/orders/${order.id}`}
                        className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-body-sm hover:bg-accent"
                      >
                        <span>{order.orderNumber}</span>
                        <span className="font-medium">₹{order.grandTotal}</span>
                      </Link>
                    ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
