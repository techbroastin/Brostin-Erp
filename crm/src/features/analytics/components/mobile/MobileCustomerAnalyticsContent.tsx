import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { KpiCard, KpiCardSkeleton, type KpiCardData } from '@/components/shared/KpiCard'
import { AnalyticsErrorState } from '@/features/analytics/components/shared/AnalyticsErrorState'
import { useCustomerAnalytics } from '@/features/analytics/hooks/useCustomerAnalytics'

/**
 * Mobile Customer Analytics — shows the ranking by order count only;
 * the points ranking is shown on the mobile Loyalty screen instead, per
 * the approved mobile ranking split.
 */
export function MobileCustomerAnalyticsContent() {
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
    <div className="flex flex-col gap-6 p-4">
      <DemoDataBadge />
      <h2 className="text-page-title font-semibold">Customers</h2>

      {isError ? (
        <AnalyticsErrorState message="Couldn't load customer analytics." onRetry={() => refetch()} />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {isPending
              ? [0, 1, 2].map((i) => <KpiCardSkeleton key={i} />)
              : kpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
          </div>

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
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-body-sm"
                    >
                      <span>{c.name}</span>
                      <span className="font-medium">{c.orderCount} orders</span>
                    </Link>
                  ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
