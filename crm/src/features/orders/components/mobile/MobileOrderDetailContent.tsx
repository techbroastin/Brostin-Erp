import { Link } from 'react-router-dom'
import { Phone, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { OrderStatusBadge } from '@/features/orders/components/shared/OrderStatusBadge'
import type { Order } from '@/features/orders/types/order'

const typeLabel: Record<Order['orderType'], string> = {
  takeaway: 'Takeaway',
  delivery: 'Delivery',
  dining: 'Dining',
}

/**
 * docs/MOBILE_UI_SPEC.md §15 — header/status/type/timestamp, customer
 * (linked to Customer Detail), items, totals, payment, delivery address
 * only for delivery orders. h2, not h1 — MobileHeader already renders
 * this screen's page h1 (same fix applied in Phase 4).
 */
export function MobileOrderDetailContent({ order }: { order: Order }) {
  return (
    <div className="flex flex-col gap-6 p-4">
      <section className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-page-title font-semibold">{order.orderNumber}</h2>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-body-sm text-muted-foreground">
          {typeLabel[order.orderType]} ·{' '}
          {new Date(order.createdAt).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-section-title font-semibold">Customer</h2>
        <Card>
          <CardContent className="flex flex-col gap-1.5">
            <Link to={`/customers/${order.customerId}`} className="text-body font-medium underline-offset-4 hover:underline">
              {order.customerName}
            </Link>
            <p className="flex items-center gap-1.5 text-body-sm text-muted-foreground">
              <Phone className="size-3.5 shrink-0" />
              {order.customerPhone}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-section-title font-semibold">Items</h2>
        <Card>
          <CardContent className="flex flex-col gap-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-body-sm font-medium">{item.productName}</p>
                  <p className="text-caption text-muted-foreground">
                    {item.quantity} × ₹{item.unitPrice}
                  </p>
                </div>
                <span className="shrink-0 text-body-sm font-medium">₹{item.lineTotal}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-section-title font-semibold">Totals</h2>
        <Card>
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
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-section-title font-semibold">Payment</h2>
        <Card>
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
      </section>

      {order.orderType === 'delivery' && order.deliveryAddress && (
        <section className="flex flex-col gap-2">
          <h2 className="text-section-title font-semibold">Delivery Address</h2>
          <Card>
            <CardContent className="flex items-start gap-1.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="text-body-sm">
                {order.deliveryAddress.line}, {order.deliveryAddress.area}
                {order.deliveryAddress.landmark ? ` (${order.deliveryAddress.landmark})` : ''}
              </p>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  )
}
