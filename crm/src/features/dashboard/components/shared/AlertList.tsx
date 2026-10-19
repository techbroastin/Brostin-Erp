import { Link } from 'react-router-dom'
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

/** Each alert links to where it can be resolved when `href` is set — see dashboard.mock.ts. */
export function AlertList({ items }: { items: AlertItem[] }) {
  if (items.length === 0) {
    return <DashboardEmptyState icon={BellOff} message="No alerts right now." />
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => {
        const { icon: Icon, className } = severityConfig[item.severity]
        const content = (
          <>
            <Icon className={cn('mt-0.5 size-4 shrink-0', className)} />
            <p className="text-body-sm">{item.message}</p>
          </>
        )

        return (
          <li key={item.id}>
            {item.href ? (
              <Link
                to={item.href}
                className="flex items-start gap-2 rounded-md -mx-1 px-1 py-0.5 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {content}
              </Link>
            ) : (
              <div className="flex items-start gap-2">{content}</div>
            )}
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
