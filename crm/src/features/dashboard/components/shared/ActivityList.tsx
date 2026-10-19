import { Link } from 'react-router-dom'
import { Activity } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardEmptyState } from '@/features/dashboard/components/shared/DashboardEmptyState'
import type { ActivityItem } from '@/features/dashboard/types/dashboard'

/** Each item links to its real source record when `href` is set — see dashboard.mock.ts. */
export function ActivityList({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <DashboardEmptyState icon={Activity} message="No recent activity yet." />
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => {
        const content = (
          <>
            <div className="min-w-0">
              <p className="truncate text-body font-medium">{item.title}</p>
              <p className="truncate text-body-sm text-muted-foreground">{item.detail}</p>
            </div>
            <span className="shrink-0 text-caption text-muted-foreground">{item.timestamp}</span>
          </>
        )

        return (
          <li key={item.id}>
            {item.href ? (
              <Link
                to={item.href}
                className="flex items-start justify-between gap-3 rounded-md -mx-1 px-1 py-0.5 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {content}
              </Link>
            ) : (
              <div className="flex items-start justify-between gap-3">{content}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export function ActivityListSkeleton() {
  return (
    <ul className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <li key={i} className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-3 w-12 shrink-0" />
        </li>
      ))}
    </ul>
  )
}
