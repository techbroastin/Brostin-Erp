import { UserPlus, RefreshCw, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { MembershipActivityType } from '@/features/membership/types/membership'
import { cn } from '@/lib/utils'

/**
 * Display-only — illustrative historical event labels, not a renewal
 * or expiry business-logic engine. Icon + text + color, never color
 * alone.
 */
const CONFIG: Record<MembershipActivityType, { label: string; icon: typeof UserPlus; className: string }> = {
  joined: { label: 'Joined', icon: UserPlus, className: 'text-success' },
  renewed: { label: 'Renewed', icon: RefreshCw, className: 'text-info' },
  expired: { label: 'Expired', icon: XCircle, className: 'text-muted-foreground' },
}

export function MembershipActivityBadge({ type }: { type: MembershipActivityType }) {
  const { label, icon: Icon, className } = CONFIG[type]

  return (
    <Badge variant="outline" className={cn('gap-1', className)}>
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}
