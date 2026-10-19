import { useParams } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileSettingsContent } from '@/features/settings/components/mobile/MobileSettingsContent'
import { usePosConnection } from '@/features/pos-integrations/hooks/usePosConnection'
import { PosIntegrationsErrorState } from '@/features/pos-integrations/components/shared/PosIntegrationsErrorState'
import { DesktopPosConnectionDetailContent } from '@/features/pos-integrations/components/desktop/DesktopPosConnectionDetailContent'

/** Connection Detail route element — /settings/integrations/:connectionId. Not a menu item. */
export function PosConnectionDetailScreen() {
  const { connectionId } = useParams<{ connectionId: string }>()
  const isDesktop = useIsDesktopViewport()
  const { data: connection, isPending, isError, refetch } = usePosConnection(connectionId ?? '')

  if (!isDesktop) {
    return <MobileSettingsContent />
  }

  if (isError) {
    return <PosIntegrationsErrorState message="Couldn't load this connection." onRetry={() => refetch()} />
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!connection) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-body font-medium">Connection not found.</p>
        <p className="text-body-sm text-muted-foreground">
          This connection doesn't exist or may have been removed.
        </p>
      </div>
    )
  }

  return <DesktopPosConnectionDetailContent connection={connection} />
}
