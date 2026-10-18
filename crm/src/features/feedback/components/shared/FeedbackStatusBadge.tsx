import { Clock, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { FeedbackStatus } from '@/features/feedback/types/feedback'
import { cn } from '@/lib/utils'

/**
 * Display-only — no resolve action or status transition exists
 * anywhere in this feature (approved Phase 7 scope: view-only).
 * 'open'/'resolved' are the minimal illustrative status values, not a
 * finalized workflow model.
 */
const CONFIG: Record<FeedbackStatus, { label: string; icon: typeof Clock; className: string }> = {
  open: { label: 'Open', icon: Clock, className: 'text-warning' },
  resolved: { label: 'Resolved', icon: CheckCircle2, className: 'text-success' },
}

export function FeedbackStatusBadge({ status }: { status: FeedbackStatus }) {
  const { label, icon: Icon, className } = CONFIG[status]

  return (
    <Badge variant="outline" className={cn('gap-1', className)}>
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}
