import { AlertTriangle } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

/** Mirrors LoyaltyErrorState/OrderErrorState exactly, parameterized per screen. */
export function AnalyticsErrorState({
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
        <h2 className="text-section-title font-semibold">Couldn't load analytics</h2>
        <p className="mt-1 text-body text-muted-foreground">{message}</p>
      </div>
      <button type="button" onClick={onRetry} className={buttonVariants({ variant: 'default' })}>
        Retry
      </button>
    </div>
  )
}
