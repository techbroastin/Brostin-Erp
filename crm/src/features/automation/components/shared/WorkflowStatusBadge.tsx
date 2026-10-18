import { FileEdit, PlayCircle, PauseCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { WorkflowStatus } from '@/features/automation/types/automation'
import { cn } from '@/lib/utils'

/**
 * PROVISIONAL status presentation — no workflow status taxonomy is
 * named anywhere in docs/NAVIGATION.md §12 or
 * docs/IMPLEMENTATION_PLAN.md §19. Mirrors OrderStatusBadge/
 * CampaignStatusBadge's own "PROVISIONAL" treatment exactly. "Active"
 * here means "marked as active in mock data," never real monitoring
 * or execution.
 */
const STATUS_CONFIG: Record<WorkflowStatus, { label: string; icon: typeof FileEdit; className: string }> = {
  draft: { label: 'Draft', icon: FileEdit, className: 'text-muted-foreground' },
  active: { label: 'Active', icon: PlayCircle, className: 'text-success' },
  paused: { label: 'Paused', icon: PauseCircle, className: 'text-warning' },
}

export function WorkflowStatusBadge({ status }: { status: WorkflowStatus }) {
  const { label, icon: Icon, className } = STATUS_CONFIG[status]

  return (
    <Badge variant="outline" className={cn('gap-1', className)}>
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}
