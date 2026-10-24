import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { OrderStatus } from '@/features/orders/types/order'
import { cn } from '@/lib/utils'

/** White rounded panel used across the desktop dashboard (reference style). */
export function Panel({
  title,
  action,
  children,
  className,
  titleClassName,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
  titleClassName?: string
}) {
  return (
    <section className={cn('flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)]', className)}>
      <div className="flex items-center justify-between gap-2">
        <h2 className={cn('text-card-title font-bold whitespace-nowrap', titleClassName)}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function ViewAll({ to, label = 'View All' }: { to: string; label?: string }) {
  return (
    <Link to={to} className="text-body-sm font-medium text-brand-primary hover:underline">
      {label}
    </Link>
  )
}

const STATUS_PILL: Record<OrderStatus, { label: string; className: string }> = {
  placed: { label: 'New', className: 'bg-success/15 text-success' },
  confirmed: { label: 'Confirmed', className: 'bg-success/15 text-success' },
  preparing: { label: 'Preparing', className: 'bg-brand-accent-soft text-[#9a6a00]' },
  ready: { label: 'Ready', className: 'bg-info/15 text-info' },
  outForDelivery: { label: 'Out for delivery', className: 'bg-brand-accent-soft text-[#9a6a00]' },
  delivered: { label: 'Delivered', className: 'bg-muted text-muted-foreground' },
  completed: { label: 'Completed', className: 'bg-muted text-muted-foreground' },
  cancelled: { label: 'Cancelled', className: 'bg-destructive/10 text-destructive' },
}

export function StatusPill({ status }: { status: OrderStatus }) {
  const { label, className } = STATUS_PILL[status]
  return <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-caption font-medium whitespace-nowrap', className)}>{label}</span>
}
