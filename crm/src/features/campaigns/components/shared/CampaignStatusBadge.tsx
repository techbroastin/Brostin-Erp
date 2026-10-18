import { FileEdit, Clock, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { CampaignStatus } from '@/features/campaigns/types/campaign'
import { cn } from '@/lib/utils'

/**
 * PROVISIONAL status presentation — no campaign status taxonomy is
 * named anywhere in docs/NAVIGATION.md §11 or
 * docs/IMPLEMENTATION_PLAN.md §18. Mirrors OrderStatusBadge's own
 * "PROVISIONAL" treatment exactly — not a finalized Broastin business
 * rule. 'sent' here means "marked as sent in mock data," never an
 * actual delivery event.
 */
const STATUS_CONFIG: Record<CampaignStatus, { label: string; icon: typeof FileEdit; className: string }> = {
  draft: { label: 'Draft', icon: FileEdit, className: 'text-muted-foreground' },
  scheduled: { label: 'Scheduled', icon: Clock, className: 'text-warning' },
  sent: { label: 'Sent', icon: CheckCircle2, className: 'text-success' },
}

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const { label, icon: Icon, className } = STATUS_CONFIG[status]

  return (
    <Badge variant="outline" className={cn('gap-1', className)}>
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}
