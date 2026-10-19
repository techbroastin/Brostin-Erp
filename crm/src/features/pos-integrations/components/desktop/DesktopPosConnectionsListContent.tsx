import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { PosIntegrationsErrorState } from '@/features/pos-integrations/components/shared/PosIntegrationsErrorState'
import { PosConnectionStatusBadge } from '@/features/pos-integrations/components/shared/PosConnectionStatusBadge'
import { usePosConnections } from '@/features/pos-integrations/hooks/usePosConnections'
import { VENDOR_LABELS } from '@/features/pos-integrations/types/posIntegration'

function formatLastSync(iso: string | null): string {
  if (!iso) return 'Never'
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffHours = Math.round(diffMs / (60 * 60 * 1000))
  if (diffHours < 1) return 'Less than an hour ago'
  if (diffHours === 1) return '1 hour ago'
  if (diffHours < 24) return `${diffHours} hours ago`
  return `${Math.round(diffHours / 24)} day(s) ago`
}

/**
 * POS Connections list — docs/IMPLEMENTATION_PLAN.md §21 (Phase 18)
 * generalized per the approved Phase 18b multi-vendor scope. Replaces
 * the former static DesktopIntegrationsSettingsContent row list with
 * real status, last-sync, and a link to each connection's detail view.
 */
export function DesktopPosConnectionsListContent() {
  const { data, isPending, isError, refetch } = usePosConnections()
  const connections = data ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">POS Connections</h1>
        <div className="flex items-center gap-2">
          <DemoDataBadge />
          <Link to="/settings/integrations/new" className={buttonVariants({ variant: 'default', size: 'sm' })}>
            Add Connection
          </Link>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardContent>
          {isError ? (
            <PosIntegrationsErrorState message="Couldn't load POS connections." onRetry={() => refetch()} />
          ) : isPending ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : connections.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <p className="text-body-sm">No POS connections yet.</p>
              <Link to="/settings/integrations/new" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                Add Connection
              </Link>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {connections.map((connection) => (
                <Link
                  key={connection.id}
                  to={`/settings/integrations/${connection.id}`}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 hover:bg-muted/50"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-body-sm font-medium">{connection.label}</span>
                    <span className="text-caption text-muted-foreground">{VENDOR_LABELS[connection.vendor]}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-caption text-muted-foreground">
                      Last sync: {formatLastSync(connection.lastSuccessfulSyncAt)}
                    </span>
                    <PosConnectionStatusBadge status={connection.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardContent className="flex flex-col gap-2">
          <h2 className="text-body-sm font-semibold text-muted-foreground">Other integrations</h2>
          <div className="flex items-center justify-between text-body-sm">
            <span className="font-medium">QR Ordering</span>
            <span className="text-muted-foreground">Not yet connected</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
