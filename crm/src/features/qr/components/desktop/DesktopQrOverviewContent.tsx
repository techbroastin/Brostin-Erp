import { Link } from 'react-router-dom'
import { ClipboardList, Settings as SettingsIcon } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { KpiCard, KpiCardSkeleton, type KpiCardData } from '@/components/shared/KpiCard'
import { OrderErrorState } from '@/features/orders/components/shared/OrderErrorState'
import { useQrOverview } from '@/features/qr/hooks/useQrOverview'

/**
 * Desktop QR Overview — canonical docs/IMPLEMENTATION_PLAN.md
 * "Phase 13 — QR Administration". Single KPI (Total QR Orders) +
 * quick links to the other two approved QR screens. No "today"/trend
 * KPI — no established date-boundary convention exists in this
 * project to compute one from (see qrService.ts). Error state reused
 * directly from the Orders feature, since this data is Orders data.
 */
export function DesktopQrOverviewContent() {
  const { data, isPending, isError, refetch } = useQrOverview()

  const kpis: KpiCardData[] = data
    ? [{ id: 'total-qr-orders', label: 'Total QR Orders', value: String(data.totalQrOrders) }]
    : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">Overview</h1>
        <DemoDataBadge />
      </div>

      {isError ? (
        <OrderErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid max-w-xs grid-cols-1 gap-4">
            {isPending
              ? [0].map((i) => <KpiCardSkeleton key={i} />)
              : kpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>QR Module</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Link to="/qr/orders" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                <ClipboardList className="size-4" />
                QR Orders
              </Link>
              <Link to="/qr/settings" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                <SettingsIcon className="size-4" />
                QR Settings
              </Link>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
