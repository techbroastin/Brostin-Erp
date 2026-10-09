import { Gift, SearchX } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Two distinct empty states, same discipline as
 * OrderEmptyState/CustomerEmptyState: a genuinely empty dataset ("no
 * customer balances/rewards/activity exist") vs a search that returned
 * no results — these must never show the same message (confirmed
 * critical during Phase 5 testing).
 */
export function LoyaltyEmptyState({
  search,
  message,
  onClearSearch,
}: {
  search?: string
  message: string
  onClearSearch?: () => void
}) {
  if (search) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <SearchX className="size-8 text-muted-foreground" />
        <div>
          <p className="text-body font-medium">No results match "{search}"</p>
          <p className="mt-1 text-body-sm text-muted-foreground">Try a different search term.</p>
        </div>
        <button
          type="button"
          onClick={onClearSearch}
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          Clear search
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <Gift className="size-8 text-muted-foreground" />
      <p className="text-body font-medium">{message}</p>
    </div>
  )
}
