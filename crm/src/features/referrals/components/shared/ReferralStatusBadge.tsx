import { Clock, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { ReferralStatus } from '@/features/referrals/types/referral'
import { cn } from '@/lib/utils'

/**
 * Display-only — no status-changing action exists anywhere in this
 * feature (approved Phase 8 scope: view-only). 'pending'/'completed' are
 * the two minimal illustrative status values, purely descriptive demo
 * data, not a finalized qualification workflow. Mirrors
 * FeedbackStatusBadge's icon + text + color pairing — status is never
 * conveyed by color alone.
 */
const CONFIG: Record<ReferralStatus, { label: string; icon: typeof Clock; className: string }> = {
  pending: { label: 'Pending', icon: Clock, className: 'text-warning' },
  completed: { label: 'Completed', icon: CheckCircle2, className: 'text-success' },
}

export function ReferralStatusBadge({ status }: { status: ReferralStatus }) {
  const { label, icon: Icon, className } = CONFIG[status]

  return (
    <Badge variant="outline" className={cn('gap-1', className)}>
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}
