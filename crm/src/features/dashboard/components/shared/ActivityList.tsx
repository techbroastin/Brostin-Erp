import { Activity } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardEmptyState } from '@/features/dashboard/components/shared/DashboardEmptyState'
import type { ActivityItem } from '@/features/dashboard/types/dashboard'

export function ActivityList({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <DashboardEmptyState icon={Activity} message="No recent activity yet." />
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.id} className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-body font-medium">{item.title}</p>
            <p className="truncate text-body-sm text-muted-foreground">{item.detail}</p>
          </div>
          <span className="shrink-0 text-caption text-muted-foreground">{item.timestamp}</span>
        </li>
      ))}
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
