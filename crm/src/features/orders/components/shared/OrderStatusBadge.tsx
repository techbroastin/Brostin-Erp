import { CheckCircle2, Clock, Circle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { OrderStatus } from '@/features/orders/types/order'
import { cn } from '@/lib/utils'

/**
 * PROVISIONAL status presentation — docs/NAVIGATION.md §9.1 and
 * docs/MOBILE_UI_SPEC.md §15 both mark exact order status values/labels
 * as NOT YET FINALIZED. The labels and semantic-tier grouping below are
 * a reasonable placeholder mapping onto the existing enum, not a
 * finalized Broastin business rule — do not treat this as locked.
 */
const STATUS_CONFIG: Record<OrderStatus, { label: string; tier: 'info' | 'warning' | 'success' | 'destructive' }> = {
  placed: { label: 'Placed', tier: 'info' },
  confirmed: { label: 'Confirmed', tier: 'info' },
  preparing: { label: 'Preparing', tier: 'warning' },
  ready: { label: 'Ready', tier: 'warning' },
  outForDelivery: { label: 'Out for Delivery', tier: 'warning' },
  delivered: { label: 'Delivered', tier: 'success' },
  completed: { label: 'Completed', tier: 'success' },
  cancelled: { label: 'Cancelled', tier: 'destructive' },
}

const TIER_STYLE: Record<string, { icon: typeof Circle; className: string }> = {
  info: { icon: Circle, className: 'text-info' },
  warning: { icon: Clock, className: 'text-warning' },
  success: { icon: CheckCircle2, className: 'text-success' },
  destructive: { icon: XCircle, className: 'text-destructive' },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, tier } = STATUS_CONFIG[status]
  const { icon: Icon, className } = TIER_STYLE[tier]

  return (
    <Badge variant="outline" className={cn('gap-1', className)}>
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}
