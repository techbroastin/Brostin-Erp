import { Link } from 'react-router-dom'
import { LineChart } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { KpiCard, KpiCardSkeleton, type KpiCardData } from '@/components/shared/KpiCard'
import { AnalyticsErrorState } from '@/features/analytics/components/shared/AnalyticsErrorState'
import { useSalesAnalytics } from '@/features/analytics/hooks/useSalesAnalytics'
import type { SalesBreakdownEntry } from '@/features/analytics/types/analytics'

function BreakdownRows({ entries }: { entries: SalesBreakdownEntry[] }) {
  return (
    <>
      {entries.map((entry) => (
        <div key={entry.key} className="flex items-center justify-between text-body-sm">
          <span className="text-muted-foreground">{entry.label}</span>
          <span className="font-medium">
            {entry.count} · ₹{entry.value}
          </span>
        </div>
      ))}
    </>
  )
}

/** Mobile Sales Analytics — all three breakdowns combined into one list, simplified from desktop's three cards. */
export function MobileSalesAnalyticsContent() {
  const { data, isPending, isError, refetch } = useSalesAnalytics()

  const kpis: KpiCardData[] = data
    ? [
        { id: 'total-order-value', label: 'Total Order Value (All Orders)', value: `₹${data.totalOrderValue}` },
        { id: 'total-orders', label: 'Total Orders', value: String(data.totalOrders) },
      ]
    : []

  return (
    <div className="flex flex-col gap-6 p-4">
      <DemoDataBadge />
      <h2 className="text-page-title font-semibold">Sales</h2>

      {isError ? (
        <AnalyticsErrorState message="Couldn't load sales analytics." onRetry={() => refetch()} />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {isPending
              ? [0, 1].map((i) => <KpiCardSkeleton key={i} />)
              : kpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {isPending ? null : (
                <>
                  <BreakdownRows entries={data!.byOrderType} />
                  <BreakdownRows entries={data!.byPaymentMethod} />
                  <BreakdownRows entries={data!.bySource} />
                </>
              )}
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
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-body-sm"
                    >
                      <span>{order.orderNumber}</span>
                      <span className="font-medium">₹{order.grandTotal}</span>
                    </Link>
                  ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border text-center text-muted-foreground">
                <LineChart className="size-6" />
                <p className="max-w-xs text-body-sm">
                  Charting library not yet selected — see docs/FRONTEND_ARCHITECTURE.md §2.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
