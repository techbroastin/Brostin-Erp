import { BellOff, Info, AlertTriangle, OctagonAlert } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardEmptyState } from '@/features/dashboard/components/shared/DashboardEmptyState'
import type { AlertItem, AlertSeverity } from '@/features/dashboard/types/dashboard'
import { cn } from '@/lib/utils'

const severityConfig: Record<AlertSeverity, { icon: typeof Info; className: string }> = {
  info: { icon: Info, className: 'text-info' },
  warning: { icon: AlertTriangle, className: 'text-warning' },
  error: { icon: OctagonAlert, className: 'text-destructive' },
}

export function AlertList({ items }: { items: AlertItem[] }) {
  if (items.length === 0) {
    return <DashboardEmptyState icon={BellOff} message="No alerts right now." />
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => {
        const { icon: Icon, className } = severityConfig[item.severity]
        return (
          <li key={item.id} className="flex items-start gap-2">
            <Icon className={cn('mt-0.5 size-4 shrink-0', className)} />
            <p className="text-body-sm">{item.message}</p>
          </li>
        )
      })}
    </ul>
  )
}

export function AlertListSkeleton() {
  return (
    <ul className="flex flex-col gap-3">
      {[0, 1].map((i) => (
        <li key={i} className="flex items-start gap-2">
          <Skeleton className="mt-0.5 size-4 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-full" />
        </li>
      ))}
    </ul>
  )
}
