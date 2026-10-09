import { Link } from 'react-router-dom'
import { ArrowUpDown } from 'lucide-react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import { OrderStatusBadge } from '@/features/orders/components/shared/OrderStatusBadge'
import type { Order, OrderSortBy } from '@/features/orders/types/order'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 10

const typeLabel: Record<Order['orderType'], string> = {
  takeaway: 'Takeaway',
  delivery: 'Delivery',
  dining: 'Dining',
}

/**
 * docs/DESKTOP_UI_SPEC.md §9 — sortable columns, status-as-badge, row
 * action, pagination. Real <table> semantics throughout.
 */
export function OrderTable({
  items,
  isLoading,
  sortBy,
  onSortChange,
  page,
  total,
  onPageChange,
}: {
  items: Order[]
  isLoading: boolean
  sortBy: OrderSortBy
  onSortChange: (sortBy: OrderSortBy) => void
  page: number
  total: number
  onPageChange: (page: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>
              <button
                type="button"
                onClick={() => onSortChange('createdAt')}
                className={cn('flex items-center gap-1', sortBy === 'createdAt' && 'text-foreground')}
              >
                Date/Time
                <ArrowUpDown className="size-3.5" />
              </button>
            </TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>
              <button
                type="button"
                onClick={() => onSortChange('grandTotal')}
                className={cn('flex items-center gap-1', sortBy === 'grandTotal' && 'text-foreground')}
              >
                Total
                <ArrowUpDown className="size-3.5" />
              </button>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : items.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </TableCell>
                  <TableCell>{typeLabel[order.orderType]}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="capitalize">{order.paymentStatus}</TableCell>
                  <TableCell>₹{order.grandTotal}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      to={`/orders/${order.id}`}
                      className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between text-body-sm text-muted-foreground">
        <span>
          {isLoading
            ? 'Loading…'
            : total === 0
              ? '0 orders'
              : `Page ${page} of ${totalPages} · ${total} orders`}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isLoading || page <= 1}
            onClick={() => onPageChange(page - 1)}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Previous
          </button>
          <button
            type="button"
            disabled={isLoading || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export { PAGE_SIZE }
