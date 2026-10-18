import { CheckCircle2, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { MembershipStatus } from '@/features/membership/types/membership'
import { cn } from '@/lib/utils'

/**
 * Display-only — no status-changing action exists anywhere in this
 * feature (approved Phase 9 scope: view-only). 'active'/'expired' are
 * the two minimal illustrative status values, purely descriptive demo
 * data, not an automated billing/renewal lifecycle. Mirrors
 * ReferralStatusBadge's icon + text + color pairing — status is never
 * conveyed by color alone.
 */
const CONFIG: Record<MembershipStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  active: { label: 'Active', icon: CheckCircle2, className: 'text-success' },
  expired: { label: 'Expired', icon: XCircle, className: 'text-muted-foreground' },
}

export function MembershipStatusBadge({ status }: { status: MembershipStatus }) {
  const { label, icon: Icon, className } = CONFIG[status]

  return (
    <Badge variant="outline" className={cn('gap-1', className)}>
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}
