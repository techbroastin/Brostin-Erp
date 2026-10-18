import { Link } from 'react-router-dom'
import { ClipboardList, Settings as SettingsIcon } from 'lucide-react'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { KpiCard, KpiCardSkeleton, type KpiCardData } from '@/components/shared/KpiCard'
import { OrderErrorState } from '@/features/orders/components/shared/OrderErrorState'
import { useQrOverview } from '@/features/qr/hooks/useQrOverview'

/**
 * Mobile QR Overview — docs/MOBILE_UI_SPEC.md §20: operational
 * visibility only. h2, not h1 — MobileHeader already renders this
 * screen's page h1 ("QR", shared by all three QR routes).
 */
export function MobileQrOverviewContent() {
  const { data, isPending, isError, refetch } = useQrOverview()

  const kpis: KpiCardData[] = data
    ? [{ id: 'total-qr-orders', label: 'Total QR Orders', value: String(data.totalQrOrders) }]
    : []

  return (
    <div className="flex flex-col gap-6 p-4">
      <DemoDataBadge />
      <h2 className="text-page-title font-semibold">Overview</h2>

      {isError ? (
        <OrderErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {isPending
              ? [0].map((i) => <KpiCardSkeleton key={i} />)
              : kpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
          </div>

          <div className="flex flex-col gap-2">
            <Link
              to="/qr/orders"
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-body-sm font-medium"
            >
              <ClipboardList className="size-4 shrink-0" />
              QR Orders
            </Link>
            <Link
              to="/qr/settings"
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-body-sm font-medium"
            >
              <SettingsIcon className="size-4 shrink-0" />
              QR Settings
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
