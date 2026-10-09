import { Link } from 'react-router-dom'
import { Phone, MapPin } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { CardSectionHeading } from '@/components/shared/CardSectionHeading'
import { OrderStatusBadge } from '@/features/orders/components/shared/OrderStatusBadge'
import type { Order } from '@/features/orders/types/order'

const typeLabel: Record<Order['orderType'], string> = {
  takeaway: 'Takeaway',
  delivery: 'Delivery',
  dining: 'Dining',
}

/** docs/DESKTOP_UI_SPEC.md — denser multi-column layout, same section set as mobile. */
export function DesktopOrderDetailContent({ order }: { order: Order }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-page-title font-semibold">{order.orderNumber}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <span className="text-body-sm text-muted-foreground">
          {typeLabel[order.orderType]} ·{' '}
          {new Date(order.createdAt).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardSectionHeading>Customer</CardSectionHeading>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5">
            <Link
              to={`/customers/${order.customerId}`}
              className="text-body font-medium underline-offset-4 hover:underline"
            >
              {order.customerName}
            </Link>
            <p className="flex items-center gap-1.5 text-body-sm text-muted-foreground">
              <Phone className="size-3.5 shrink-0" />
              {order.customerPhone}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardSectionHeading>Totals</CardSectionHeading>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5 text-body-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery charge</span>
              <span>₹{order.deliveryCharge}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span>₹{order.discount}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1.5 font-semibold">
              <span>Grand total</span>
              <span>₹{order.grandTotal}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardSectionHeading>Payment</CardSectionHeading>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5 text-body-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Method</span>
              <span className="capitalize">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="capitalize">{order.paymentStatus}</span>
            </div>
            {order.paymentReference && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span>{order.paymentReference}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardSectionHeading>Items</CardSectionHeading>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2">
              <p className="text-body-sm font-medium">{item.productName}</p>
              <p className="text-body-sm text-muted-foreground">
                {item.quantity} × ₹{item.unitPrice} = ₹{item.lineTotal}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {order.orderType === 'delivery' && order.deliveryAddress && (
        <Card>
          <CardHeader>
            <CardSectionHeading>Delivery Address</CardSectionHeading>
          </CardHeader>
          <CardContent className="flex items-start gap-1.5">
            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p className="text-body-sm">
              {order.deliveryAddress.line}, {order.deliveryAddress.area}
              {order.deliveryAddress.landmark ? ` (${order.deliveryAddress.landmark})` : ''}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
