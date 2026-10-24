import { useState } from 'react'
import { Star, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import { useOrderDetail } from '@/features/orders/hooks/useOrderDetail'
import { useFeedbackByOrderId } from '@/features/feedback/hooks/useFeedbackByOrderId'
import { useSubmitFeedbackRating } from '@/features/feedback/hooks/useSubmitFeedbackRating'
import { useSettingsGeneral } from '@/features/settings/hooks/useSettingsGeneral'
import { classifyFeedbackRating } from '@/features/feedback/utils/reviewClassification'

const textareaClassName =
  'min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-body-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

/**
 * Book 3 §9 Feedback Capture — customer-facing, reached via QR/link at
 * /review/:orderId (see router.tsx). Deliberately has no CRM shell
 * (no sidebar, no manager navigation) — a standalone, centered,
 * mobile-first card that also reads fine on desktop.
 *
 * Rating is recorded via the real submitFeedbackRating service (mock,
 * session-only — nothing here is persisted to a real backend). The
 * public-review action only ever opens a URL an owner has actually
 * configured in Settings → General; if none is set, this renders an
 * honest "not configured yet" message instead of a fake/broken link.
 * No manager push alert is sent for the private-alert path — there is
 * no notification provider anywhere in this project.
 */
export function PublicFeedbackCaptureContent({ orderId }: { orderId: string }) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  const { data: order, isPending: orderPending, isError: orderError } = useOrderDetail(orderId)
  const { data: existingFeedback, isPending: existingPending } = useFeedbackByOrderId(orderId)
  const { data: generalSettings } = useSettingsGeneral()
  const submitRating = useSubmitFeedbackRating()

  if (orderPending || existingPending) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 p-4">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (orderError || !order) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 p-4 text-center">
        <AlertTriangle className="size-8 text-destructive" />
        <h1 className="text-page-title font-semibold">This link isn't valid</h1>
        <p className="text-body-sm text-muted-foreground">
          This feedback link appears to be invalid or may have expired. Please check the link and
          try again.
        </p>
      </div>
    )
  }

  if (existingFeedback || submitRating.isSuccess) {
    const rating = submitRating.data?.rating ?? existingFeedback?.rating ?? null
    const route = rating !== null ? classifyFeedbackRating(rating) : null
    const reviewUrl = generalSettings?.publicReviewUrl ?? null

    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 p-4 text-center">
        <CheckCircle2 className="size-8 text-success" />
        <h1 className="text-page-title font-semibold">Thank you!</h1>
        <p className="text-body-sm text-muted-foreground">
          {route === 'private_alert'
            ? "We've shared your feedback with the team and will follow up."
            : "We're glad you enjoyed it."}
        </p>

        {route === 'public_prompt' &&
          (reviewUrl ? (
            <a href={reviewUrl} target="_blank" rel="noreferrer" className={buttonVariants({ variant: 'default' })}>
              Leave a public review
            </a>
          ) : (
            <p className="text-caption text-muted-foreground">
              A public review link isn't configured yet — thanks for the kind words!
            </p>
          ))}
      </div>
    )
  }

  const route = selectedRating !== null ? classifyFeedbackRating(selectedRating) : null

  const handleSubmit = () => {
    if (selectedRating === null) return
    submitRating.mutate({
      customerId: order.customerId,
      orderId: order.id,
      rating: selectedRating,
      message: message.trim() || undefined,
    })
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>How was order {order.orderNumber}?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex justify-center gap-1" role="radiogroup" aria-label="Rating, 1 to 5 stars">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selectedRating === value}
                aria-label={`${value} star${value === 1 ? '' : 's'}`}
                onClick={() => setSelectedRating(value)}
                className="p-1"
              >
                <Star
                  className={
                    selectedRating !== null && value <= selectedRating
                      ? 'size-9 fill-warning text-warning'
                      : 'size-9 text-muted-foreground'
                  }
                />
              </button>
            ))}
          </div>

          {selectedRating !== null && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="feedback-message" className="text-body-sm font-medium">
                {route === 'private_alert' ? 'Tell us what went wrong (optional)' : 'Anything you’d like to add? (optional)'}
              </label>
              <textarea
                id="feedback-message"
                className={textareaClassName}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          )}

          {submitRating.isError && (
            <p className="text-body-sm text-destructive">
              {submitRating.error instanceof Error
                ? submitRating.error.message
                : 'Something went wrong. Please try again.'}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedRating === null || submitRating.isPending}
            className={buttonVariants({ variant: 'default' })}
          >
            {submitRating.isPending ? 'Submitting…' : 'Submit feedback'}
          </button>
        </CardFooter>
      </Card>
    </div>
  )
}
