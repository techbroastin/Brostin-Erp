import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { KpiCard, KpiCardSkeleton, type KpiCardData } from '@/components/shared/KpiCard'
import { AnalyticsErrorState } from '@/features/analytics/components/shared/AnalyticsErrorState'
import { useCustomerAnalytics } from '@/features/analytics/hooks/useCustomerAnalytics'

/**
 * Desktop Customer Analytics — rankings use only existing Customer
 * fields/services: orderCount ranking is computed over
 * customerService.listCustomers(); points ranking is reused verbatim
 * from loyaltyService.listCustomerBalances(sortBy: 'points'). Both
 * rankings shown on desktop per approved decision; mobile splits them
 * across Customers (orders) and Loyalty (points) screens.
 */
export function DesktopCustomerAnalyticsContent() {
  const { data, isPending, isError, refetch } = useCustomerAnalytics()

  const kpis: KpiCardData[] = data
    ? [
        { id: 'total-customers', label: 'Total Customers', value: String(data.totalCustomers) },
        { id: 'customers-with-orders', label: 'Customers with Orders', value: String(data.customersWithOrders) },
        {
          id: 'customers-with-points',
          label: 'Customers with Loyalty Points',
          value: String(data.customersWithLoyaltyPoints),
        },
      ]
    : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">Customers</h1>
        <DemoDataBadge />
      </div>

      {isError ? (
        <AnalyticsErrorState message="Couldn't load customer analytics." onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            {isPending
              ? [0, 1, 2].map((i) => <KpiCardSkeleton key={i} />)
              : kpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Customers by Orders</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {isPending
                  ? null
                  : data!.topCustomersByOrders.map((c) => (
                      <Link
                        key={c.id}
                        to={`/customers/${c.id}`}
                        className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-body-sm hover:bg-accent"
                      >
                        <span>{c.name}</span>
                        <span className="font-medium">{c.orderCount} orders</span>
                      </Link>
                    ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Customers by Points</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {isPending
                  ? null
                  : data!.topCustomersByPoints.map((c) => (
                      <Link
                        key={c.id}
                        to={`/customers/${c.id}`}
                        className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-body-sm hover:bg-accent"
                      >
                        <span>{c.name}</span>
                        <span className="font-medium">{c.points ?? 0} pts</span>
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
