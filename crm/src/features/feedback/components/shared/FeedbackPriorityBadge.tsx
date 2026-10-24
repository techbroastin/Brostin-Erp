import { AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

/**
 * Book 3 §9: "Feedback Inbox: Managers can view and prioritize
 * feedback requiring attention." This badge, plus the priority sort
 * in feedbackService.listFeedback, is the actual prioritization — see
 * isFeedbackNeedsAttention in feedbackService.ts for the rule.
 */
export function FeedbackPriorityBadge() {
  return (
    <Badge variant="outline" className="gap-1 text-destructive">
      <AlertTriangle className="size-3" />
      Needs attention
    </Badge>
  )
}
