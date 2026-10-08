import type { LucideIcon } from 'lucide-react'

/**
 * Per-section empty state — docs/DESIGN_SYSTEM.md §42. Used inside
 * ActivityList/AlertList individually, not for the whole Dashboard.
 */
export function DashboardEmptyState({
  icon: Icon,
  message,
}: {
  icon: LucideIcon
  message: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
      <Icon className="size-6" />
      <p className="text-body-sm">{message}</p>
    </div>
  )
}
