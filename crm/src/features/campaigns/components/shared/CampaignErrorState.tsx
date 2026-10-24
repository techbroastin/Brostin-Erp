import { AlertTriangle } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

/** Mirrors AnalyticsErrorState/LoyaltyErrorState exactly, parameterized per screen. */
export function CampaignErrorState({
  title = "Couldn't load campaigns",
  message,
  onRetry,
}: {
  title?: string
  message: string
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <AlertTriangle className="size-8 text-destructive" />
      <div>
        <h2 className="text-section-title font-semibold">{title}</h2>
        <p className="mt-1 text-body text-muted-foreground">{message}</p>
      </div>
      <button type="button" onClick={onRetry} className={buttonVariants({ variant: 'default' })}>
        Retry
      </button>
    </div>
  )
}
