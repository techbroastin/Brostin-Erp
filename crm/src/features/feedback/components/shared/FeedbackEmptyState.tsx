import { MessageSquare, SearchX } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Three distinct empty states, same discipline as OrderEmptyState: a
 * genuinely empty dataset, a search that returned no results, and a
 * sentiment-filter combination that returned no results with no search
 * term — these must stay distinct so the generic "no feedback" message
 * never appears when a filter (e.g. Negative Feedback) is simply empty.
 */
export function FeedbackEmptyState({
  search,
  hasOtherFilters = false,
  message,
  onClearSearch,
}: {
  search?: string
  hasOtherFilters?: boolean
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

  if (hasOtherFilters) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <SearchX className="size-8 text-muted-foreground" />
        <div>
          <p className="text-body font-medium">No feedback matches the selected filter.</p>
          <p className="mt-1 text-body-sm text-muted-foreground">Try different filters.</p>
        </div>
        <button
          type="button"
          onClick={onClearSearch}
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          Clear filter
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <MessageSquare className="size-8 text-muted-foreground" />
      <p className="text-body font-medium">{message}</p>
    </div>
  )
}
