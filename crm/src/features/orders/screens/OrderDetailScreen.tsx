import { useParams } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { useOrderDetail } from '@/features/orders/hooks/useOrderDetail'
import { OrderErrorState } from '@/features/orders/components/shared/OrderErrorState'
import { MobileOrderDetailContent } from '@/features/orders/components/mobile/MobileOrderDetailContent'
import { DesktopOrderDetailContent } from '@/features/orders/components/desktop/DesktopOrderDetailContent'

export function OrderDetailScreen() {
  const { orderId } = useParams<{ orderId: string }>()
  const isDesktop = useIsDesktopViewport()
  const { data: order, isPending, isError, refetch } = useOrderDetail(orderId ?? '')

  if (isError) {
    return (
      <div className={isDesktop ? '' : 'p-4'}>
        <OrderErrorState onRetry={() => refetch()} />
      </div>
    )
  }

  if (isPending) {
    return (
      <div className={isDesktop ? 'flex flex-col gap-4' : 'flex flex-col gap-4 p-4'}>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!order) {
    return (
      <div
        className={
          isDesktop
            ? 'flex flex-col items-center gap-2 py-16 text-center'
            : 'flex flex-col items-center gap-2 p-4 py-16 text-center'
        }
      >
        <p className="text-body font-medium">Order not found.</p>
        <p className="text-body-sm text-muted-foreground">
          This order doesn't exist or may have been removed.
        </p>
      </div>
    )
  }

  return isDesktop ? (
    <DesktopOrderDetailContent order={order} />
  ) : (
    <MobileOrderDetailContent order={order} />
  )
}
