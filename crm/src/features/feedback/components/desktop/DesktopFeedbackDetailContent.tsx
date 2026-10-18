import { Link } from 'react-router-dom'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { CardSectionHeading } from '@/components/shared/CardSectionHeading'
import { FeedbackSentimentBadge } from '@/features/feedback/components/shared/FeedbackSentimentBadge'
import { FeedbackStatusBadge } from '@/features/feedback/components/shared/FeedbackStatusBadge'
import type { FeedbackItem } from '@/features/feedback/types/feedback'

/** docs/DESKTOP_UI_SPEC.md — denser multi-column layout. View-only — no reply/resolve action. */
export function DesktopFeedbackDetailContent({ feedback }: { feedback: FeedbackItem }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-page-title font-semibold">Feedback from {feedback.customerName}</h1>
          <FeedbackSentimentBadge sentiment={feedback.sentiment} />
          <FeedbackStatusBadge status={feedback.status} />
        </div>
        <span className="text-body-sm text-muted-foreground">
          {new Date(feedback.createdAt).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardSectionHeading>Customer</CardSectionHeading>
          </CardHeader>
          <CardContent>
            <Link
              to={`/customers/${feedback.customerId}`}
              className="text-body font-medium underline-offset-4 hover:underline"
            >
              {feedback.customerName}
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardSectionHeading>Feedback</CardSectionHeading>
        </CardHeader>
        <CardContent>
          <p className="text-body">{feedback.message}</p>
        </CardContent>
      </Card>
    </div>
  )
}
