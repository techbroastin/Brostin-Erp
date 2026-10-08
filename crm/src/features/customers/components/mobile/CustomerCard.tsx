import { Link } from 'react-router-dom'
import { Phone, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Customer } from '@/features/customers/types/customer'

/**
 * docs/MOBILE_UI_SPEC.md §13 — name, phone, last order, order count,
 * loyalty information, relevant alert. "Customer status" is intentionally
 * omitted — no status taxonomy is defined anywhere in canonical docs.
 */
export function CustomerCard({ customer }: { customer: Customer }) {
  return (
    <Link to={`/customers/${customer.id}`}>
      <Card>
        <CardContent className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-body font-medium">{customer.name}</p>
            {customer.loyaltyPoints != null && (
              <span className="shrink-0 text-caption text-muted-foreground">
                {customer.loyaltyPoints} pts
              </span>
            )}
          </div>
          <p className="flex items-center gap-1.5 text-body-sm text-muted-foreground">
            <Phone className="size-3.5 shrink-0" />
            {customer.phone}
          </p>
          <p className="text-caption text-muted-foreground">
            {customer.lastOrderAt
              ? `Last order ${new Date(customer.lastOrderAt).toLocaleDateString()} · ${customer.orderCount} order${customer.orderCount === 1 ? '' : 's'}`
              : 'No orders yet'}
          </p>
          {customer.alert && (
            <p className="mt-1 flex items-center gap-1.5 text-caption text-warning">
              <AlertCircle className="size-3.5 shrink-0" />
              {customer.alert}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

export function CustomerCardSkeleton() {
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
