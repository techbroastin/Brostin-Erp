import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { OrderStatusBadge } from '@/features/orders/components/shared/OrderStatusBadge'
import type { Order } from '@/features/orders/types/order'

const sourceLabel: Record<Order['source'], string> = { qr: 'QR', web: 'Web' }

/** docs/MOBILE_UI_SPEC.md §15 — order number, customer, amount, time, source, status. */
export function OrderCard({ order }: { order: Order }) {
  return (
    <Link to={`/orders/${order.id}`}>
      <Card>
        <CardContent className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-body font-medium">{order.orderNumber}</p>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="truncate text-body-sm text-muted-foreground">{order.customerName}</p>
          <div className="flex items-center justify-between text-caption text-muted-foreground">
            <span>
              {new Date(order.createdAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}{' '}
              · {sourceLabel[order.source]}
            </span>
            <span className="font-medium text-foreground">₹{order.grandTotal}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function OrderCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
      </CardContent>
    </Card>
  )
}
