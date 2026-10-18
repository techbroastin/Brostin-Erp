import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FeedbackSentimentBadge } from '@/features/feedback/components/shared/FeedbackSentimentBadge'
import { FeedbackStatusBadge } from '@/features/feedback/components/shared/FeedbackStatusBadge'
import type { FeedbackItem } from '@/features/feedback/types/feedback'

/**
 * docs/MOBILE_UI_SPEC.md §17 — customer, rating/sentiment, short
 * feedback, time, status, action. "Action" is tapping through to detail
 * (view-only — no reply/resolve/assign anywhere in this feature).
 */
export function FeedbackCard({ feedback }: { feedback: FeedbackItem }) {
  return (
    <Link to={`/feedback/${feedback.id}`}>
      <Card>
        <CardContent className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-body font-medium">{feedback.customerName}</p>
            <FeedbackSentimentBadge sentiment={feedback.sentiment} />
          </div>
          <p className="line-clamp-2 text-body-sm text-muted-foreground">{feedback.message}</p>
          <div className="flex items-center justify-between text-caption text-muted-foreground">
            <span>
              {new Date(feedback.createdAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
            <FeedbackStatusBadge status={feedback.status} />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function FeedbackCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3 w-1/3" />
      </CardContent>
    </Card>
  )
}
