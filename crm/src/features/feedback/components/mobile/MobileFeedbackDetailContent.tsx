import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { FeedbackSentimentBadge } from '@/features/feedback/components/shared/FeedbackSentimentBadge'
import { FeedbackStatusBadge } from '@/features/feedback/components/shared/FeedbackStatusBadge'
import type { FeedbackItem } from '@/features/feedback/types/feedback'

/**
 * docs/MOBILE_UI_SPEC.md §17. View-only — no reply/resolve action.
 * h2, not h1 — MobileHeader already renders this screen's page h1.
 */
export function MobileFeedbackDetailContent({ feedback }: { feedback: FeedbackItem }) {
  return (
    <div className="flex flex-col gap-6 p-4">
      <section className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-page-title font-semibold">Feedback</h2>
          <FeedbackSentimentBadge sentiment={feedback.sentiment} />
        </div>
        <div className="flex items-center justify-between gap-2">
          <Link
            to={`/customers/${feedback.customerId}`}
            className="text-body font-medium underline-offset-4 hover:underline"
          >
            {feedback.customerName}
          </Link>
          <FeedbackStatusBadge status={feedback.status} />
        </div>
        <p className="text-body-sm text-muted-foreground">
          {new Date(feedback.createdAt).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-section-title font-semibold">Message</h2>
        <Card>
          <CardContent>
            <p className="text-body">{feedback.message}</p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
