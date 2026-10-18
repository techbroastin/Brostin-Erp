import { ThumbsUp, Minus, ThumbsDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { FeedbackSentiment } from '@/features/feedback/types/feedback'
import { cn } from '@/lib/utils'

/**
 * Mirrors OrderStatusBadge/LoyaltyEventBadge's pairing of icon + text +
 * color — docs/MOBILE_UI_SPEC.md §17: "Negative feedback must be easy to
 * identify without relying only on color." 'positive'/'neutral'/
 * 'negative' are the minimal illustrative sentiment values approved for
 * Phase 7, not a finalized rating scale.
 */
const CONFIG: Record<FeedbackSentiment, { label: string; icon: typeof ThumbsUp; className: string }> = {
  positive: { label: 'Positive', icon: ThumbsUp, className: 'text-success' },
  neutral: { label: 'Neutral', icon: Minus, className: 'text-muted-foreground' },
  negative: { label: 'Negative', icon: ThumbsDown, className: 'text-destructive' },
}

export function FeedbackSentimentBadge({ sentiment }: { sentiment: FeedbackSentiment }) {
  const { label, icon: Icon, className } = CONFIG[sentiment]

  return (
    <Badge variant="outline" className={cn('gap-1', className)}>
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}
