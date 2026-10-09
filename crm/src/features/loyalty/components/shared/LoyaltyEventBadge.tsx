import { PlusCircle, MinusCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { LoyaltyEventType } from '@/features/loyalty/types/loyalty'
import { cn } from '@/lib/utils'

/**
 * Mirrors OrderStatusBadge's pairing of icon + text + color — status is
 * never conveyed by color alone (docs/FRONTEND_ARCHITECTURE.md §23).
 * 'earned'/'redeemed' are the two minimal illustrative event types
 * approved for Phase 6, not a finalized taxonomy.
 */
const CONFIG: Record<LoyaltyEventType, { label: string; icon: typeof PlusCircle; className: string }> = {
  earned: { label: 'Earned', icon: PlusCircle, className: 'text-success' },
  redeemed: { label: 'Redeemed', icon: MinusCircle, className: 'text-info' },
}

export function LoyaltyEventBadge({ type }: { type: LoyaltyEventType }) {
  const { label, icon: Icon, className } = CONFIG[type]

  return (
    <Badge variant="outline" className={cn('gap-1', className)}>
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}
