import { AlertTriangle } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

/**
 * Mirrors LoyaltyErrorState/FeedbackErrorState exactly — docs/
 * FRONTEND_ARCHITECTURE.md §21. No technical detail shown.
 */
export function ReferralErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <AlertTriangle className="size-8 text-destructive" />
      <div>
        <h2 className="text-section-title font-semibold">{message}</h2>
        <p className="mt-1 text-body text-muted-foreground">
          Something went wrong. Please try again.
        </p>
      </div>
      <button type="button" onClick={onRetry} className={buttonVariants({ variant: 'default' })}>
        Retry
      </button>
    </div>
  )
}
